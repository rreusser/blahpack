# zla_gercond_x: Translation Learnings

## Translation pitfalls

- Fortran `CABS1(A(I,J) * X(J))` computes CABS1 of the **complex product**,
  not `CABS1(A)*CABS1(X)`. The two are not equal in general, so the row-sum
  loop must multiply first and then take `|re| + |im|`. Getting this wrong
  changes the computed anorm and thus the final reciprocal condition number.
- The Fortran source accepts `'T'` here, but `ZLA_GERCOND_X` always selects
  one of the two branches (`NOTRANS` vs else) and uses
  `'Conjugate transpose'` in the `ZGETRS` calls of the else branch. The JS
  wrapper therefore forwards only `'no-transpose'` or `'conjugate-transpose'`.
  (`'T'` in Fortran silently reuses the `'C'` path via the LU factor — we
  do not replicate that because `isTransposeOperation` accepts the explicit
  strings.)
- The Fortran `WORK( N+1 )` passed to `ZLACN2` is the V workspace; in JS
  this is `offsetWORK + N*strideWORK` (the upper half of the `2*N` complex
  workspace), with `X = WORK` at its base. Mirrors `dla_gercond`.

## Dependency interface surprises

- `zlacn2` signature: `(N, V, sV, oV, X, sX, oX, EST, KASE, ISAVE, sISAVE, oISAVE)`.
  It takes strides/offsets in **complex elements**; it handles `*2` internally.
- `zgetrs` accepts `'no-transpose'`, `'transpose'`, `'conjugate-transpose'`;
  the `'C'` path in Fortran maps to `'conjugate-transpose'` here.
- The `zla_gercond_x` Fortran routine needs the transitive link deps
  `zrscl` and `zdrscl` for `zgetf2` — these are not listed by `deps.py`
  but are required for `run_fortran.sh` to link the test.

## Complex number handling

- The inner loop product `A(i,j)*X(j)` is safe to inline (two multiply-add
  pairs), and we take `|re|+|im|` (CABS1) rather than full `cabs` — this
  matches Fortran's `CABS1`.
- Complex division `WORK(i) / X(i)` in the zlacn2 apply loop uses
  `cmplx.divAt`, which is Smith's robust formula. Never inline complex
  division.
- `RWORK` is a real `Float64Array` of length `N`, not a complex array; its
  stride and offset are in doubles (not complex elements).
