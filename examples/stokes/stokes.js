// 2D Stokes flow solver via Goursat functions and lightning rational approximation.
// Reference: Xue, Waters, Trefethen, "Computation of 2D Stokes flows via lightning
// and AAA rational approximation", arXiv:2306.13545v2, 2023.
//
// Uses Vandermonde with Arnoldi (VA) orthogonalization for the polynomial basis.
// Reference: Brubeck & Trefethen, "Vandermonde with Arnoldi", SIAM Review 63(2), 2021.

import { lssolve } from '../laplace/lssolve.js';
import { vaOrthog, vaEval, vaEvalBasis } from '../lib/va-orthog.js';

// ---- Complex arithmetic ----
const cadd = (a, b) => [a[0] + b[0], a[1] + b[1]];
const csub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const cmul = (a, b) => [a[0]*b[0] - a[1]*b[1], a[0]*b[1] + a[1]*b[0]];
const cdiv = (a, b) => {
  const d = b[0]*b[0] + b[1]*b[1];
  return [(a[0]*b[0] + a[1]*b[1]) / d, (a[1]*b[0] - a[0]*b[1]) / d];
};

// ---- Lightning pole placement ----
function placeLightningPoles(corner, angle, N, sigma, L) {
  const poles = [];
  const sqrtN = Math.sqrt(N);
  for (let n = 1; n <= N; n++) {
    const t = L * Math.exp(-sigma * (sqrtN - Math.sqrt(n)));
    poles.push([
      corner[0] + t * Math.cos(angle),
      corner[1] + t * Math.sin(angle),
    ]);
  }
  return poles;
}

// ---- Main Stokes solver ----
export function stokes(options = {}) {
  const {
    N = 24,
    nPoly = 20,
    nSample = 200,
    sigma = 4,
    L = 2,
    corners = [[-1,-1], [1,-1], [1,1], [-1,1]],
    bisectors = [-3*Math.PI/4, -Math.PI/4, Math.PI/4, 3*Math.PI/4],
    // Boundary condition function. Returns { psi, tangent } where:
    //   psi: stream function value (typically 0 on all walls)
    //   tangent: tangential velocity component
    //   tangentDir: 'u' or 'v' (which velocity component is tangential)
    boundaryBC = ([x, y]) => {
      if (Math.abs(y - 1) < 1e-10) return { psi: 0, tangent: 1, tangentDir: 'u' };   // top lid
      if (Math.abs(y + 1) < 1e-10) return { psi: 0, tangent: 0, tangentDir: 'u' };   // bottom
      if (Math.abs(x - 1) < 1e-10) return { psi: 0, tangent: 0, tangentDir: 'v' };   // right
      if (Math.abs(x + 1) < 1e-10) return { psi: 0, tangent: 0, tangentDir: 'v' };   // left
      return { psi: 0, tangent: 0, tangentDir: 'u' };
    },
  } = options;

  // ---- Step 1: Place lightning poles ----
  const allPoles = [];
  for (let k = 0; k < corners.length; k++) {
    allPoles.push(...placeLightningPoles(corners[k], bisectors[k], N, sigma, L));
  }
  const nPoles = allPoles.length;

  // ---- Step 2: Boundary sample points ----
  const boundary = [];
  const sides = [
    [corners[0], corners[1]], [corners[1], corners[2]],
    [corners[2], corners[3]], [corners[3], corners[0]],
  ];
  for (const [start, end] of sides) {
    for (let i = 1; i <= nSample; i++) {
      const t = i / (nSample + 1);
      boundary.push([
        start[0] + t * (end[0] - start[0]),
        start[1] + t * (end[1] - start[1]),
      ]);
    }
  }
  const M = boundary.length;

  // ---- Step 3: VA orthogonalization for polynomial basis ----
  const va = vaOrthog(boundary, nPoly);
  const { Q: polyQ, D: polyD } = vaEvalBasis(va, boundary);

  // ---- Step 4: Build least-squares system ----
  // Basis for each Goursat function: nPoles rational + (nPoly+1) VA polynomial
  const nBasisRat = nPoles;
  const nBasisPoly = nPoly + 1;
  const nBasisF = nBasisRat + nBasisPoly;
  // g excludes degree-0 polynomial (gauge freedom: g constant doesn't affect velocity)
  const nBasisG = nBasisRat + nPoly;
  const nCols = 2 * nBasisF + 2 * nBasisG;
  const nRows = 2 * M;

  const A = new Float64Array(nRows * nCols);
  const b = new Float64Array(nRows);

  for (let j = 0; j < M; j++) {
    const z = boundary[j];
    const x = z[0], y = z[1];
    const bc = boundaryBC(z);

    // Row j: ψ = bc.psi constraint
    // Row M+j: tangential velocity = bc.tangent
    b[j] = bc.psi;
    b[M + j] = bc.tangent;

    for (let k = 0; k < nBasisF + nBasisG; k++) {
      const isG = k >= nBasisF;
      const kk = isG ? k - nBasisF : k;

      let pr, pi, dpr, dpi;

      if (kk < nBasisRat) {
        const dz = [z[0] - allPoles[kk][0], z[1] - allPoles[kk][1]];
        const d = dz[0]*dz[0] + dz[1]*dz[1];
        pr = dz[0] / d;
        pi = -dz[1] / d;
        const d2 = d * d;
        dpr = -(dz[0]*dz[0] - dz[1]*dz[1]) / d2;
        dpi = 2*dz[0]*dz[1] / d2;
      } else {
        const polyIdx = kk - nBasisRat + (isG ? 1 : 0);
        pr = polyQ[2 * (j + polyIdx * M)];
        pi = polyQ[2 * (j + polyIdx * M) + 1];
        dpr = polyD[2 * (j + polyIdx * M)];
        dpi = polyD[2 * (j + polyIdx * M) + 1];
      }

      const colRe = isG ? 2*nBasisF + 2*kk : 2*kk;
      const colIm = colRe + 1;

      // ---- Row j: ψ = Im[z̄ f + g] ----
      // For f basis φ with coeff c = cr+ici:
      //   Im[z̄ * c * φ] = Im[(x-iy)(cr+ici)(pr+ipi)]
      //   = x*(cr*pi + ci*pr) - y*(cr*pr - ci*pi)
      //   ψ from cr: x*pi - y*pr
      //   ψ from ci: x*pr + y*pi
      // For g basis φ with coeff d = dr+idi:
      //   Im[d * φ] = dr*pi + di*pr
      //   ψ from dr: pi
      //   ψ from di: pr
      if (isG) {
        A[j + colRe * nRows] = pi;
        A[j + colIm * nRows] = pr;
      } else {
        A[j + colRe * nRows] = x*pi - y*pr;
        A[j + colIm * nRows] = x*pr + y*pi;
      }

      // ---- Row M+j: tangential velocity ----
      // u = Re[-conj(f) + z̄ f' + g']
      // v = -Im[-conj(f) + z̄ f' + g']
      let u_cr, u_ci, v_cr, v_ci;
      if (isG) {
        u_cr = dpr; u_ci = -dpi;
        v_cr = -dpi; v_ci = -dpr;
      } else {
        u_cr = -pr + x*dpr + y*dpi;
        u_ci = pi - x*dpi + y*dpr;
        v_cr = -(pi + x*dpi - y*dpr);
        v_ci = -(pr + x*dpr + y*dpi);
      }

      if (bc.tangentDir === 'u') {
        A[M + j + colRe * nRows] = u_cr;
        A[M + j + colIm * nRows] = u_ci;
      } else {
        A[M + j + colRe * nRows] = v_cr;
        A[M + j + colIm * nRows] = v_ci;
      }
    }
  }

  // ---- Step 5: Remove zero columns and solve ----
  const colNorms = new Float64Array(nCols);
  for (let c = 0; c < nCols; c++) {
    let norm2 = 0;
    for (let r = 0; r < nRows; r++) norm2 += A[r + c * nRows] ** 2;
    colNorms[c] = norm2;
  }
  const activeCols = [];
  for (let c = 0; c < nCols; c++) {
    if (colNorms[c] > 1e-30) activeCols.push(c);
  }
  const nActive = activeCols.length;
  const Ar = new Float64Array(nRows * nActive);
  for (let j = 0; j < nActive; j++) {
    const c = activeCols[j];
    for (let r = 0; r < nRows; r++) Ar[r + j * nRows] = A[r + c * nRows];
  }
  const br = new Float64Array(b);
  const xr = lssolve(Ar, br, nRows, nActive);
  const coeffs = new Float64Array(nCols);
  for (let j = 0; j < nActive; j++) coeffs[activeCols[j]] = xr[j];

  // ---- Step 6: Extract coefficients ----
  const fRatCoeffs = [], fPolyCoeffs = [];
  const gRatCoeffs = [], gPolyCoeffs = [];

  for (let k = 0; k < nBasisF; k++) {
    const cr = coeffs[2*k], ci = coeffs[2*k + 1];
    if (k < nBasisRat) fRatCoeffs.push([cr, ci]);
    else fPolyCoeffs.push([cr, ci]);
  }
  gPolyCoeffs.push([0, 0]); // degree 0 = 0 (gauge)
  for (let k = 0; k < nBasisG; k++) {
    const cr = coeffs[2*nBasisF + 2*k], ci = coeffs[2*nBasisF + 2*k + 1];
    if (k < nBasisRat) gRatCoeffs.push([cr, ci]);
    else gPolyCoeffs.push([cr, ci]);
  }

  // ---- Step 7: Build evaluator ----
  // Scratch for the VA basis values, reused across evaluate() calls.
  const vaScratch = {
    q: new Float64Array(2 * (nPoly + 1)),
    dq: new Float64Array(2 * (nPoly + 1)),
  };

  function evaluate(z) {
    // Evaluate VA basis at z
    const { q, dq } = vaEval(va, z, vaScratch);

    // f(z) = Σ c_k/(z-β_k) + Σ a_n * q_n(z)
    let fr = 0, fi = 0, fdr = 0, fdi = 0;
    for (let k = 0; k < nPoles; k++) {
      const dz = csub(z, allPoles[k]);
      const d = dz[0]*dz[0] + dz[1]*dz[1];
      const ir = dz[0]/d, ii = -dz[1]/d;
      fr += fRatCoeffs[k][0]*ir - fRatCoeffs[k][1]*ii;
      fi += fRatCoeffs[k][0]*ii + fRatCoeffs[k][1]*ir;
      const d2 = d*d;
      const i2r = -(dz[0]*dz[0]-dz[1]*dz[1])/d2;
      const i2i = 2*dz[0]*dz[1]/d2;
      fdr += fRatCoeffs[k][0]*i2r - fRatCoeffs[k][1]*i2i;
      fdi += fRatCoeffs[k][0]*i2i + fRatCoeffs[k][1]*i2r;
    }
    for (let n = 0; n < fPolyCoeffs.length; n++) {
      fr += fPolyCoeffs[n][0]*q[2*n] - fPolyCoeffs[n][1]*q[2*n+1];
      fi += fPolyCoeffs[n][0]*q[2*n+1] + fPolyCoeffs[n][1]*q[2*n];
      fdr += fPolyCoeffs[n][0]*dq[2*n] - fPolyCoeffs[n][1]*dq[2*n+1];
      fdi += fPolyCoeffs[n][0]*dq[2*n+1] + fPolyCoeffs[n][1]*dq[2*n];
    }

    // g(z) = Σ d_k/(z-β_k) + Σ b_n * q_n(z)
    let gr = 0, gi = 0, gdr = 0, gdi = 0;
    for (let k = 0; k < nPoles; k++) {
      const dz = csub(z, allPoles[k]);
      const d = dz[0]*dz[0] + dz[1]*dz[1];
      const ir = dz[0]/d, ii = -dz[1]/d;
      gr += gRatCoeffs[k][0]*ir - gRatCoeffs[k][1]*ii;
      gi += gRatCoeffs[k][0]*ii + gRatCoeffs[k][1]*ir;
      const d2 = d*d;
      const i2r = -(dz[0]*dz[0]-dz[1]*dz[1])/d2;
      const i2i = 2*dz[0]*dz[1]/d2;
      gdr += gRatCoeffs[k][0]*i2r - gRatCoeffs[k][1]*i2i;
      gdi += gRatCoeffs[k][0]*i2i + gRatCoeffs[k][1]*i2r;
    }
    for (let n = 0; n < gPolyCoeffs.length; n++) {
      gr += gPolyCoeffs[n][0]*q[2*n] - gPolyCoeffs[n][1]*q[2*n+1];
      gi += gPolyCoeffs[n][0]*q[2*n+1] + gPolyCoeffs[n][1]*q[2*n];
      gdr += gPolyCoeffs[n][0]*dq[2*n] - gPolyCoeffs[n][1]*dq[2*n+1];
      gdi += gPolyCoeffs[n][0]*dq[2*n+1] + gPolyCoeffs[n][1]*dq[2*n];
    }

    // ψ = Im[conj(z) * f + g] = x*fi - y*fr + gi
    const psi = z[0]*fi - z[1]*fr + gi;
    // u - iv = -conj(f) + conj(z)*f' + g'
    const ur = -fr + z[0]*fdr + z[1]*fdi + gdr;
    const ui = fi + z[0]*fdi - z[1]*fdr + gdi;
    const u = ur, v = -ui;
    const pressure = 4 * fdr;
    const vorticity = -4 * fdi;
    const speed = Math.sqrt(u*u + v*v);

    return { psi, u, v, pressure, vorticity, speed };
  }

  // ---- Step 8: Boundary error ----
  let maxError = 0;
  for (let j = 0; j < M; j++) {
    const { psi, u, v } = evaluate(boundary[j]);
    const bc = boundaryBC(boundary[j]);
    const psiErr = Math.abs(psi - bc.psi);
    const tanErr = Math.abs((bc.tangentDir === 'u' ? u : v) - bc.tangent);
    const err = Math.max(psiErr, tanErr);
    if (err > maxError) maxError = err;
  }

  return {
    poles: allPoles,
    fRatCoeffs, fPolyCoeffs,
    gRatCoeffs, gPolyCoeffs,
    nPoles, nPoly,
    corners, boundary,
    maxError, evaluate,
    va, // Hessenberg data for GPU evaluation
  };
}
