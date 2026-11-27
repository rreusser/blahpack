// Tests for the notebook's AAA implementation and the solvers built on it.
// Run with `npm run test:notebooks`.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { aaa, feval } from './aaa-entry.js';
import { laplace, stokes } from './laplace-entry.js';

// n points on the unit circle that repeat with the given period.
function circle(n, period) {
  return Array.from({ length: n }, (_, i) => {
    const t = 2 * Math.PI * (i % period) / period;
    return [Math.cos(t), Math.sin(t)];
  });
}

const cexp = ([x, y]) => [Math.exp(x) * Math.cos(y), Math.exp(x) * Math.sin(y)];

// Largest error of the returned approximant over the samples, evaluated
// independently of the error history that aaa() reports.
function sampleError(r, Z, F) {
  const v = feval(Z, r.z, r.f, r.w);
  let e = 0;
  for (let i = 0; i < Z.length; i++) e = Math.max(e, Math.hypot(v[i][0] - F[i][0], v[i][1] - F[i][1]));
  return e;
}

function distinctCount(points) {
  return new Set(points.map((p) => p.join())).size;
}

test('exp(z) on the unit circle converges at the reference rate', () => {
  const Z = circle(200, 200);
  const F = Z.map(cexp);
  const r = aaa(Z, F, 1e-13, 50);
  assert.equal(r.converged, true);
  // [NST18] Fig. 1 / reference LAPACK: 8 iterations.
  assert.equal(r.errvec.length, 8);
  assert.ok(Math.abs(r.errvec[0] - 2.371) < 1e-3);
  assert.ok(sampleError(r, Z, F) < 1e-13);
});

test('duplicate sample points do not change the result (ticket 0113)', () => {
  const once = circle(60, 60);
  const ref = aaa(once, once.map(cexp), 1e-13, 20);
  for (const copies of [2, 5]) {
    const Z = circle(60 * copies, 60);
    const F = Z.map(cexp);
    const r = aaa(Z, F, 1e-13, 20);
    assert.equal(r.converged, true, copies + ' copies: converges');
    assert.equal(r.errvec.length, ref.errvec.length, copies + ' copies: same iteration count');
    assert.equal(distinctCount(r.z), r.z.length, copies + ' copies: no repeated support point');
    assert.ok(sampleError(r, Z, F) < 1e-13, copies + ' copies: small error at every sample');
  }
});

test('duplicates with conflicting values are reported, not hidden (ticket 0113)', () => {
  const Z = circle(120, 60);
  const F = Z.map(cexp);
  F[60] = [F[60][0] + 0.5, F[60][1]]; // same z as sample 0, different value
  const r = aaa(Z, F, 1e-13, 30);
  assert.equal(r.converged, false);
  assert.equal(distinctCount(r.z), r.z.length);
  // No function takes both values; the best possible error at that point is 0.25
  // and interpolating one of the two gives 0.5.
  const last = r.errvec.at(-1);
  assert.ok(last >= 0.25 && last <= 0.5 + 1e-12, 'reported error ' + last);
  assert.ok(Math.abs(sampleError(r, Z, F) - last) < 1e-9, 'reported error matches the approximant');
});

test('degenerate sample sets terminate with finite output', () => {
  let r = aaa([[1, 0]], [[2, 0]]);
  assert.equal(r.converged, true);
  r = aaa([[1, 0], [1, 0], [1, 0]], [[2, 0], [2, 0], [2, 0]]);
  assert.equal(r.converged, true);
  assert.equal(r.z.length, 1);
  r = aaa([[1, 0], [1, 0]], [[2, 0], [3, 0]]);
  assert.equal(r.converged, false);
  assert.equal(r.z.length, 1);
  assert.ok(r.w.flat().every(Number.isFinite));
});

test('running out of sample points uses the direct factorization', () => {
  // Data with no rational structure: the iteration runs until fewer sample
  // points than support points remain, past where the updated QR applies.
  let seed = 7;
  const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
  const Z = circle(40, 40);
  const F = Z.map(() => [rnd() - 0.5, rnd() - 0.5]);
  const r = aaa(Z, F, 1e-13, 1000);
  assert.equal(r.converged, true);
  assert.ok(r.z.length > 20, 'needed more support points than remaining samples');
  assert.ok(sampleError(r, Z, F) < 1e-9);
});

test('Laplace on the L-shaped domain, whose boundary repeats its corners', () => {
  const pts = [];
  const seg = (a, b, n) => { for (let i = 0; i <= n; i++) pts.push([a[0] + (b[0] - a[0]) * i / n, a[1] + (b[1] - a[1]) * i / n]); };
  const vertices = [[0, 0], [2, 0], [2, 1], [1, 1], [1, 2], [0, 2]];
  const counts = [80, 40, 40, 40, 40, 80];
  // Each side includes both endpoints, as the notebook builds it, so every
  // corner appears twice.
  vertices.forEach((v, i) => seg(v, vertices[(i + 1) % 6], counts[i]));
  assert.ok(distinctCount(pts) < pts.length);
  const sol = laplace(pts, pts.map(([x, y]) => Math.exp(x) * Math.cos(y)), vertices, { center: [0.5, 0.5], mmax: 40 });
  assert.ok(sol.maxError < 1e-10, 'boundary error ' + sol.maxError);
  // u = Re(exp(z)) is harmonic, so the solution is known inside the domain.
  assert.ok(Math.abs(sol.evaluate([0.6, 0.7]) - Math.exp(0.6) * Math.cos(0.7)) < 1e-10);
  assert.equal(distinctCount(sol.bary.z), sol.bary.z.length);
});

test('Stokes lid-driven cavity solves to small boundary error', () => {
  const sol = stokes({ N: 16, nPoly: 12, nSample: 80, sigma: 2 });
  assert.ok(sol.maxError < 1e-6, 'boundary error ' + sol.maxError);
  const { psi } = sol.evaluate([0, 0]);
  assert.ok(Number.isFinite(psi) && psi !== 0);
});
