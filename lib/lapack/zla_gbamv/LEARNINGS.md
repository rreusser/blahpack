# zla_gbamv: Translation Learnings

## Translation pitfalls

- **Fortran JX=KX reset per row is a true quirk, not a bug to fix.** The Fortran
  reference `zla_gbamv` (and `dla_gbamv`) has two inner-loop variants:
  the `INCX==1` path uses `X(J)` (indexed by the band column), but the
  `INCX!=1` path sets `JX = KX` at the top of every outer row and advances
  by `INCX` per inner iteration. This means with non-unit stride, each row
  reads `x(KX), x(KX+INCX), ...` starting from the beginning, regardless of
  the band column offset. This is a semantic divergence between the two
  branches that must be replicated exactly or tests against Fortran fixtures
  with `INCX != 1` will disagree.
- **TRANS branch uses KE=KL+1 with reversed axis.** The transpose-mode band
  access is `AB(KE-I+J, I)` where `KE = KL+1`, and the inner loop bounds are
  the same `MAX(I-KL,1)..MIN(I+KU,LENX)` as the no-trans branch. This looks
  wrong at first glance (standard band access for A^T would use `KU+1+j-i`),
  but is how the routine is written in reference LAPACK. Faithful translation
  is the rule; do not "correct" it.
- **KL > M-1 / KU > N-1 fail parameter validation in Fortran**, so the N=0 /
  M=0 quick-return cases could not be tested via the Fortran fixture pipeline
  (XERBLA trips on KU=0 > N-1=-1). Cover quick-return branches with
  hand-written JS tests instead.
- **Band storage strides:** `strideAB1` and `strideAB2` are in complex
  elements; reinterpret yields a Float64 view so `sab1 = strideAB1*2`, and
  the (row--, col++) advance in the no-trans inner loop is
  `ia += sab2 - sab1` (not `sab2 + sab1`).

## Dependency interface surprises

- None. `dlamch('safe-minimum')` hoisted at module load as usual.

## Complex number handling

- `CABS1(z) = |re| + |im|` (NOT the true modulus). Because `|conj(z)| = |z|`,
  `'transpose'` and `'conjugate-transpose'` share the same code path.
- AB and x are `Complex128Array` (reinterpreted as Float64); y is real
  `Float64Array`. Doubling strides for the Float64 view is the only complex
  bookkeeping needed.

## Codemod interaction (infrastructure note)

- `bin/codemod-tests.js` was rewriting `'use strict';\n\n// MODULES //` to
  have two blank lines, which violates `stdlib/section-header-empty-lines`
  (rule requires exactly one blank line when the section header immediately
  follows `'use strict';`). Added a final pass in the codemod to collapse
  blank lines after `'use strict';` before a section header back to a single
  blank. This fixed a latent lint failure in `zla_geamv` and other sibling
  modules too.
