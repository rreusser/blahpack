#!/usr/bin/env node
// Generate pre-computed test case data for the visualization notebook.
// Run from project root: node notebooks/laplace/generate-data.js
//
// Sources:
//   [NST18] Nakatsukasa, Sète, Trefethen, "The AAA Algorithm for Rational
//           Approximation", SIAM J. Sci. Comput. 40(3), 2018. arXiv:1612.00337v2
//   [C20]   Costa, "Solving Laplace problems with the AAA algorithm",
//           arXiv:2001.09439v1, 2020

import { laplace, pointInPolygon } from '../../examples/laplace/laplace.js';
import { aaa } from '../../examples/aaa-pure.js';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function linspace(a, b, step) {
  const arr = [];
  if (a <= b) for (let x = a; x <= b + step / 2; x += step) arr.push(x);
  else for (let x = a; x >= b - step / 2; x -= step) arr.push(x);
  return arr;
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

const output = { laplace: [], aaa: [] };

// ========================================================================
// Laplace solver test cases — Costa (2020) §3, Example 1
// ========================================================================
// L-shaped domain [0,2]×[0,2] \ [1,2]×[1,2], vertices listed CCW.
// Costa §3 uses this domain with u(z) = Re(z^(2/3)) but the test suite
// validates with u = x² (non-harmonic boundary data forcing the solver
// to produce a non-trivial rational approximation).
// Reference boundary error: Costa reports 6.47e-7 for Re(z^(2/3)).

const vertices = [[0, 0], [2, 0], [2, 1], [1, 1], [1, 2], [0, 2]];
const boundary = buildLShapedBoundary(0.01);

// ---- [C20] §3 variant: u = x² on L-shaped domain ----
// Not harmonic, so the AAA approximation must capture the residual
// after polynomial subtraction. Our test suite (test.js:255) validates
// maxError < 1e-5 and checks interior evaluation at (0.99, 0.99).
console.log('[C20] L-shaped domain, u = x²...');
const bvX2 = boundary.map(([x]) => x * x);
const laplaceX2 = laplace(boundary, bvX2, vertices, {
  center: [0.5, 0.5], interior: true, mmax: 100,
});
output.laplace.push({
  name: 'L-shaped, u = x²',
  source: '[C20] §3, variant with u = x² (test.js:255)',
  description: 'L-shaped domain [0,2]²\\[1,2]², Dirichlet BC u = x². Non-harmonic BC forces non-trivial rational part.',
  vertices,
  ...laplaceX2,
  evaluate: undefined,
  valueRange: [0, 4],
});

// ---- [C20] §3 variant: u = Re(z²) = x² - y² ----
// Harmonic polynomial — the smooth part should capture it exactly,
// leaving near-zero residual. Tests that the polynomial fitting stage works.
console.log('[C20] L-shaped domain, u = Re(z²)...');
const bvRez2 = boundary.map(([x, y]) => x * x - y * y);
const laplaceRez2 = laplace(boundary, bvRez2, vertices, {
  center: [0.5, 0.5], interior: true, mmax: 100,
});
output.laplace.push({
  name: 'L-shaped, u = Re(z²)',
  source: '[C20] §3, variant with harmonic BC u = x²−y²',
  description: 'Harmonic polynomial BC. Smooth polynomial part should capture this exactly; AAA rational part should be negligible.',
  vertices,
  ...laplaceRez2,
  evaluate: undefined,
  valueRange: [-4, 4],
});

// ---- [C20] §3 variant: u = Re(exp(z)) ----
// Entire function — smooth part handles the bulk, AAA captures
// corner singularity contributions near the reentrant corner (1,1).
console.log('[C20] L-shaped domain, u = Re(eᶻ)...');
const bvExp = boundary.map(([x, y]) => Math.exp(x) * Math.cos(y));
const laplaceExp = laplace(boundary, bvExp, vertices, {
  center: [0.5, 0.5], interior: true, mmax: 100,
});
output.laplace.push({
  name: 'L-shaped, u = Re(eᶻ)',
  source: '[C20] §3, variant with u = Re(exp(z))',
  description: 'Entire-function BC. Smooth part handles bulk; AAA captures corner singularity near reentrant corner (1,1).',
  vertices,
  ...laplaceExp,
  evaluate: undefined,
  valueRange: [Math.min(...bvExp), Math.max(...bvExp)],
});

// ========================================================================
// AAA algorithm test cases — Nakatsukasa, Sète, Trefethen (2018)
// ========================================================================

// ---- [NST18] §3, Figure 1: exp(z) on 200 unit circle points ----
// Reference convergence: 8 iterations to reach tol = 1e-13.
// Fortran reference error sequence: 2.371e+0, 2.118e-1, 3.279e-3,
// 3.954e-5, 1.340e-7, 3.848e-10, 5.684e-13, 1.861e-15
// Validated in test.js:93 against reference Fortran LAPACK.
console.log('[NST18] exp(z) on unit circle...');
const M_circle = 200;
const Z_circle = [], F_exp = [];
for (let i = 0; i < M_circle; i++) {
  const theta = 2 * Math.PI * i / M_circle;
  const cr = Math.cos(theta), ci = Math.sin(theta);
  Z_circle.push([cr, ci]);
  F_exp.push([Math.exp(cr) * Math.cos(ci), Math.exp(cr) * Math.sin(ci)]);
}
const aaaExp = aaa(Z_circle, F_exp, 1e-13, 50);
output.aaa.push({
  name: 'exp(z) on unit circle',
  source: '[NST18] §3, Fig. 1; test.js:93',
  description: '200 equispaced points on unit circle. Reference: 8 iterations, geometric convergence. Validated against Fortran LAPACK SVD.',
  samplePoints: Z_circle,
  convergence: aaaExp.errvec,
  poles: aaaExp.pol,
  zeros: aaaExp.zer,
  converged: aaaExp.converged,
  referenceErrors: [2.371e+0, 2.118e-1, 3.279e-3, 3.954e-5, 1.340e-7, 3.848e-10, 5.684e-13, 1.861e-15],
});

// ---- [NST18] §3, Figure 1: tan(πz/2) on spiral ----
// "spiral of 1000 points winding 7½ times around the origin"
// Z = exp(linspace(-0.5, 0.5+15iπ, 1000)), F = tan(πz/2)
// Paper reports m=12 steps, poles near ±1 to 15 digits.
// Validated in test.js:111.
console.log('[NST18] tan(πz/2) on spiral...');
const M_spiral = 1000;
const Z_spiral = [], F_tan = [];
for (let i = 0; i < M_spiral; i++) {
  const t = i / (M_spiral - 1);
  const lr = -0.5 + t * 1.0;
  const li = t * 15 * Math.PI;
  const zr = Math.exp(lr) * Math.cos(li);
  const zi = Math.exp(lr) * Math.sin(li);
  Z_spiral.push([zr, zi]);
  const a = Math.PI * zr / 2, b = Math.PI * zi / 2;
  const sinR = Math.sin(a) * Math.cosh(b), sinI = Math.cos(a) * Math.sinh(b);
  const cosR = Math.cos(a) * Math.cosh(b), cosI = -Math.sin(a) * Math.sinh(b);
  const d = cosR * cosR + cosI * cosI;
  F_tan.push([(sinR * cosR + sinI * cosI) / d, (sinI * cosR - sinR * cosI) / d]);
}
const aaaTan = aaa(Z_spiral, F_tan, 1e-13, 50);
output.aaa.push({
  name: 'tan(πz/2) on spiral',
  source: '[NST18] §3, Fig. 1; test.js:111',
  description: '1000 points on spiral winding 7½ times. Paper reports m=12, poles ±1 to 15 digits.',
  samplePoints: Z_spiral,
  convergence: aaaTan.errvec,
  poles: aaaTan.pol,
  zeros: aaaTan.zer,
  converged: aaaTan.converged,
  truePoles: [[1, 0], [-1, 0], [3, 0], [-3, 0]],
});

// ---- [NST18] §7.1: tan(z) on 128 unit circle points ----
// Paper: rational type (7,7) more accurate than polynomial of degree 52.
// Should find poles near ±π/2. Validated in test.js:153.
console.log('[NST18] tan(z) on unit circle...');
const M_tan = 128;
const Z_tan = [], F_tanCircle = [];
for (let i = 0; i < M_tan; i++) {
  const theta = 2 * Math.PI * i / M_tan;
  const zr = Math.cos(theta), zi = Math.sin(theta);
  Z_tan.push([zr, zi]);
  const sinR = Math.sin(zr) * Math.cosh(zi), sinI = Math.cos(zr) * Math.sinh(zi);
  const cosR = Math.cos(zr) * Math.cosh(zi), cosI = -Math.sin(zr) * Math.sinh(zi);
  const d = cosR * cosR + cosI * cosI;
  F_tanCircle.push([(sinR * cosR + sinI * cosI) / d, (sinI * cosR - sinR * cosI) / d]);
}
const aaaTanCircle = aaa(Z_tan, F_tanCircle, 1e-13, 50);
output.aaa.push({
  name: 'tan(z) on unit circle',
  source: '[NST18] §7.1 (App 1); test.js:153',
  description: '128 equispaced points on unit circle. Rational type (7,7) beats degree-52 polynomial. Poles near ±π/2.',
  samplePoints: Z_tan,
  convergence: aaaTanCircle.errvec,
  poles: aaaTanCircle.pol,
  zeros: aaaTanCircle.zer,
  converged: aaaTanCircle.converged,
  truePoles: [[Math.PI / 2, 0], [-Math.PI / 2, 0]],
});

// ---- [NST18] §7.3: log(2+z⁴)/(1-16z⁴) on 1000 roots of unity ----
// Meromorphic function on unit disk. 4 poles inside unit disk at
// z = (1/2) * e^(ikπ/2), k=0,1,2,3 (i.e., ±0.5, ±0.5i).
// Validated in test.js:180.
console.log('[NST18] log(2+z⁴)/(1-16z⁴) on roots of unity...');
const M_mero = 1000;
const Z_mero = [], F_mero = [];
for (let i = 0; i < M_mero; i++) {
  const theta = 2 * Math.PI * i / M_mero;
  const zr = Math.cos(theta), zi = Math.sin(theta);
  Z_mero.push([zr, zi]);
  const z2r = zr * zr - zi * zi, z2i = 2 * zr * zi;
  const z4r = z2r * z2r - z2i * z2i, z4i = 2 * z2r * z2i;
  const ar = 2 + z4r, ai = z4i;
  const logMag = Math.log(Math.hypot(ar, ai));
  const logArg = Math.atan2(ai, ar);
  const denR = 1 - 16 * z4r, denI = -16 * z4i;
  const d = denR * denR + denI * denI;
  F_mero.push([(logMag * denR + logArg * denI) / d, (logArg * denR - logMag * denI) / d]);
}
const aaaMero = aaa(Z_mero, F_mero, 1e-13, 100);
output.aaa.push({
  name: 'log(2+z⁴)/(1−16z⁴)',
  source: '[NST18] §7.3 (App 3); test.js:180',
  description: '1000 roots of unity. Meromorphic on unit disk. 4 poles at ±0.5, ±0.5i from 1/(1−16z⁴) factor.',
  samplePoints: Z_mero,
  convergence: aaaMero.errvec,
  poles: aaaMero.pol,
  zeros: aaaMero.zer,
  converged: aaaMero.converged,
  truePoles: [[0.5, 0], [-0.5, 0], [0, 0.5], [0, -0.5]],
});

const outPath = join(__dirname, 'data.json');
writeFileSync(outPath, JSON.stringify(output, null, 2));
console.log(`Wrote ${output.laplace.length} Laplace + ${output.aaa.length} AAA cases to ${outPath}`);
