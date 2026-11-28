// Real least-squares solver: a thin wrapper over the library's dgels
// (blocked Householder QR). Solves the overdetermined system A*x ≈ b in the
// least-squares sense.

import dgels from '../../lib/lapack/dgels/lib/ndarray.js';

// A: column-major Float64Array of size m*n (A[i + j*m] = A_{ij}); overwritten
//    with its QR factorization
// b: Float64Array of length m (overwritten)
// m: number of rows, n: number of columns (m >= n)
// Returns: Float64Array of length n (the least-squares solution x)
export function lssolve(A, b, m, n) {
  if (m < n) throw new Error('lssolve: need at least as many rows as columns');

  // n + max(n*NB, NB + TSIZE) with NB = 32, TSIZE = 4160: the size at which
  // dgels takes its blocked paths, which matter for the larger systems.
  const work = new Float64Array(n + Math.max(32 * n, 32 + 4160));
  const info = dgels('no-transpose', m, n, 1, A, 1, m, 0, b, 1, m, 0, work, 1, 0);
  if (info !== 0) throw new Error('lssolve: matrix is rank deficient (dgels info = ' + info + ')');

  return b.slice(0, n);
}
