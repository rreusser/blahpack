# zla_syrcond_x: Translation Learnings

## Translation pitfalls

- The Fortran reference has a subtle bug: the early-return block for `N.EQ.0`
  executes **after** reading the row sums of `A*diag(X)` into `RWORK`, so in
  the Fortran version `N=0` silently returns `ANORM=0` from the declaration
  default and then `1.0` from the `N.EQ.0` branch. The JS version hoists the
  `N===0` check to the very top of the routine — matching `zla_gercond_x` and
  avoiding any accidental indexing into empty workspaces.
- For the symmetric case, the two sub-loops over `j` iterate over
  `j=1..i` and `j=i+1..N`. The `UP` branch reads `A(j,i)` (column `i`, upper
  triangle) in the first sub-loop and `A(i,j)` (row `i`, upper triangle) in
  the second. The `LO` branch does the mirror: `A(i,j)` then `A(j,i)`. Both
  branches read only the stored triangle — no symmetrization fill-in needed.

## Dependency interface surprises

- `zsytrs` exists only in ndarray form (no layout wrapper needed here because
  we already pass strides via the base entry point).
- `zlacn2` uses the shared WORK vector for both `V` (at `offset + N`) and `X`
  (at `offset`), same pattern as `zla_gercond_x` and `zla_gercond_c`.

## Complex number handling

- `CABS1(A(i,j) * X(j))` is evaluated on the complex product, not on
  `|A(i,j)|*|X(j)|`. The two are not equal for complex numbers. The product
  is expanded inline: `(ar*xr - ai*xi) + i*(ar*xi + ai*xr)`, then
  `CABS1 = |Re| + |Im|`.
- Complex division `WORK(i) / X(i)` uses `cmplx.divAt` (robust Baudin-Smith)
  rather than inline naive division, per the project-wide rule.
- Because `A` is complex **symmetric** (not Hermitian), no conjugation is
  applied when reading the mirrored triangle. This is the only structural
  difference from `zla_hercond_*` which would conjugate.
