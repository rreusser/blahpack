# zlarz: Translation Learnings

## Translation pitfalls

- The `v` reflector vector in `zlarz` stores only the last `l` components
  of the Householder vector; the first component is implicitly unity. Unlike
  `zlarf`, there is no explicit unit entry in `v`. The `l` parameter gives
  the meaningful length, separate from the leading-dimension of `C`.
- For `SIDE = 'L'`, the Fortran source passes `C(M-L+1, 1)` as the sub-panel
  base for the inner `ZGEMV`/`ZGERU` calls. Translated to 0-based ndarray
  semantics this becomes `offsetC + (M - l) * strideC1`.
- Both left and right branches are gated on `tau != 0` in Fortran. The JS
  base.js checks tau once at the top and early-returns; behavior is
  equivalent.

## Dependency interface surprises

- The left (`H * C`) path uses `zgeru` after explicitly conjugating the
  workspace twice via `zlacgv` (once to prepare input to the
  conjugate-transpose `zgemv`, once to undo the conjugation on the result).
  The right (`C * H`) path uses `zgerc` directly on un-conjugated values
  of v. This is mirrored exactly from the Fortran reference. Swapping
  `zgeru`/`zgerc` between the two sides will silently produce wrong
  answers that are hard to spot on small test matrices.
- `zcopy`, `zgemv`, `zgerc`, `zgeru`, and `zlacgv` all take
  complex-element strides (they each do `sa1 = strideA1 * 2` internally).
  Passing `strideC2` and `strideC1` directly (no `* 2`) from `zlarz` is
  therefore correct.

## Complex number handling

- `tau` is carried as a `Complex128Array` of length 1 (plus `offsetTau`),
  matching the `zlarf` convention, even though the Fortran signature has
  a scalar `COMPLEX*16`. This lets callers avoid allocating a `Complex128`
  scalar wrapper per call.
- `negTau` is constructed once via `new Complex128( -tauR, -tauI )` and
  passed to `zaxpy`/`zgerc`/`zgeru`. These helpers accept a `Complex128`
  scalar object (not a `Complex128Array`), so no indexing into a real
  view is needed at the call site.

## Testing notes

- Tests are built from fixtures in `test/fixtures/zlarz.jsonl` rather than
  hand-computed expected values. Cases cover `SIDE='L'` and `'R'`, `L=0`,
  `L=2`, `L=3` (including `L == M` / `L == N` boundary cases), and `tau=0`.
- Because the stdlib `array-element-newline` rule requires each element
  on its own line, the test files build large complex matrices
  procedurally via `buildC4x3()` / `buildC3x2()` helpers and `reinterpret`
  assignment instead of using inline literal arrays. This keeps the files
  readable without hundreds of one-line entries.
