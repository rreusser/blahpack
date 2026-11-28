# dpstrf: Translation Learnings

## Translation pitfalls

- The blocked path (N > NB=64) requires care with the trailing dsyrk update:
  `j` is the column index after the inner loop exits, not a fresh variable.
  The Fortran uses the loop variable `J` which retains its last value after
  the DO loop completes. In JS this is natural since `j` is function-scoped.
- The in-between swap segment (`A(j, j+1:pvt-1) <-> A(j+1:pvt-1, pvt)` for upper)
  uses different strides for the two arguments: one walks along a row (stride=sa2),
  the other along a column (stride=sa1). This is the symmetric pivot swap pattern.
- PIV is 0-based in JS vs 1-based in Fortran. Fixtures store 1-based values;
  tests subtract 1 when comparing.

## Dependency interface surprises

- dsyrk takes 14 arguments: `(uplo, trans, N, K, alpha, A, sa1, sa2, offsetA, beta, C, sc1, sc2, offsetC)`.
- dgemv takes 15 arguments: `(trans, M, N, alpha, A, sa1, sa2, offsetA, x, sx, ox, beta, y, sy, oy)`.
- Both use string enum values like `'transpose'`, `'no-transpose'`, `'upper'`, `'lower'`
  (not single characters like Fortran).

## Automation opportunities

- The dpstrf blocked code is structurally identical to zpstrf minus complex
  conjugation/zlacgv and with dsyrk instead of zherk. A template could
  generate both from a single source.

## Coverage gaps

- Lines 120-122 (initial ajj <= 0 / NaN check): would require a zero or
  negative-definite matrix of size > NB to hit in the blocked path. The
  small-matrix tests cover this via dpstf2 delegation.
- Lines 163-168 / 252-257 (rank-deficient detection in blocked inner loop):
  small rank-deficient matrices go through dpstf2, not the blocked path.
  A rank-deficient matrix of size > 64 would be needed to cover these.
  Coverage is 94.69% which is acceptable.

## Complex number handling

- N/A: dpstrf is a real-valued routine. No reinterpret, zlacgv, or conjugation needed.
