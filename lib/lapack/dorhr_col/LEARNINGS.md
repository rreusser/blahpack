# dorhr_col: Translation Learnings

## Translation pitfalls

- `LDT >= max(1, min(nb, N))`, not `max(1, M)`. The scaffolded layout
  wrapper assumed the standard dense-matrix LDT rule. The actual T
  matrix is only `min(nb, N)`-by-`N`.
- Fortran loops iterate 1-based (`DO JB = 1, N, NB`). I kept internal
  loop variables 1-based and subtracted 1 only at array access to
  mirror the Fortran expressions (`j - jbtemp1`, `j - jbtemp2`).
- The "zero out" block (jbtemp2 = jb - 2) only runs for `J <= JB+JNB-2`,
  i.e. it is a no-op when `JNB == 1`. Don't simplify this loop away.
- `D(j) == 1.0` triggers a column negate — the equality test against a
  literal `1.0` is fine because `dlaorhr_col_getrfnp` produces exact
  `±1.0` values (not floating rounds).

## Dependency interface surprises

- `dlaorhr_col_getrfnp` returns `{status}` and overwrites A with the
  L/U factors (strict lower + upper including diagonal); the diagonal
  sign vector D is populated separately. The diagonal of A after the
  call is the U diagonal, which is then consumed by the block-row
  DTRSM('R','L','T','U',...) — the unit diagonal ignores those values.

## Fortran test fixture trap

- The Fortran test allocates a single large `T` array and reuses it
  across cases. Without zeroing `T = 0.0d0` between cases, the
  unreferenced entries in the last panel (e.g. `T(3, 5)` for 8x5 NB=3)
  retain values from prior tests and the JS comparison fails. Always
  zero scratch T/D arrays between Fortran test cases.

## Fixture design

- Stored `q_in` (input Q) in the fixture in addition to the outputs so
  that the JS test can rerun with identical inputs. The Fortran-side
  Q is built by `dgeqrf` + `dorgqr` from a deterministic sin/cos matrix;
  replicating that in JS would require pulling in more dependencies.
