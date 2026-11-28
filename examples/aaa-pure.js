// AAA algorithm for rational approximation, in barycentric form.
// Reference: Nakatsukasa, Sète, Trefethen, "The AAA Algorithm for Rational
// Approximation", SIAM J. Sci. Comput. 40(3), A1494–A1522, 2018.
//
// Pure JavaScript on blahpack's LAPACK/BLAS: zgesvd for the weights and zggev
// (in prz.js) for poles and zeros. Runs unchanged in Node and, bundled with
// esbuild, in the browser notebooks.

import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';

import { prz, cleanup, feval, barycentricRoots } from './prz.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import zgesvd from '../lib/lapack/zgesvd/lib/ndarray.js';
import zlartg from '../lib/lapack/zlartg/lib/ndarray.js';
import zrot from '../lib/lapack/zrot/lib/ndarray.js';
import zgemv from '../lib/blas/zgemv/lib/ndarray.js';
import zaxpy from '../lib/blas/zaxpy/lib/ndarray.js';
import zcopy from '../lib/blas/zcopy/lib/ndarray.js';
import zdscal from '../lib/blas/zdscal/lib/ndarray.js';
import dznrm2 from '../lib/blas/dznrm2/lib/ndarray.js';

export { prz, cleanup, feval, barycentricRoots };

export const timings = {
  svd: 0, cauchy: 0, aMatrix: 0, ratEval: 0, prz: 0, total: 0, iters: 0,
  reset() { this.svd = 0; this.cauchy = 0; this.aMatrix = 0; this.ratEval = 0; this.prz = 0; this.total = 0; this.iters = 0; }
};

// ---- Incrementally updated thin QR of the Loewner matrix ----
//
// The Loewner matrix changes by exactly two operations per AAA iteration: the
// row of the new support point is removed and one column is appended. Refactoring
// it from scratch costs O(M m^2) per iteration and dominates the run time, so
// instead a thin QR factorization A = Q R is carried along and updated in O(M m).
// The weight vector is the right singular vector of the smallest singular value,
// which A shares with its m x m factor R, so only R goes through zgesvd.
//
// LAPACK has no QR updating routines, so the two updates are written here, on
// top of the library's kernels (zgemv, dznrm2, zlartg, zrot, ...).
//
// Q is M x n (leading dimension M) and R is n x n upper triangular (leading
// dimension ldr), both column-major. Rows of removed points are zero in Q.

const ONE = new Complex128(1, 0);
const NEG_ONE = new Complex128(-1, 0);
const ZERO = new Complex128(0, 0);

// a := a - Q (Q^H a), with the coefficients Q^H a written to x at offsetX.
function projectOut(Q, M, n, a, x, offsetX) {
  zgemv('conjugate-transpose', M, n, ONE, Q, 1, M, 0, a, 1, 0, ZERO, x, 1, offsetX);
  zgemv('no-transpose', M, n, NEG_ONE, Q, 1, M, 0, x, 1, offsetX, ONE, a, 1, 0);
}

// Appends column `a` (length M, overwritten) to the factorization, by classical
// Gram-Schmidt with one reorthogonalization pass. `s` is scratch of length n.
// Returns false on breakdown (a zero or non-finite remainder).
function qrAppendColumn(Q, R, M, ldr, n, a, s) {
  const rn = n * ldr;
  if (n > 0) {
    projectOut(Q, M, n, a, R, rn);
    projectOut(Q, M, n, a, s, 0);
    zaxpy(n, ONE, s, 1, 0, R, 1, rn);
  }
  const rho = dznrm2(M, a, 1, 0);
  if (!(rho > 0) || !Number.isFinite(rho)) return false;
  zdscal(M, 1 / rho, a, 1, 0);
  zcopy(M, a, 1, 0, Q, 1, n * M);
  const Rv = reinterpret(R, 0);
  Rv[2 * (rn + n)] = rho; Rv[2 * (rn + n) + 1] = 0;
  return true;
}

// Scratch for the rotations in qrDeleteRow: [f, s, r] and c, as zlartg takes them.
const ROT = new Complex128Array(3);
const ROTv = reinterpret(ROT, 0);
const ROTC = new Float64Array(1);

// Removes (zeros) row j of the factored matrix. `u` (length M), `p` and `w`
// (length n) are scratch. Returns false on breakdown, when e_j lies in the
// column space of Q to working precision.
function qrDeleteRow(Q, R, M, ldr, n, j, u, p, w) {
  // e_j = Q p + rho u, with u a unit vector orthogonal to the columns of Q.
  const uv = reinterpret(u, 0);
  uv.fill(0);
  uv[2 * j] = 1;
  projectOut(Q, M, n, u, p, 0);
  projectOut(Q, M, n, u, w, 0);
  zaxpy(n, ONE, w, 1, 0, p, 1, 0);
  const rho = dznrm2(M, u, 1, 0);
  if (!(rho > 1e-8)) return false;
  zdscal(M, 1 / rho, u, 1, 0);

  // Rotate [p; rho] onto the last axis with Givens rotations in the planes
  // (k, n), k = n-1..0. Applied to the columns of [Q u] this turns u into e_j
  // and leaves row j of Q zero; applied to the rows of [R; 0] it keeps R upper
  // triangular. `w` holds the extra row of R, which is discarded.
  reinterpret(w, 0).fill(0, 0, 2 * n);
  const Qv = reinterpret(Q, 0);
  ROTv[0] = rho; ROTv[1] = 0;
  for (let k = n - 1; k >= 0; k--) {
    zlartg(ROT, 0, p, k, ROTC, 0, ROT, 1, ROT, 2);
    const c = ROTC[0], sr = ROTv[2], si = ROTv[3];
    zrot(n - k, w, 1, k, R, ldr, k + k * ldr, c, new Complex128(sr, si));
    zrot(M, u, 1, 0, Q, 1, k * M, c, new Complex128(sr, -si));
    Qv[2 * (j + k * M)] = 0; Qv[2 * (j + k * M) + 1] = 0;
    ROTv[0] = ROTv[4]; ROTv[1] = ROTv[5];
  }
  return true;
}

export function aaa(Z, F, tol = 1e-13, mmax = 100) {
  const t_total = performance.now();
  const M = Z.length;
  if (M !== F.length) throw new Error('Z and F must have the same length');
  if (mmax > M) mmax = M;

  const Zr = new Float64Array(2 * M);
  const Fr = new Float64Array(2 * M);
  for (let i = 0; i < M; i++) {
    Zr[2 * i] = Z[i][0]; Zr[2 * i + 1] = Z[i][1];
    Fr[2 * i] = F[i][0]; Fr[2 * i + 1] = F[i][1];
  }

  const zr = new Float64Array(2 * mmax);
  const fr = new Float64Array(2 * mmax);
  const wr = new Float64Array(2 * mmax);
  const errvec = [];

  const Cr = new Float64Array(2 * M * mmax);

  // J[0..nJ-1] are the sample points not yet removed from the sample set.
  const J = new Int32Array(M);
  for (let i = 0; i < M; i++) J[i] = i;
  let nJ = M;
  const removed = new Int32Array(M);

  const Rr = new Float64Array(2 * M);
  let meanR = 0, meanI = 0;
  for (let i = 0; i < M; i++) { meanR += Fr[2 * i]; meanI += Fr[2 * i + 1]; }
  meanR /= M; meanI /= M;
  for (let i = 0; i < M; i++) { Rr[2 * i] = meanR; Rr[2 * i + 1] = meanI; }

  let Fnorm = 0;
  for (let i = 0; i < M; i++) {
    const a = Math.hypot(Fr[2 * i], Fr[2 * i + 1]);
    if (a > Fnorm) Fnorm = a;
  }

  const maxN = mmax;
  const maxM_svd = M;
  const Adata = new Complex128Array(maxM_svd * maxN);
  const Av = reinterpret(Adata, 0);
  const sData = new Float64Array(maxN);
  const UData = new Complex128Array(1);
  const VTData = new Complex128Array(maxN * maxN);
  const VTv = reinterpret(VTData, 0);
  const minMN = Math.min(maxM_svd, maxN);
  const maxMN = Math.max(maxM_svd, maxN);
  const lworkMax = Math.max(1, 3 * minMN + maxMN + minMN * maxMN);
  const WORK = new Complex128Array(lworkMax);
  const RWORK = new Float64Array(5 * maxN);

  // Updated QR factorization of the Loewner matrix (see qrAppendColumn). If an
  // update breaks down, or the matrix stops being tall, `useQR` goes false and
  // every later iteration factors the full matrix directly instead.
  const Qq = new Complex128Array(M * mmax);
  const Rq = new Complex128Array(mmax * mmax);
  const Rqv = reinterpret(Rq, 0);
  const colScratch = new Complex128Array(M);
  const colv = reinterpret(colScratch, 0);
  const rowScratch = new Complex128Array(mmax);
  const rowScratch2 = new Complex128Array(mmax);
  let useQR = true;

  let converged = false;
  let m = 0;

  for (let iter = 0; iter < mmax; iter++) {
    timings.iters++;

    // The next support point is the remaining sample point with the largest
    // error. Only remaining points are candidates: a point that left the sample
    // set as a duplicate of a support point (below) must never be chosen, since
    // two support points at the same z make the barycentric form singular.
    if (nJ === 0) break;
    let maxVal = -1, j = J[0];
    for (let ii = 0; ii < nJ; ii++) {
      const i = J[ii];
      const dr = Fr[2 * i] - Rr[2 * i], di = Fr[2 * i + 1] - Rr[2 * i + 1];
      const a = dr * dr + di * di;
      if (a > maxVal) { maxVal = a; j = i; }
    }

    zr[2 * m] = Zr[2 * j]; zr[2 * m + 1] = Zr[2 * j + 1];
    fr[2 * m] = Fr[2 * j]; fr[2 * m + 1] = Fr[2 * j + 1];
    m++;

    // Remove the support point from the sample set, together with every other
    // sample at exactly the same z. The approximant takes the value F[j] there
    // whatever the weights are, so that is recorded once as its value at those
    // points; a duplicate carrying a different F keeps a nonzero error.
    const zjr = Zr[2 * j], zji = Zr[2 * j + 1];
    let nRemoved = 0, nKept = 0;
    for (let ii = 0; ii < nJ; ii++) {
      const i = J[ii];
      if (Zr[2 * i] === zjr && Zr[2 * i + 1] === zji) {
        Rr[2 * i] = Fr[2 * j]; Rr[2 * i + 1] = Fr[2 * j + 1];
        removed[nRemoved++] = i;
      } else {
        J[nKept++] = i;
      }
    }
    nJ = nKept;

    let t0 = performance.now();
    for (let i = 0; i < M; i++) {
      const dr = Zr[2 * i] - zjr, di = Zr[2 * i + 1] - zji;
      const d = dr * dr + di * di;
      const base = 2 * (i + iter * M);
      if (d === 0) { Cr[base] = 0; Cr[base + 1] = 0; }
      else { Cr[base] = dr / d; Cr[base + 1] = -di / d; }
    }
    timings.cauchy += performance.now() - t0;

    t0 = performance.now();
    if (useQR) {
      const n = m - 1;
      useQR = nJ >= m;
      for (let k = 0; useQR && n > 0 && k < nRemoved; k++) {
        useQR = qrDeleteRow(Qq, Rq, M, mmax, n, removed[k], colScratch, rowScratch, rowScratch2);
      }
      if (useQR) {
        const fkr = fr[2 * n], fki = fr[2 * n + 1];
        colv.fill(0);
        for (let ii = 0; ii < nJ; ii++) {
          const ci = J[ii];
          const cBase = 2 * (ci + n * M);
          const cr = Cr[cBase], cim = Cr[cBase + 1];
          const dr = Fr[2 * ci] - fkr, di = Fr[2 * ci + 1] - fki;
          colv[2 * ci] = cr * dr - cim * di;
          colv[2 * ci + 1] = cr * di + cim * dr;
        }
        useQR = qrAppendColumn(Qq, Rq, M, mmax, n, colScratch, rowScratch);
      }
    }
    let svdRows = m;
    if (nJ === 0) {
      svdRows = 0;
    } else if (useQR) {
      // The matrix handed to zgesvd is the m x m triangular factor.
      for (let k = 0; k < m; k++) {
        const src = 2 * k * mmax, dst = 2 * k * m;
        for (let i = 0; i < 2 * (k + 1); i++) Av[dst + i] = Rqv[src + i];
        for (let i = 2 * (k + 1); i < 2 * m; i++) Av[dst + i] = 0;
      }
    } else {
      svdRows = nJ;
      for (let k = 0; k < m; k++) {
        const fkr = fr[2 * k], fki = fr[2 * k + 1];
        for (let ii = 0; ii < nJ; ii++) {
          const ci = J[ii];
          const cBase = 2 * (ci + k * M);
          const cr = Cr[cBase], cim = Cr[cBase + 1];
          const dr = Fr[2 * ci] - fkr, di = Fr[2 * ci + 1] - fki;
          const idx = 2 * (ii + k * nJ);
          Av[idx] = cr * dr - cim * di;
          Av[idx + 1] = cr * di + cim * dr;
        }
      }
    }
    timings.aMatrix += performance.now() - t0;

    for (let i = 0; i < 2 * m * m; i++) VTv[i] = 0;

    t0 = performance.now();
    const info = (nJ === 0) ? 0 : zgesvd(
      'none', 'all-rows', svdRows, m,
      Adata, 1, svdRows, 0,
      sData, 1, 0,
      UData, 1, 1, 0,
      VTData, 1, m, 0,
      WORK, 1, 0,
      RWORK, 1, 0
    );
    timings.svd += performance.now() - t0;

    if (info !== 0) console.warn('zgesvd info =', info);

    const lastRow = m - 1;
    for (let jj = 0; jj < m; jj++) {
      const idx = 2 * (lastRow + jj * m);
      wr[2 * jj] = VTv[idx];
      wr[2 * jj + 1] = -VTv[idx + 1];
    }
    if (nJ === 0) {
      // No sample points remain to constrain the weights; any nonzero weights
      // give an interpolant through the support points.
      for (let jj = 0; jj < m; jj++) { wr[2 * jj] = 1 / Math.sqrt(m); wr[2 * jj + 1] = 0; }
    }

    t0 = performance.now();

    for (let ii = 0; ii < nJ; ii++) {
      const ci = J[ii];
      let nr = 0, ni = 0, dr = 0, di = 0;
      for (let k = 0; k < m; k++) {
        const cBase = 2 * (ci + k * M);
        const cr = Cr[cBase], cim = Cr[cBase + 1];
        const wkr = wr[2 * k], wki = wr[2 * k + 1];
        const fkr = fr[2 * k], fki = fr[2 * k + 1];
        const wfr = wkr * fkr - wki * fki;
        const wfi = wkr * fki + wki * fkr;
        nr += cr * wfr - cim * wfi;
        ni += cr * wfi + cim * wfr;
        dr += cr * wkr - cim * wki;
        di += cr * wki + cim * wkr;
      }
      const d = dr * dr + di * di;
      Rr[2 * ci] = (nr * dr + ni * di) / d;
      Rr[2 * ci + 1] = (ni * dr - nr * di) / d;
    }
    timings.ratEval += performance.now() - t0;

    let err = 0;
    for (let i = 0; i < M; i++) {
      const a = Math.hypot(Fr[2 * i] - Rr[2 * i], Fr[2 * i + 1] - Rr[2 * i + 1]);
      if (a > err) err = a;
    }
    errvec.push(err);

    if (err <= tol * Fnorm) { converged = true; break; }
  }

  const zOut = new Array(m);
  const fOut = new Array(m);
  const wOut = new Array(m);
  for (let i = 0; i < m; i++) {
    zOut[i] = [zr[2 * i], zr[2 * i + 1]];
    fOut[i] = [fr[2 * i], fr[2 * i + 1]];
    wOut[i] = [wr[2 * i], wr[2 * i + 1]];
  }

  const t_prz = performance.now();
  const { pol, res, zer } = prz(zOut, fOut, wOut);
  timings.prz += performance.now() - t_prz;
  timings.total += performance.now() - t_total;

  return {
    converged,
    z: zOut, f: fOut, w: wOut,
    errvec,
    pol, res, zer,
    eval: (zv) => feval([zv], zOut, fOut, wOut)[0],
    delete: () => {},
  };
}
