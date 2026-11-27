// Poles, residues, zeros for AAA rational approximation.
// Poles and zeros are generalized eigenvalues of an arrowhead pencil, computed
// with the library's zggev (QZ algorithm).

import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zggev from '../lib/lapack/base/zggev/lib/ndarray.js';
import zladiv from '../lib/lapack/base/zladiv/lib/base.js';

// Smallest safe denominator; eigenvalues with |beta| below it are infinite.
const SAFMIN = Number.MIN_VALUE * (1 / Number.EPSILON);

function cabs(a) { return Math.sqrt(a[0] * a[0] + a[1] * a[1]); }

// ---- Generalized eigenvalue approach for poles/zeros ----
//
// The finite eigenvalues of the (m+1) x (m+1) pencil
//
//   E = [ 0  w^T    ]      B = [ 0     ]
//       [ 1  diag(z)]          [    I  ]
//
// are the roots of sum_j w_j / (x - z_j).
function barycentricRoots(z, weights) {
  const m = z.length;
  if (m <= 1) return [];

  const n = m + 1;
  const E = new Complex128Array(n * n);
  const B = new Complex128Array(n * n);
  const Ev = reinterpret(E, 0);
  const Bv = reinterpret(B, 0);
  for (let j = 0; j < m; j++) {
    const row0 = 2 * (j + 1) * n;       // E[0][j+1]
    const diag = 2 * (j + 1) * (n + 1); // [j+1][j+1]
    Ev[row0] = weights[j][0]; Ev[row0 + 1] = weights[j][1];
    Ev[2 * (j + 1)] = 1;                // E[j+1][0]
    Ev[diag] = z[j][0]; Ev[diag + 1] = z[j][1];
    Bv[diag] = 1;
  }

  const ALPHA = new Complex128Array(n);
  const BETA = new Complex128Array(n);
  const V = new Complex128Array(1);
  // n + n*NB + TSIZE (NB = 32, TSIZE = 4160) enables zggev's blocked QR steps.
  const WORK = new Complex128Array(n + 32 * n + 4160);
  const RWORK = new Float64Array(8 * n);
  const info = zggev(
    'no-vectors', 'no-vectors', n,
    E, 1, n, 0,
    B, 1, n, 0,
    ALPHA, 1, 0,
    BETA, 1, 0,
    V, 1, 1, 0,
    V, 1, 1, 0,
    WORK, 1, 0,
    RWORK, 1, 0
  );
  if (info !== 0) console.warn('zggev info =', info);

  const bv = reinterpret(BETA, 0);
  const q = new Complex128Array(1);
  const qv = reinterpret(q, 0);
  const roots = [];
  // On a QZ failure only eigenvalues info..n-1 are valid.
  for (let i = (info > 0 && info <= n) ? info : 0; i < n; i++) {
    if (Math.hypot(bv[2 * i], bv[2 * i + 1]) > SAFMIN) {
      zladiv(ALPHA, i, BETA, i, q, 0);
      roots.push([qv[0], qv[1]]);
    }
  }
  return roots;
}

// Evaluate barycentric rational function r(zz) = N(zz)/D(zz)
function feval(zz, z, f, w) {
  const result = new Array(zz.length);
  for (let idx = 0; idx < zz.length; idx++) {
    const zv = zz[idx];
    // Check if zv coincides with a support point
    let exact = -1;
    for (let j = 0; j < z.length; j++) {
      if (zv[0] === z[j][0] && zv[1] === z[j][1]) { exact = j; break; }
    }
    if (exact >= 0) {
      result[idx] = [f[exact][0], f[exact][1]];
      continue;
    }

    let nr = 0, ni = 0, dr = 0, di = 0;
    for (let j = 0; j < z.length; j++) {
      // inv = 1 / (zv - z[j])
      const dx = zv[0] - z[j][0], dy = zv[1] - z[j][1];
      const d = dx * dx + dy * dy;
      const invr = dx / d, invi = -dy / d;
      // wf = w[j] * f[j]
      const wfr = w[j][0] * f[j][0] - w[j][1] * f[j][1];
      const wfi = w[j][0] * f[j][1] + w[j][1] * f[j][0];
      // wf * inv
      nr += wfr * invr - wfi * invi;
      ni += wfr * invi + wfi * invr;
      // w[j] * inv
      dr += w[j][0] * invr - w[j][1] * invi;
      di += w[j][0] * invi + w[j][1] * invr;
    }
    // result = N / D
    const dd = dr * dr + di * di;
    result[idx] = [(nr * dr + ni * di) / dd, (ni * dr - nr * di) / dd];
  }
  return result;
}

// ---- PRZ: Compute poles, residues, zeros ----
export function prz(z, f, w) {
  const pol = barycentricRoots(z, w);

  // Zeros: weights = w .* f
  const wf = new Array(w.length);
  for (let i = 0; i < w.length; i++) {
    wf[i] = [
      w[i][0] * f[i][0] - w[i][1] * f[i][1],
      w[i][0] * f[i][1] + w[i][1] * f[i][0],
    ];
  }
  const zer = barycentricRoots(z, wf);

  // Residues via 4-point numerical contour integration
  const dz = new Array(4);
  for (let k = 0; k < 4; k++) {
    const theta = (2 * Math.PI * (k + 1)) / 4;
    dz[k] = [1e-5 * Math.cos(theta), 1e-5 * Math.sin(theta)];
  }

  const res = new Array(pol.length);
  for (let j = 0; j < pol.length; j++) {
    const pts = new Array(4);
    for (let k = 0; k < 4; k++) {
      pts[k] = [pol[j][0] + dz[k][0], pol[j][1] + dz[k][1]];
    }
    const vals = feval(pts, z, f, w);
    let rr = 0, ri = 0;
    for (let k = 0; k < 4; k++) {
      // rr += vals[k] * dz[k]
      rr += vals[k][0] * dz[k][0] - vals[k][1] * dz[k][1];
      ri += vals[k][0] * dz[k][1] + vals[k][1] * dz[k][0];
    }
    res[j] = [0.25 * rr, 0.25 * ri];
  }

  return { pol, res, zer };
}

// ---- Cleanup: remove Froissart doublets ----
export function cleanup(z, f, w, pol, res, zer) {
  const negligible = [];
  for (let i = 0; i < res.length; i++) {
    if (cabs(res[i]) < 1e-13) negligible.push(i);
  }
  if (negligible.length === 0) return { z, f, w, pol, res, zer };

  const remove = new Set();
  for (const ni of negligible) {
    let minDist = Infinity, nearest = -1;
    for (let k = 0; k < z.length; k++) {
      if (remove.has(k)) continue;
      const dr = z[k][0] - pol[ni][0], di = z[k][1] - pol[ni][1];
      const dist = Math.sqrt(dr * dr + di * di);
      if (dist < minDist) { minDist = dist; nearest = k; }
    }
    if (nearest >= 0) remove.add(nearest);
  }

  const newZ = [], newF = [], newW = [];
  for (let i = 0; i < z.length; i++) {
    if (!remove.has(i)) {
      newZ.push(z[i]); newF.push(f[i]); newW.push(w[i]);
    }
  }

  const result = prz(newZ, newF, newW);
  return { z: newZ, f: newF, w: newW, pol: result.pol, res: result.res, zer: result.zer };
}

export { feval, barycentricRoots };
