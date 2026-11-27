# dsytri_rook: Translation Learnings

## Translation pitfalls

- Structurally identical to `dsytri` (non-rook), with one critical
  difference in the 2x2 pivot interchange step: rook pivoting performs
  TWO sequential pivot swaps per 2x2 block (one for `K` and one for
  `K+1` in upper, or `K` and `K-1` in lower) using two independent
  values from `IPIV`, whereas the partial-pivoting variant only swaps
  once and re-uses the same negative entry. Each call site decodes
  `kp = ~IPIV[k-1] + 1` (bitwise NOT to recover 0-based index, +1 for
  1-based).
- The 1x1 pivot interchange in dsytri_rook (upper) also adds a guard
  `if (kp > 1)` before the leading-row dswap, matching dsytri but
  worth double-checking against the Fortran since `K-KP-1` can be
  negative when `KP === K-1` (dswap with N<=0 is a no-op).

## Dependency interface surprises

- None — dcopy, ddot, dswap, dsymv use the standard
  `(N, ...args, stride, offset)` convention.

## Coverage / test notes

- Used the same fixture matrix set as dsytri so the 2x2-block paths
  are exercised by `4x4_indef_2x2_*` cases. Hand-built 2x2 singular
  fixtures cover the `info > 0` branches for both upper and lower.
