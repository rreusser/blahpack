# dorbdb4: Translation Learnings

## Translation pitfalls

- The variant-4 outer loop bounds (`DO I = 1, M-Q`) and the trailing
  cleanup loops (`DO I = M-Q+1, P` and `DO I = P+1, Q`) operate on a
  *column* index that is one less than the row index used everywhere
  else. The "phantom" branch (i==0) writes alpha into PHANTOM(0/P) and
  the bottom-half reflectors; the i>0 branch operates on
  `X11(I, I-1)`/`X21(I, I-1)` (column `i-1`, row starting at `i`).
  Translating mechanically off `dorbdb1` will get the column index
  wrong — every working column is `i-1`, not `i`. The trailing loops
  use working row `M-Q+i-P` for the X21 cleanup, which only makes
  sense when you walk through the dimension constraint `M-Q <= P`.
- `ATAN2(X11(I,I-1), X21(I,I-1))` reverses the argument order relative
  to the conventional `atan2(y, x)` mental model. Be careful — the
  ratio inside the bidiagonal is X11/X21 here (not X21/X11 like
  dorbdb1), and the subsequent `DROT(..., S, -C)` swaps them again.
  The Givens rotation's `(s, -c)` argument is also load-bearing: a
  conventional `(c, s)` would zero a different row.
- The Fortran allocates `WORK(1)` as the LWORKOPT report slot, then
  `WORK(2)` as the actual scratch base for both DLARF (`ILARF=2`) and
  DORBDB5 (`IORBDB5=2`). In JS we drop LWORK entirely — `offsetWORK`
  points directly at scratch. The minimum WORK size is
  `max(P-1, M-P-1, Q-1, Q) + 1`, NOT just `M-Q` (the user-visible
  Fortran lower bound). The DORBDB5 call needs `LORBDB5 = Q` doubles,
  which dominates `LLARF = max(Q-1, P-1, M-P-1)` when `Q >= P`.
- The Fortran source uses `**` exponentiation for `dnrm2(...)**2`. As
  documented in the dorbdb1 LEARNINGS, prefer `n*n` temporaries over
  the `**` operator project-wide.

## Test-design pitfalls

- The variant-4 dimension constraints differ from dorbdb1's. dorbdb1
  requires `Q <= min(P, M-P, M-Q)`; dorbdb4 requires
  `M-Q <= min(P, M-P, Q)`. Generating test cases that *just barely*
  satisfy one constraint set won't satisfy the other — the same test
  fixtures cannot be reused. To exercise the three internal loops, I
  used five cases: a generic case with all three loops non-empty, a
  larger generic case, a `P=Q` case (third cleanup loop is empty), a
  `P` small / `Q` large case (third cleanup loop wider than second),
  and `M=Q` (outer phantom loop never runs, only the cleanup loops).
- The Fortran-test `LWORK` parameter must be at least `Q+1` (not
  `M-Q`); the routine reports `INFO=-14` via XERBLA otherwise. I
  initially passed `M-Q` (the documented user lower bound) and got a
  silent xerbla diagnostic that produced a fixture file with one line
  containing the error message. Pass `NMAX*NMAX` and stop worrying.
- Reused dorbdb1's MGS-twice orthonormalization (`init_orthonormal_columns`),
  same FP-order divergence concerns, same fix: print `X11in`/`X21in`
  into the fixture and reload them in JS rather than recomputing.

## Dependency interface surprises

- `dorbdb5` API: when called from dorbdb4 the X1 / X2 vectors are
  `PHANTOM(0..P-1)` / `PHANTOM(P..M-1)` in the i=0 branch (two
  segments of one array) and `X11(i:, i-1)` / `X21(i:, i-1)` in the
  i>0 branch (single column slices). dorbdb5's first six args
  (`m1, m2, N, X1, strideX1, offsetX1`) treat X1 as a strided vector,
  so we just pass the same array twice with two offsets — no need to
  copy.
- `dscal(N, da, ...)` takes the scalar `da` directly, not an array.
  Easy to confuse with `drot`'s `(c, s)` scalar arguments. The `-1.0`
  literal scales work as expected.
- `dlarfgp(N, alpha, offsetAlpha, x, strideX, offsetX, tau, offsetTau)`
  passes alpha as `(array, offset)`. Both alpha and x are typically
  inside the same array (PHANTOM, X11, X21) at adjacent offsets.

## Coverage notes

- 100% line + 100% branch on `base.js`, `ndarray.js`, `dorbdb4.js`,
  `index.js`, and `main.js`. The five fixture cases collectively
  exercise the i==0 phantom branch, the i>0 branch, the inner
  `i < M-Q-1` PHI/dnrm2 path, the second cleanup loop (X11), the
  third cleanup loop (X21), and the empty-third-loop case.

## Process improvements

- The scaffolded `deps_<routine>.txt` from `init_routine.py` is
  missing the BLAS dependencies (`dnrm2`, `dscal`, `drot`, `dgemv`,
  `dger`) and the Fortran modules (`la_constants`, `la_xisnan`),
  even though `python bin/deps.py dorbdb4` lists them. The Fortran
  test compiles even without them (the `Warning: dependency ... not
  found` lines are non-fatal because the linker resolves them via
  the system BLAS), but for completeness I added them by hand. The
  scaffolder should consult `deps.py` (or `deps.py --order`) directly
  rather than re-discovering deps.
- The scaffolded `<routine>.js` had the same N-undefined / wrong
  LD-bound bugs as dorbdb1 (rows-vs-cols guess for non-square
  matrices). Fixed by hand using the dorbdb1 wrapper as the template.
- The scaffolded benchmark `benchmark.js` and `benchmark.ndarray.js`
  use `uniform( N*N, ... )` for everything, including arrays that
  should be `Q` or `M-Q` long. They also call `dorbdb4(N, N, N, ...)`
  which violates the dimension constraints (M-Q=0, but P=Q=M means
  `M-Q <= min(P,M-P,Q) = min(M,0,M) = 0` would pass — until you note
  M-P=0 forces a degenerate `dorbdb5(P, 0, Q, ...)` call). Replaced
  with a real `makeInputs(M)` that builds orthonormal columns, sets
  `P=M/2` and `Q=3M/4`, and uses correctly-sized output buffers.
- The signature-conformance ESLint rule warns "32 params, expected
  29" because the rule's expected pattern doesn't include `WORK`'s
  `(stride, offset)` parameters. dorbdb1 has the same warning. This
  warning is benign — every LAPACK routine with a workspace will hit
  it — and the rule should learn to allow optional `WORK`.
