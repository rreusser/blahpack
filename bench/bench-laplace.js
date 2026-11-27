#!/usr/bin/env node

// Profile the Laplace solver end-to-end.
//
// Instruments every LAPACK/BLAS subroutine the solve calls, and reports the
// existing AAA-level timings.
//
// Usage:
//   node bench/bench-laplace.js
//   node bench/bench-laplace.js --step 0.005

import instrument from './instrument.js';

// Install BEFORE loading anything that transitively requires LAPACK
instrument.install();

const { laplace, pointInPolygon } = await import('../examples/laplace/laplace.js');
const aaaMod = await import('../examples/aaa-pure.js');
const aaaTimings = aaaMod.timings;

// CONFIGURATION //

const STEP = parseFloat(process.env.STEP || '0.01');
const argv = process.argv.slice(2);
let step = STEP;
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === '--step' && argv[i + 1]) {
    step = parseFloat(argv[i + 1]);
    i++;
  }
}

// BUILD PROBLEM //

function linspace(a, b, stp) {
  const arr = [];
  if (a <= b) for (let x = a; x <= b + stp / 2; x += stp) arr.push(x);
  else for (let x = a; x >= b - stp / 2; x -= stp) arr.push(x);
  return arr;
}

const vertices = [[0, 0], [2, 0], [2, 1], [1, 1], [1, 2], [0, 2]];
const boundary = [];
for (const x of linspace(0, 2, step)) boundary.push([x, 0]);
for (const y of linspace(0, 1, step)) boundary.push([2, y]);
for (const x of linspace(2, 1, step)) boundary.push([x, 1]);
for (const y of linspace(1, 2, step)) boundary.push([1, y]);
for (const x of linspace(1, 0, step)) boundary.push([x, 2]);
for (const y of linspace(2, 0, step)) boundary.push([0, y]);

const boundaryValues = boundary.map(([x]) => x * x);

console.log('');
console.log('='.repeat(80));
console.log('  LAPLACE SOLVER PROFILING');
console.log('  Boundary: ' + boundary.length + ' points (step=' + step + ')');
console.log('='.repeat(80));

// WARMUP //
console.log('\n  Warmup...');
laplace(boundary, boundaryValues, vertices, { center: [0.5, 0.5], interior: true });

// PROFILED RUN //
instrument.reset();
aaaTimings.reset();

console.log('  Running profiled solve...\n');
const t0 = performance.now();
const result = laplace(boundary, boundaryValues, vertices, { center: [0.5, 0.5], interior: true });
const totalMs = performance.now() - t0;

// AAA-level timings
const aaa = aaaTimings;
const lssolveMs = totalMs - aaa.total;

console.log('  Total: ' + totalMs.toFixed(1) + 'ms');
console.log('  Max boundary error: ' + result.maxError.toExponential(2));
console.log('  Poles: ' + result.allPoles.length + ' total, ' + result.poles.length + ' interior');
console.log('  AAA iterations: ' + aaa.iters);

// PHASE BREAKDOWN //

console.log('');
console.log('-'.repeat(80));
console.log('  PHASE BREAKDOWN');
console.log('-'.repeat(80));
console.log('');

function bar(label, ms) {
  const pct = (ms / totalMs * 100);
  const len = Math.round(pct / 2);
  const b = '#'.repeat(len) + '.'.repeat(50 - len);
  console.log('  ' + label.padEnd(20) + b + ms.toFixed(1).padStart(8) + 'ms (' + pct.toFixed(1) + '%)');
}

bar('lssolve + other', lssolveMs);
bar('AAA total', aaa.total);
bar('  SVD', aaa.svd);
bar('  Cauchy build', aaa.cauchy);
bar('  A-matrix', aaa.aMatrix);
bar('  Rat. eval', aaa.ratEval);
bar('  PRZ (QZ)', aaa.prz);

// LAPACK SUBROUTINE PROFILE (from zgesvd calls) //

console.log('');
console.log('-'.repeat(80));
console.log('  LAPACK/BLAS SUBROUTINE PROFILE');
console.log('-'.repeat(80));

instrument.printReport(totalMs, { minPercent: 0.5 });
instrument.printCallTree('zgesvd', { maxDepth: 3, minPercent: 2.0 });

// PER-ITERATION //

if (aaa.iters > 0) {
  console.log('-'.repeat(80));
  console.log('  PER AAA ITERATION (' + aaa.iters + ' iterations)');
  console.log('-'.repeat(80));
  console.log('');
  console.log('  SVD:          ' + (aaa.svd / aaa.iters).toFixed(2) + ' ms/iter');
  console.log('  Cauchy build: ' + (aaa.cauchy / aaa.iters).toFixed(2) + ' ms/iter');
  console.log('  A-matrix:     ' + (aaa.aMatrix / aaa.iters).toFixed(2) + ' ms/iter');
  console.log('  Rat. eval:    ' + (aaa.ratEval / aaa.iters).toFixed(2) + ' ms/iter');
  console.log('  PRZ (QZ):     ' + (aaa.prz / aaa.iters).toFixed(2) + ' ms/iter');
}

console.log('');
