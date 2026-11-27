// Vandermonde with Arnoldi (VA) orthogonalization.
// Reference: Brubeck & Trefethen, "Vandermonde with Arnoldi",
// SIAM Review 63(2), 2021.
//
// Replaces the ill-conditioned monomial basis [1, z, z², ..., z^n]
// with an orthonormal basis Q via Arnoldi iteration on the
// multiplication-by-z operator. The recurrence is encoded in an
// upper Hessenberg matrix H.
//
// Usage:
//   const H = vaOrthog(Z, n);        // Z: sample points, n: degree
//   const { q, dq } = vaEval(H, z);  // evaluate basis + derivative at z

// ---- Complex arithmetic (inline for performance) ----
function cmul_r(ar, ai, br, bi) { return ar * br - ai * bi; }
function cmul_i(ar, ai, br, bi) { return ar * bi + ai * br; }

// Compute the Hessenberg matrix for polynomial VA orthogonalization.
// Z: array of [re, im] sample points (M points)
// n: polynomial degree
// Returns: H as a flat Float64Array, (n+1) x n, column-major
//          H[i + j*(n+1)] = H_{i,j}
export function vaOrthog(Z, n) {
  const M = Z.length;
  const invM = 1 / M;

  // Q: M x (n+1) complex, column-major, interleaved re/im
  const Q = new Float64Array(2 * M * (n + 1));
  // H: (n+1) x n complex, column-major, interleaved re/im
  const H = new Float64Array(2 * (n + 1) * n);

  // Q(:,0) = ones(M,1)  (convention: ||Q(:,j)||² = M, so Q'Q/M = I)
  for (let i = 0; i < M; i++) {
    Q[2 * (i + 0 * M)] = 1;
    Q[2 * (i + 0 * M) + 1] = 0;
  }

  for (let k = 0; k < n; k++) {
    // q = Z .* Q(:,k)  (multiply each row by the corresponding sample point)
    // Stored temporarily in Q(:,k+1)
    const colK = k * M;
    const colK1 = (k + 1) * M;
    for (let i = 0; i < M; i++) {
      const qr = Q[2 * (i + colK)], qi = Q[2 * (i + colK) + 1];
      const zr = Z[i][0], zi = Z[i][1];
      Q[2 * (i + colK1)] = cmul_r(zr, zi, qr, qi);
      Q[2 * (i + colK1) + 1] = cmul_i(zr, zi, qr, qi);
    }

    // Modified Gram-Schmidt: orthogonalize against Q(:,0:k)
    for (let j = 0; j <= k; j++) {
      // H(j,k) = Q(:,j)' * q / M  (complex inner product, conjugate on first arg)
      let hr = 0, hi = 0;
      const colJ = j * M;
      for (let i = 0; i < M; i++) {
        const qjr = Q[2 * (i + colJ)], qji = Q[2 * (i + colJ) + 1];
        const qr = Q[2 * (i + colK1)], qi = Q[2 * (i + colK1) + 1];
        // conj(qj) * q
        hr += qjr * qr + qji * qi;
        hi += qjr * qi - qji * qr;
      }
      hr *= invM;
      hi *= invM;
      H[2 * (j + k * (n + 1))] = hr;
      H[2 * (j + k * (n + 1)) + 1] = hi;

      // q = q - H(j,k) * Q(:,j)
      for (let i = 0; i < M; i++) {
        const qjr = Q[2 * (i + colJ)], qji = Q[2 * (i + colJ) + 1];
        Q[2 * (i + colK1)] -= cmul_r(hr, hi, qjr, qji);
        Q[2 * (i + colK1) + 1] -= cmul_i(hr, hi, qjr, qji);
      }
    }

    // H(k+1,k) = norm(q) / sqrt(M)
    let norm2 = 0;
    for (let i = 0; i < M; i++) {
      const qr = Q[2 * (i + colK1)], qi = Q[2 * (i + colK1) + 1];
      norm2 += qr * qr + qi * qi;
    }
    const hkk = Math.sqrt(norm2 * invM);
    H[2 * ((k + 1) + k * (n + 1))] = hkk;
    H[2 * ((k + 1) + k * (n + 1)) + 1] = 0; // always real

    // Q(:,k+1) = q / H(k+1,k)
    if (hkk > 0) {
      const inv = 1 / hkk;
      for (let i = 0; i < M; i++) {
        Q[2 * (i + colK1)] *= inv;
        Q[2 * (i + colK1) + 1] *= inv;
      }
    }
  }

  return { H, n, Q, M };
}

// Evaluate the VA polynomial basis at a single point z.
// Returns q: array of n+1 complex values [q_0, q_1, ..., q_n]
// and optionally dq: derivatives [dq_0, ..., dq_n].
//
// The recurrence is:
//   q_0 = 1
//   q_{k+1} = (z * q_k - Σ_{j=0}^{k} H(j,k) * q_j) / H(k+1,k)
//
// For derivatives, differentiate the recurrence:
//   dq_0 = 0
//   dq_{k+1} = (q_k + z * dq_k - Σ_{j=0}^{k} H(j,k) * dq_j) / H(k+1,k)
//
// `out` is an optional { q, dq } pair of Float64Arrays of length 2*(n+1) to
// write into. Pass one when evaluating at many points: allocating two typed
// arrays per point costs several times more than the recurrence itself.
export function vaEval(va, z, out) {
  const { H, n } = va;
  const zr = z[0], zi = z[1];
  const stride = n + 1;

  // q and dq as flat interleaved arrays
  const q = out ? out.q : new Float64Array(2 * (n + 1));
  const dq = out ? out.dq : new Float64Array(2 * (n + 1));
  if (out) { q.fill(0); dq.fill(0); }

  q[0] = 1; q[1] = 0;   // q_0 = 1
  dq[0] = 0; dq[1] = 0; // dq_0 = 0

  for (let k = 0; k < n; k++) {
    // z * q_k
    let nr = cmul_r(zr, zi, q[2 * k], q[2 * k + 1]);
    let ni = cmul_i(zr, zi, q[2 * k], q[2 * k + 1]);
    // z * dq_k + q_k (for derivative)
    let dnr = cmul_r(zr, zi, dq[2 * k], dq[2 * k + 1]) + q[2 * k];
    let dni = cmul_i(zr, zi, dq[2 * k], dq[2 * k + 1]) + q[2 * k + 1];

    // Subtract Σ H(j,k) * q_j
    for (let j = 0; j <= k; j++) {
      const hjkr = H[2 * (j + k * stride)];
      const hjki = H[2 * (j + k * stride) + 1];
      nr -= cmul_r(hjkr, hjki, q[2 * j], q[2 * j + 1]);
      ni -= cmul_i(hjkr, hjki, q[2 * j], q[2 * j + 1]);
      dnr -= cmul_r(hjkr, hjki, dq[2 * j], dq[2 * j + 1]);
      dni -= cmul_i(hjkr, hjki, dq[2 * j], dq[2 * j + 1]);
    }

    // Divide by H(k+1,k) (always real)
    const hkk = H[2 * ((k + 1) + k * stride)];
    if (Math.abs(hkk) > 1e-300) {
      const inv = 1 / hkk;
      q[2 * (k + 1)] = nr * inv;
      q[2 * (k + 1) + 1] = ni * inv;
      dq[2 * (k + 1)] = dnr * inv;
      dq[2 * (k + 1) + 1] = dni * inv;
    }
  }

  return out || { q, dq };
}

// Evaluate the VA basis at sample points Z and return the Q matrix.
// This is the same as vaOrthog but just returns Q without recomputing H.
// Useful for building the least-squares system.
export function vaEvalBasis(va, Z) {
  const { H, n } = va;
  const M = Z.length;
  const stride = n + 1;

  // Q: M x (n+1) complex, column-major interleaved
  const Q = new Float64Array(2 * M * (n + 1));
  // D: M x (n+1) complex, derivatives
  const D = new Float64Array(2 * M * (n + 1));

  // Q(:,0) = 1
  for (let i = 0; i < M; i++) {
    Q[2 * (i + 0 * M)] = 1;
  }

  for (let k = 0; k < n; k++) {
    const colK = k * M;
    const colK1 = (k + 1) * M;
    const hkk = H[2 * ((k + 1) + k * stride)];
    const inv = Math.abs(hkk) > 1e-300 ? 1 / hkk : 0;

    for (let i = 0; i < M; i++) {
      const zr = Z[i][0], zi = Z[i][1];
      const qr = Q[2 * (i + colK)], qi = Q[2 * (i + colK) + 1];
      const dr = D[2 * (i + colK)], di = D[2 * (i + colK) + 1];

      // q_{k+1} = z * q_k
      let nr = cmul_r(zr, zi, qr, qi);
      let ni = cmul_i(zr, zi, qr, qi);
      // dq_{k+1} = z * dq_k + q_k
      let dnr = cmul_r(zr, zi, dr, di) + qr;
      let dni = cmul_i(zr, zi, dr, di) + qi;

      for (let j = 0; j <= k; j++) {
        const hjkr = H[2 * (j + k * stride)];
        const hjki = H[2 * (j + k * stride) + 1];
        nr -= cmul_r(hjkr, hjki, Q[2 * (i + j * M)], Q[2 * (i + j * M) + 1]);
        ni -= cmul_i(hjkr, hjki, Q[2 * (i + j * M)], Q[2 * (i + j * M) + 1]);
        dnr -= cmul_r(hjkr, hjki, D[2 * (i + j * M)], D[2 * (i + j * M) + 1]);
        dni -= cmul_i(hjkr, hjki, D[2 * (i + j * M)], D[2 * (i + j * M) + 1]);
      }

      Q[2 * (i + colK1)] = nr * inv;
      Q[2 * (i + colK1) + 1] = ni * inv;
      D[2 * (i + colK1)] = dnr * inv;
      D[2 * (i + colK1) + 1] = dni * inv;
    }
  }

  return { Q, D };
}
