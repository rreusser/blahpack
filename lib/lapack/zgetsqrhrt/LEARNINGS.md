# zgetsqrhrt: Translation Learnings

## Translation pitfalls

- **Quick-return and parameter validation**: The Fortran routine validates
  `MB1 > N` (not `MB1 >= 1`); below-N MB1 values are illegal. The wrapper
  enforces this in `ndarray.js` and `zgetsqrhrt.js`. The base routine
  assumes the contract is met (skipping all argument tests) — exactly
  per project convention.
- **`LDT >= max(1, min(NB2, N))`**, NOT `>= max(1, N)`. The scaffolded
  `zgetsqrhrt.js` validator used `LDT >= max(1, M/N)`, which is a
  copy-paste bug that would over-allocate but still pass. Replaced with
  the correct `min(nb2, N)` formula.
- **Workspace allocation is internal.** The Fortran exposes a single
  `WORK` array carved into 4 partitions (T-tiles for ZLATSQR, scratch
  for ZLATSQR, square N-by-N R_tsqr storage, then LW2/D for
  ZUNGTSQR_ROW/ZUNHR_COL). In JS, dropped the LWORK query and allocated
  each piece with a clear name (`Twork`, `WORK`, `Rwork`, `D`). The
  wrapper's signature shrinks from 12 → 10 parameters as a result.

## Dependency interface surprises

- **`zunhr_col` takes a real `Float64Array d`, not `Complex128Array`** —
  the diagonal sign vector is real (+/-1). The Fortran shares storage
  with the LW2 work for ZUNGTSQR_ROW because Fortran complex storage
  can be reinterpreted as 2x doubles. In JS we allocate a separate
  `Float64Array(N)` rather than aliasing — cleaner and avoids type
  punning across modules.
- **`zlatsqr` and `zungtsqr_row` use complex-element strides** for
  their T-tile buffer. Passing `strideT1=1, strideT2=ldwt, offsetT=0`
  works because we own the buffer; no surprises.
- The R_tsqr scratch buffer is plain N-by-N column-major
  (`stride1=1, stride2=N`), so reading from it back into A row-by-row
  uses `stride=N` for the source.

## Complex number handling

- The combined "copy R_tsqr back into A and apply diagonal sign" loop
  reads from the N-by-N scratch buffer `Rwork`. When the diagonal
  sign is `-1`, the row is read element-by-element via the
  reinterpreted Float64 view (`Rv`/`Av`) and negated in place — this
  avoids constructing a temporary Complex128 just to negate.
- When the diagonal sign is `+1`, a plain `zcopy` with `stride=N`
  (source, walks across columns of `Rwork`) and `stride=strideA2`
  (dest, walks across columns of `A`) handles the row copy.

## Process notes

- Test fixture used `fill_diag_dom` and a `mod`-based pattern in
  Fortran; mirroring those generators in JS keeps the test self-
  contained and avoids shipping large input arrays in the fixture
  JSONL (which only stores outputs).
- The wrapper signature dropped `WORK`/`strideWORK`, so the scaffolded
  `test.<routine>.js` file (which expected arity 12 and accepted a
  WORK Float64Array) had to be rewritten with `Complex128Array` inputs
  and arity 10 — and benefits from explicit additional RangeError
  cases for `mb1 <= N`, `nb1 < 1`, `nb2 < 1`, and `LDT < min(nb2,N)`.
