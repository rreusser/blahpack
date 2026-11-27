#!/usr/bin/env node
// Profile zgemv and zgemm call patterns during the AAA/Laplace solve.
// Instruments the actual BLAS calls to understand:
//   - Which trans/transa/transb combinations are used
//   - What matrix sizes M, N, K are typical
//   - What alpha/beta values appear (opportunities for specialization)

import real from '@stdlib/complex/float64/real/lib/index.js';
import imag from '@stdlib/complex/float64/imag/lib/index.js';
import instrument from '../../bench/instrument.js';

// Install BEFORE loading anything that imports the library.
instrument.install();

const zgemvStats = { calls: 0, byTrans: {}, sizes: [], alphaPatterns: {}, betaPatterns: {} };
const zgemmStats = { calls: 0, byTransA: {}, byTransB: {}, sizes: [], alphaPatterns: {}, betaPatterns: {} };

function scalarKey(z) {
  const r = real(z), i = imag(z);
  if (r === 1 && i === 0) return '1+0i';
  if (r === 0 && i === 0) return '0+0i';
  if (r === -1 && i === 0) return '-1+0i';
  return 'other';
}

instrument.observe('zgemv', (trans, M, N, alpha, A, sa1, sa2, oA, x, sx, ox, beta) => {
  zgemvStats.calls++;
  zgemvStats.byTrans[trans] = (zgemvStats.byTrans[trans] || 0) + 1;
  zgemvStats.sizes.push([M, N]);
  const ak = scalarKey(alpha);
  const bk = scalarKey(beta);
  zgemvStats.alphaPatterns[ak] = (zgemvStats.alphaPatterns[ak] || 0) + 1;
  zgemvStats.betaPatterns[bk] = (zgemvStats.betaPatterns[bk] || 0) + 1;
});

instrument.observe('zgemm', (ta, tb, M, N, K, alpha, A, sa1, sa2, oA, B, sb1, sb2, oB, beta) => {
  zgemmStats.calls++;
  zgemmStats.byTransA[ta] = (zgemmStats.byTransA[ta] || 0) + 1;
  zgemmStats.byTransB[tb] = (zgemmStats.byTransB[tb] || 0) + 1;
  zgemmStats.sizes.push([M, N, K]);
  const ak = scalarKey(alpha);
  const bk = scalarKey(beta);
  zgemmStats.alphaPatterns[ak] = (zgemmStats.alphaPatterns[ak] || 0) + 1;
  zgemmStats.betaPatterns[bk] = (zgemmStats.betaPatterns[bk] || 0) + 1;
});

// Now run the actual workload
const { laplace } = await import('./laplace.js');

function linspace(a, b, step) {
  const arr = [];
  if (a <= b) for (let x = a; x <= b + step/2; x += step) arr.push(x);
  else for (let x = a; x >= b - step/2; x -= step) arr.push(x);
  return arr;
}

const vertices = [[0,0], [2,0], [2,1], [1,1], [1,2], [0,2]];
const boundary = [];
for (const x of linspace(0, 2, 0.01)) boundary.push([x, 0]);
for (const y of linspace(0, 1, 0.01)) boundary.push([2, y]);
for (const x of linspace(2, 1, 0.01)) boundary.push([x, 1]);
for (const y of linspace(1, 2, 0.01)) boundary.push([1, y]);
for (const x of linspace(1, 0, 0.01)) boundary.push([x, 2]);
for (const y of linspace(2, 0, 0.01)) boundary.push([0, y]);

const boundaryValues = boundary.map(([x]) => x * x);

console.log('Running Laplace solver (mmax=1000)...\n');
const t0 = performance.now();
const result = laplace(boundary, boundaryValues, vertices, { center: [0.5, 0.5], interior: true });
const elapsed = performance.now() - t0;
console.log(`Done in ${(elapsed/1000).toFixed(1)}s, boundary error: ${result.maxError.toExponential(2)}\n`);

// Analyze zgemv
console.log('=== zgemv ===');
console.log(`Total calls: ${zgemvStats.calls}`);
console.log(`By trans: ${JSON.stringify(zgemvStats.byTrans)}`);
console.log(`Alpha patterns: ${JSON.stringify(zgemvStats.alphaPatterns)}`);
console.log(`Beta patterns: ${JSON.stringify(zgemvStats.betaPatterns)}`);

// Size distribution
const gemvSizes = zgemvStats.sizes;
let gemvMmin = Infinity, gemvMmax = 0, gemvNmin = Infinity, gemvNmax = 0;
let gemvFlops = 0;
for (const [m, n] of gemvSizes) {
  if (m < gemvMmin) gemvMmin = m;
  if (m > gemvMmax) gemvMmax = m;
  if (n < gemvNmin) gemvNmin = n;
  if (n > gemvNmax) gemvNmax = n;
  gemvFlops += 8 * m * n;
}
console.log(`M range: [${gemvMmin}, ${gemvMmax}]`);
console.log(`N range: [${gemvNmin}, ${gemvNmax}]`);
console.log(`Total FLOPS: ${(gemvFlops / 1e9).toFixed(2)} GFLOP`);
console.log(`Throughput: ${(gemvFlops / (elapsed * 1e6)).toFixed(2)} GFLOPS\n`);

// Analyze zgemm
console.log('=== zgemm ===');
console.log(`Total calls: ${zgemmStats.calls}`);
console.log(`By transA: ${JSON.stringify(zgemmStats.byTransA)}`);
console.log(`By transB: ${JSON.stringify(zgemmStats.byTransB)}`);
console.log(`Alpha patterns: ${JSON.stringify(zgemmStats.alphaPatterns)}`);
console.log(`Beta patterns: ${JSON.stringify(zgemmStats.betaPatterns)}`);

const gemmSizes = zgemmStats.sizes;
if (gemmSizes.length > 0) {
  let gemmMmin = Infinity, gemmMmax = 0, gemmNmin = Infinity, gemmNmax = 0;
  let gemmKmin = Infinity, gemmKmax = 0, gemmFlops = 0;
  for (const [m, n, k] of gemmSizes) {
    if (m < gemmMmin) gemmMmin = m;
    if (m > gemmMmax) gemmMmax = m;
    if (n < gemmNmin) gemmNmin = n;
    if (n > gemmNmax) gemmNmax = n;
    if (k < gemmKmin) gemmKmin = k;
    if (k > gemmKmax) gemmKmax = k;
    gemmFlops += 8 * m * n * k;
  }
  console.log(`M range: [${gemmMmin}, ${gemmMmax}]`);
  console.log(`N range: [${gemmNmin}, ${gemmNmax}]`);
  console.log(`K range: [${gemmKmin}, ${gemmKmax}]`);
  console.log(`Total FLOPS: ${(gemmFlops / 1e9).toFixed(2)} GFLOP`);
  console.log(`Throughput: ${(gemmFlops / (elapsed * 1e6)).toFixed(2)} GFLOPS`);
}
