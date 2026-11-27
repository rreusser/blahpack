#!/usr/bin/env node
// Integration tests for the AAA algorithm and Laplace solver.
// Validates correctness against:
//   - Nakatsukasa, Sète, Trefethen (2018) "The AAA Algorithm" (arXiv:1612.00337v2)
//   - Costa (2020) "Solving Laplace problems with the AAA algorithm" (arXiv:2001.09439v1)
//   - Reference Fortran LAPACK (Apple Accelerate)

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { laplace, pointInPolygon } from './laplace.js';
import { aaa, timings } from '../aaa-pure.js';

function linspace(a, b, step) {
  const arr = [];
  if (a <= b) for (let x = a; x <= b + step/2; x += step) arr.push(x);
  else for (let x = a; x >= b - step/2; x -= step) arr.push(x);
  return arr;
}

function unitCircle(M) {
  const Z = [], F_tan = [], F_exp = [];
  for (let i = 0; i < M; i++) {
    const theta = 2 * Math.PI * i / M;
    const cr = Math.cos(theta), ci = Math.sin(theta);
    Z.push([cr, ci]);
    F_exp.push([Math.exp(cr) * Math.cos(ci), Math.exp(cr) * Math.sin(ci)]);
    // tan(z) = sin(z)/cos(z) computed via complex exponentials
    const ez = [Math.exp(cr) * Math.cos(ci), Math.exp(cr) * Math.sin(ci)];
    const emz = [Math.exp(-cr) * Math.cos(-ci), Math.exp(-cr) * Math.sin(-ci)];
    const sinR = (ez[1] - emz[1]) / 2, sinI = -(ez[0] - emz[0]) / 2;
    const cosR = (ez[0] + emz[0]) / 2, cosI = (ez[1] + emz[1]) / 2;
    const d = cosR * cosR + cosI * cosI;
    F_tan.push([(sinR * cosR + sinI * cosI) / d, (sinI * cosR - sinR * cosI) / d]);
  }
  return { Z, F_exp, F_tan };
}

function buildLShapedBoundary(stp) {
  const boundary = [];
  for (const x of linspace(0, 2, stp)) boundary.push([x, 0]);
  for (const y of linspace(0, 1, stp)) boundary.push([2, y]);
  for (const x of linspace(2, 1, stp)) boundary.push([x, 1]);
  for (const y of linspace(1, 2, stp)) boundary.push([1, y]);
  for (const x of linspace(1, 0, stp)) boundary.push([x, 2]);
  for (const y of linspace(2, 0, stp)) boundary.push([0, y]);
  return boundary;
}

const vertices = [[0,0], [2,0], [2,1], [1,1], [1,2], [0,2]];

// ---- AAA algorithm: basic convergence ----

describe('AAA convergence', () => {
  it('converges on exp(z) on the unit circle', () => {
    const { Z, F_exp } = unitCircle(200);
    const result = aaa(Z, F_exp, 1e-13, 50);
    assert.ok(result.converged);
    assert.ok(result.errvec.length <= 12, `expected ≤12 iters, got ${result.errvec.length}`);
    assert.ok(result.errvec[result.errvec.length - 1] < 1e-13);
  });

  it('converges on 1/(z - 0.5 - 0.5i) on the unit circle', () => {
    const M = 200, Z = [], F = [];
    for (let i = 0; i < M; i++) {
      const theta = 2 * Math.PI * i / M;
      const zr = Math.cos(theta), zi = Math.sin(theta);
      Z.push([zr, zi]);
      const dr = zr - 0.5, di = zi - 0.5, d = dr * dr + di * di;
      F.push([dr / d, -di / d]);
    }
    const result = aaa(Z, F, 1e-13, 50);
    assert.ok(result.converged);
    assert.ok(result.errvec.length <= 4);
  });

  it('converges on z^2 on the unit circle', () => {
    const M = 200, Z = [], F = [];
    for (let i = 0; i < M; i++) {
      const theta = 2 * Math.PI * i / M;
      const cr = Math.cos(theta), ci = Math.sin(theta);
      Z.push([cr, ci]);
      F.push([cr * cr - ci * ci, 2 * cr * ci]);
    }
    const result = aaa(Z, F, 1e-13, 50);
    assert.ok(result.converged);
    assert.ok(result.errvec.length <= 5);
  });
});

// ---- AAA: Fortran LAPACK reference comparison ----

describe('AAA vs Fortran LAPACK', () => {
  it('matches reference convergence on exp(z)', () => {
    const { Z, F_exp } = unitCircle(200);
    const result = aaa(Z, F_exp, 1e-13, 50);
    const refErr = [2.371e+0, 2.118e-1, 3.279e-3, 3.954e-5, 1.340e-7, 3.848e-10, 5.684e-13, 1.861e-15];
    assert.equal(result.errvec.length, refErr.length, 'same iteration count');
    for (let i = 0; i < refErr.length; i++) {
      const absDiff = Math.abs(result.errvec[i] - refErr[i]);
      const relDiff = absDiff / Math.max(refErr[i], 1e-16);
      const ok = refErr[i] < 1e-13 ? absDiff < 1e-14 : relDiff < 0.1;
      assert.ok(ok, `iter ${i + 1}: JS=${result.errvec[i].toExponential(3)} vs Fortran=${refErr[i].toExponential(3)}`);
    }
  });
});

// ---- AAA: Paper validation cases (Nakatsukasa et al. 2018) ----

describe('AAA paper validation (arXiv:1612.00337v2)', () => {

  it('spiral: tan(πz/2) on spiral of 1000 points', () => {
    // Paper §3, Figure 1: Z = exp(linspace(-0.5, 0.5+15i*pi, 1000))
    // "spiral of 1000 points winding 7½ times around the origin"
    // F = tan(pi*z/2), converges in m=12 steps
    const M = 1000;
    const Z = [], F = [];
    for (let i = 0; i < M; i++) {
      const t = i / (M - 1);
      // linspace(-0.5, 0.5+15i*pi, 1000): real -0.5→0.5, imag 0→15π
      const lr = -0.5 + t * 1.0;
      const li = t * 15 * Math.PI;
      // Z = exp(linspace value)
      const zr = Math.exp(lr) * Math.cos(li);
      const zi = Math.exp(lr) * Math.sin(li);
      Z.push([zr, zi]);
      // F = tan(pi*z/2) using sin(a+bi)/cos(a+bi) identities
      const a = Math.PI * zr / 2, b = Math.PI * zi / 2;
      const sinR = Math.sin(a) * Math.cosh(b), sinI = Math.cos(a) * Math.sinh(b);
      const cosR = Math.cos(a) * Math.cosh(b), cosI = -Math.sin(a) * Math.sinh(b);
      const d = cosR * cosR + cosI * cosI;
      F.push([(sinR * cosR + sinI * cosI) / d, (sinI * cosR - sinR * cosI) / d]);
    }
    const result = aaa(Z, F, 1e-13, 50);

    // Paper reports m=12 steps, error sequence:
    // 2.49e+01, 4.28e+01, 1.71e+01, 8.65e-02, 1.27e-02, 9.91e-04,
    // 5.87e-05, 1.29e-06, 3.57e-08, 6.37e-10, 1.67e-11, 1.30e-13
    assert.ok(result.converged, 'should converge');
    assert.ok(result.errvec.length <= 15, `expected ≤15 iters, got ${result.errvec.length}`);
    assert.ok(result.errvec[result.errvec.length - 1] < 1e-12, `final error ${result.errvec[result.errvec.length - 1].toExponential(2)} should be < 1e-12`);

    // Paper reports first pair of poles match ±1 to 15 digits
    const poles = result.pol;
    let closestToPlus1 = Infinity, closestToMinus1 = Infinity;
    for (const p of poles) {
      closestToPlus1 = Math.min(closestToPlus1, Math.hypot(p[0] - 1, p[1]));
      closestToMinus1 = Math.min(closestToMinus1, Math.hypot(p[0] + 1, p[1]));
    }
    assert.ok(closestToPlus1 < 1e-10, `pole near +1: dist=${closestToPlus1.toExponential(2)}`);
    assert.ok(closestToMinus1 < 1e-10, `pole near -1: dist=${closestToMinus1.toExponential(2)}`);
  });

  it('App 1: tan(z) on 128 points on unit circle', () => {
    // Paper §7.1: f(z) = tan(z) on 128 equispaced points on the unit circle
    // Rational type (7,7) more accurate than polynomial of degree 52
    const M = 128, Z = [], F = [];
    for (let i = 0; i < M; i++) {
      const theta = 2 * Math.PI * i / M;
      const zr = Math.cos(theta), zi = Math.sin(theta);
      Z.push([zr, zi]);
      // tan(z) = sin(z)/cos(z), z = zr + zi*i
      const sinR = Math.sin(zr) * Math.cosh(zi), sinI = Math.cos(zr) * Math.sinh(zi);
      const cosR = Math.cos(zr) * Math.cosh(zi), cosI = -Math.sin(zr) * Math.sinh(zi);
      const d = cosR * cosR + cosI * cosI;
      F.push([(sinR * cosR + sinI * cosI) / d, (sinI * cosR - sinR * cosI) / d]);
    }
    const result = aaa(Z, F, 1e-13, 50);
    assert.ok(result.converged, 'should converge');
    // Should find poles near ±π/2
    const poles = result.pol;
    let closestToPiHalf = Infinity, closestToMPiHalf = Infinity;
    for (const p of poles) {
      closestToPiHalf = Math.min(closestToPiHalf, Math.hypot(p[0] - Math.PI/2, p[1]));
      closestToMPiHalf = Math.min(closestToMPiHalf, Math.hypot(p[0] + Math.PI/2, p[1]));
    }
    assert.ok(closestToPiHalf < 1e-5, `should find pole near π/2, closest=${closestToPiHalf.toExponential(2)}`);
    assert.ok(closestToMPiHalf < 1e-5, `should find pole near -π/2, closest=${closestToMPiHalf.toExponential(2)}`);
  });

  it('App 3: log(2+z^4)/(1-16z^4) on 1000 roots of unity', () => {
    // Paper §7.3: meromorphic function on unit disk
    // f(z) = log(2+z^4)/(1-16z^4) on 1000 roots of unity
    // Should find 4 poles inside the unit disk matching poles of 1/(1-16z^4)
    const M = 1000, Z = [], F = [];
    for (let i = 0; i < M; i++) {
      const theta = 2 * Math.PI * i / M;
      const zr = Math.cos(theta), zi = Math.sin(theta);
      Z.push([zr, zi]);
      // z^4 = (zr + zi*i)^4
      const z2r = zr * zr - zi * zi, z2i = 2 * zr * zi;
      const z4r = z2r * z2r - z2i * z2i, z4i = 2 * z2r * z2i;
      // log(2 + z^4): compute 2+z^4, then log
      const ar = 2 + z4r, ai = z4i;
      const logMag = Math.log(Math.hypot(ar, ai));
      const logArg = Math.atan2(ai, ar);
      const numR = logMag, numI = logArg;
      // 1 - 16*z^4
      const denR = 1 - 16 * z4r, denI = -16 * z4i;
      const d = denR * denR + denI * denI;
      F.push([(numR * denR + numI * denI) / d, (numI * denR - numR * denI) / d]);
    }
    const result = aaa(Z, F, 1e-13, 100);
    assert.ok(result.converged, 'should converge');

    // Poles of 1/(1-16z^4) are at z = (1/16)^(1/4) * e^(i*k*pi/2)
    // = (1/2) * e^(i*k*pi/2) for k=0,1,2,3
    // i.e., ±0.5 and ±0.5i
    const truePoles = [[0.5, 0], [-0.5, 0], [0, 0.5], [0, -0.5]];
    for (const tp of truePoles) {
      let closest = Infinity;
      for (const p of result.pol) {
        closest = Math.min(closest, Math.hypot(p[0] - tp[0], p[1] - tp[1]));
      }
      assert.ok(closest < 1e-5,
        `should find pole near (${tp[0]}, ${tp[1]}), closest=${closest.toExponential(2)}`);
    }
  });

  it('App 5: function on non-circular domain (real interval)', () => {
    // Paper §7.5: approximation on [-1,1]
    // f(x) = exp(x) on 1000 equispaced points in [-1,1]
    // Should converge rapidly (exp is entire)
    const M = 1000, Z = [], F = [];
    for (let i = 0; i < M; i++) {
      const x = -1 + 2 * i / (M - 1);
      Z.push([x, 0]);
      F.push([Math.exp(x), 0]);
    }
    const result = aaa(Z, F, 1e-13, 50);
    assert.ok(result.converged, 'should converge on exp(x) on [-1,1]');
    assert.ok(result.errvec.length <= 20, `expected ≤20 iters, got ${result.errvec.length}`);
  });
});

// ---- Point-in-polygon ----

describe('pointInPolygon', () => {
  it('classifies L-shaped domain points correctly', () => {
    assert.ok(pointInPolygon([0.5, 0.5], vertices));
    assert.ok(!pointInPolygon([1.5, 1.5], vertices));
    assert.ok(pointInPolygon([0.5, 1.5], vertices));
    assert.ok(!pointInPolygon([-1, 0], vertices));
    assert.ok(pointInPolygon([1.9, 0.9], vertices));
    assert.ok(!pointInPolygon([3, 0], vertices));
  });
});

// ---- Laplace solver (Costa 2020) ----

describe('Laplace solver (Costa 2020)', { timeout: 120000 }, () => {
  const boundary = buildLShapedBoundary(0.01);
  const boundaryValues = boundary.map(([x]) => x * x);

  let result;
  it('solves the L-shaped domain with u(z) = x^2', () => {
    result = laplace(boundary, boundaryValues, vertices, {
      center: [0.5, 0.5],
      interior: true,
    });

    // Costa (2020) reports 6.47e-7 boundary error
    assert.ok(result.maxError < 1e-5,
      `boundary error ${result.maxError.toExponential(2)} should be < 1e-5`);
    assert.ok(result.allPoles.length > 100,
      `should find >100 poles, got ${result.allPoles.length}`);
    assert.ok(result.poles.length > 30,
      `should find >30 exterior poles, got ${result.poles.length}`);
    assert.equal(result.N, 17);
  });

  it('evaluates accurately at interior test point', () => {
    const u = result.evaluate([0.99, 0.99]);
    const exact = 1.0267919261073;
    const relErr = Math.abs(u - exact) / exact;
    assert.ok(relErr < 1e-2,
      `u(0.99+0.99i) = ${u}, expected ≈ ${exact}, relErr = ${relErr.toExponential(2)}`);
  });

  it('evaluates correctly at multiple interior points', () => {
    const testPts = [[0.5, 0.5], [1.0, 0.5], [0.5, 1.0], [1.5, 0.5]];
    for (const [x, y] of testPts) {
      if (!pointInPolygon([x, y], vertices)) continue;
      const u = result.evaluate([x, y]);
      assert.ok(typeof u === 'number' && isFinite(u),
        `u(${x}+${y}i) should be finite, got ${u}`);
      assert.ok(u > -1 && u < 5,
        `u(${x}+${y}i) = ${u} should be in [0,4] range`);
    }
  });
});
