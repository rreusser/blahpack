# dgsvj1: Translation Learnings

## Translation pitfalls

- `dgsvj1` is the off-diagonal-block companion of `dgsvj0`. Structurally
  it is a strict subset: there is no `ir1` lookahead, no in-loop de Rijk
  pivoting, and no `ibr` p-loop diagonal sweep. The only nesting is
  `i (sweep) > ibr (row-tile) > jbc (col-tile) > p > q`. Modeling on
  dgsvj0 worked cleanly — copy the off-diagonal `for ( jbc ... )` block
  almost verbatim and drop the diagonal-block ir1 sub-loop.
- The `notrot += 1` increments inside the q-loop are unconditional
  (unlike `dgsvj0`, where the diagonal loop guards them with
  `if (ir1 === 0)`). There is no per-pass guard here because every
  q-loop pass is the only one that pivot will see in this sweep.
- `emptsw = n1 * (N - n1)` (count of `(p,q)` pairs in the off-diagonal
  block), NOT `N*(N-1)/2` like dgsvj0. Easy to copy-paste wrong.
- The Fortran does `EMPTSW = N1*(N-N1)` even when `n1 = 0` (giving
  `emptsw = 0`); the very first sweep then trips
  `notrot >= emptsw` (0 >= 0 vacuously) and we go to label 1994 with
  `info = 0`. Our test `novec_n1_0` confirms this — the routine returns
  `info = 0` and the matrix is unchanged. Make sure not to special-case
  `n1 === 0` as a quick return; let the natural loop convergence handle it.
- The argument-error indices differ from `dgsvj0` because `n1` is a new
  parameter at slot 4 — every subsequent index shifts by one. The
  indices match the *Fortran* slot numbering of `DGSVJ1`, not the JS
  parameter order. Specifically: `tol` is `-21` (not `-19`), `nsweep`
  is `-24`, `lwork` is `-28`. Audit each error code against the Fortran
  spec when porting from a sister routine.

## Dependency interface surprises

- `dlascl( 'general', 0, 0, ... )` for the rescale-and-dot path. The
  `'general'` string maps to Fortran's `'G'` type code — same as in
  `dgsvj0`. No surprises there.

## Test design

- The `KBL = min(8, N)` tile size means small-N cases yield only a single
  row-tile; to actually exercise the `nblr × nblc > 1` nested-tile path
  you need `N > 8` and `n1` such that both `n1` and `N - n1` exceed 8.
  The `vec_14x14_block` case (N=14, n1=5 → nblr=1, nblc=2) covers
  multiple column tiles. Going to N=20 with n1=12 would cover both.
- Coverage gap: the `mxaapq <= roottol || iswrot <= N` swband-update
  branch and the `i > swband+1 && ...` early-converge branch only fire
  when sweeps actually converge below threshold — rare with random
  inputs. The dlassq fallback for sva(N) refresh likewise only fires
  for norms below `rootsfmin`. These ~6 lines stay uncovered, leaving
  `base.js` at 98.57% line / 93.75% branch — well above the 90%/85%
  thresholds.

## Lint

- The `no-mixed-operators` rule fires on every
  `offsetA + (i-1) * stride` expression — there are ~100 of these. The
  rule is whitelisted at file level, so add it to the leading
  `/* eslint-disable ... */` along with the standard `max-*` family.
- The scaffolded section header `// HELPERS //` is not in the gate's
  allowed list — use `// FUNCTIONS //` instead.
