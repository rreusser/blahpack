# dlarfy: Translation Learnings

Short, self-contained routine from LAPACK test support. Applies a
symmetric two-sided Householder update `C := H*C*H` where
`H = I - tau*v*v'`.

## Translation pitfalls

- Quick return on `tau == 0` must be preserved — callers rely on it
  to use a zero tau as "no-op / identity".
- `WORK` is a caller-provided buffer of length `N` (passed through
  the base signature as `WORK, strideWORK, offsetWORK`), not allocated
  internally. This matches the LAPACK reference and the stdlib-js
  convention used by other LAPACK routines with WORK parameters.
- `dsymv` is called with `beta = 0.0`, which initializes `WORK`
  without requiring the caller to pre-zero it.

## Dependency interface surprises

- None. `dsymv`, `ddot`, `daxpy`, and `dsyr2` use the conventional
  stdlib-js base signatures `(N, ..., stride, offset, ...)`, and the
  translation is a nearly line-for-line mapping of the reference
  Fortran (4 BLAS calls).

## Testing notes

- Tested both `UPLO='upper'` and `UPLO='lower'` paths explicitly
  against Fortran fixtures. dsymv/dsyr2 branch on UPLO internally,
  so covering both paths in dlarfy exercises both branches end-to-end.
- `tau = 0` quick-return path is covered by a dedicated test that
  asserts `C` is unmodified.
- Non-unit `strideV` is verified by comparing the result with the
  unit-stride variant on the same input.
- `N = 0` and `N = 1` edge cases are both exercised.
