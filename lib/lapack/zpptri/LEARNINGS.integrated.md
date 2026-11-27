# zpptri: Translation Learnings

## Translation pitfalls

- The Fortran upper branch uses `JJ = 0` then `JJ = JJ + J` (1-based). In JS
  0-based, this becomes `jj = offset - 1` then `jj += j` (with j starting at 1),
  so the first iteration sets `jj = offset` correctly. Missing the `-1`
  initialization would cause an off-by-one.
- In the lower branch, `JJ = 1` in Fortran maps to `jj = offset` in JS, while
  `JJN = JJ + N - J + 1` uses Fortran 1-based loop variable `J`. The loop
  variable was kept 1-based in JS for direct Fortran correspondence.

## Dependency interface surprises

- `zdscal` takes a real scalar (`da`), not a Complex128. This matches the
  Fortran `ZDSCAL` which scales by a double precision constant.
- `zhpr` signature: `(uplo, N, alpha, x, strideX, offsetX, AP, strideAP, offsetAP)`.
  The `x` and `AP` args can be the same Complex128Array since zhpr operates in-place.
- `ztpmv` needs 10 args: `(uplo, trans, diag, N, AP, strideAP, offsetAP, x, strideX, offsetX)`.
  The AP matrix arg and x vector arg can also be the same array with different offsets.

## Automation opportunities

- Fortran test compilation deps (`deps_zpptri.txt`) must manually include
  `zpptrf` because the test calls it, even though zpptrf is not a dependency
  of zpptri itself.

## Coverage gaps

- Stride != 1 paths are not tested (packed storage routines typically always
  use stride 1 in practice).

## Complex number handling

- The lower branch's `ZDOTC(N-J+1, AP(JJ), 1, AP(JJ), 1)` computes the
  conjugate dot product of a vector with itself, which is always real
  (`sum(|z_k|^2)`). This was inlined as a simple loop computing
  `re^2 + im^2` to avoid allocating a Complex128 object. The result is
  stored as `(ajj, 0.0)` into the diagonal since Hermitian matrices
  have real diagonals.
- The upper branch reads only the real part of the diagonal (`APv[jj*2]`)
  since after ztptri the diagonal elements of the inverted Cholesky factor
  are real (non-unit triangular with real diagonal from the Cholesky factorization).
