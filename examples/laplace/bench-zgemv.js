#!/usr/bin/env node
// Microbenchmark for zgemv to establish baseline throughput.
// Tests the actual hot paths: trans='N' and trans='C' with alpha=±1, beta=0 or 1.

import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import zgemv from '../../lib/blas/zgemv/lib/base.js';

const CONE = new Complex128(1.0, 0.0);
const CMONE = new Complex128(-1.0, 0.0);
const CZERO = new Complex128(0.0, 0.0);

function bench(label, trans, M, N, alpha, beta, iters) {
  const A = new Complex128Array(M * N);
  const x = new Complex128Array(trans === 'no-transpose' ? N : M);
  const y = new Complex128Array(trans === 'no-transpose' ? M : N);

  // Fill with non-zero data to avoid zero-skip optimizations
  const av = new Float64Array(A.buffer);
  const xv = new Float64Array(x.buffer);
  for (let i = 0; i < av.length; i++) av[i] = (i % 7) * 0.1 - 0.3;
  for (let i = 0; i < xv.length; i++) xv[i] = (i % 5) * 0.2 - 0.5;

  // Warmup
  for (let k = 0; k < 10; k++) {
    zgemv(trans, M, N, alpha, A, 1, M, 0, x, 1, 0, beta, y, 1, 0);
  }

  const t0 = performance.now();
  for (let k = 0; k < iters; k++) {
    zgemv(trans, M, N, alpha, A, 1, M, 0, x, 1, 0, beta, y, 1, 0);
  }
  const elapsed = performance.now() - t0;

  const flops = 8 * M * N * iters;
  const gflops = flops / (elapsed * 1e6);
  const usPerCall = (elapsed * 1000) / iters;

  console.log(`  ${label.padEnd(40)} ${usPerCall.toFixed(1).padStart(8)}µs/call  ${gflops.toFixed(2).padStart(6)} GFLOPS`);
}

console.log('=== zgemv microbenchmark ===\n');

// Sizes matching the actual workload profile
const sizes = [
  [100, 10],
  [200, 32],
  [572, 100],
  [572, 234],
  [804, 233],
];

for (const [M, N] of sizes) {
  console.log(`--- M=${M}, N=${N} (${(8*M*N/1e6).toFixed(1)}M FLOP/call) ---`);
  const iters = Math.max(10, Math.ceil(2000 / (M * N / 10000)));

  bench(`trans=N, alpha=1, beta=0`, 'no-transpose', M, N, CONE, CZERO, iters);
  bench(`trans=N, alpha=-1, beta=1`, 'no-transpose', M, N, CMONE, CONE, iters);
  bench(`trans=C, alpha=1, beta=0`, 'conjugate-transpose', M, N, CONE, CZERO, iters);
  bench(`trans=C, alpha=-1, beta=1`, 'conjugate-transpose', M, N, CMONE, CONE, iters);
  console.log('');
}

// Also measure the overhead of just calling zgemv with M=0 (no work)
const iters0 = 100000;
const A0 = new Complex128Array(1);
const x0 = new Complex128Array(1);
const y0 = new Complex128Array(1);
const t0 = performance.now();
for (let k = 0; k < iters0; k++) {
  zgemv('no-transpose', 0, 0, CONE, A0, 1, 1, 0, x0, 1, 0, CZERO, y0, 1, 0);
}
const overhead = (performance.now() - t0) * 1000 / iters0;
console.log(`Call overhead (M=N=0): ${overhead.toFixed(3)}µs`);
console.log(`Over 365K calls: ${(overhead * 365743 / 1e6).toFixed(1)}ms`);
