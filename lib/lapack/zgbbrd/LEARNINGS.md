# zgbbrd: Translation Learnings

## Translation pitfalls

- The Fortran routine performs many band-storage index manipulations
  using `LDAB-1` as a stride argument to `ZROT` (i.e. complex stride
  `LDAB-1`). Translated as `strideAB2 - strideAB1` so it works for
  both layouts.
- The reference uses `INCA = LDAB*KB1` (in complex elements) as the
  stride between successive rotation outputs in `ZLARGV`/`ZLARTV`. We
  translate as `kb1 * strideAB1` (complex elements). The `*2`
  reinterpret stride is *not* used here because we pass through the
  Complex128Array layer.
- Two scratch slots are needed for `ZLARTG` outputs `ra` and (for the
  `ku>0,M<N` branch) `rb`. We allocate one-element `Complex128Array`
  scratches and use the Float64 reinterpret view to read/write them.
- The final phase that "makes diagonal/superdiagonal real" multiplies a
  Fortran `T` accumulator by `conjg(T)` repeatedly; the order of the
  hypot/divide steps must match the Fortran exactly or the recovered
  `D`,`E` values pick up the wrong phase.

## Dependency interface surprises

- `zrot` in this codebase takes the rotation sine `s` as a real
  2-element `Float64Array` (re/im pair), not a `Complex128`. We use a
  reusable 2-element `svec` to avoid allocations.
- `zlartg` writes the cosine into a `Float64Array` and the sine into a
  `Complex128Array` slot, while writing `ra` into a separate
  `Complex128Array`. Slots are passed via `(buffer, offset)` rather
  than out-parameters.

## Complex number handling

- VECT strings: `'no-vectors'`, `'q-only'`, `'p-only'`, `'both'` (long
  form to match dgbbrd convention).
- D and E (output) are real `Float64Array` per LAPACK spec — they hold
  the bidiagonal matrix `B`.
- All complex storage uses `Complex128Array` at the API surface; the
  base routine uses `reinterpret(...)` Float64 views internally and
  multiplies strides by 2 for direct indexing.
- WORK is a complex workspace, RWORK is a real workspace; both must be
  sized `>= max(M,N)`.
- Band storage convention: `A(i,j) -> AB[ku+i-j, j]` (1-based) which
  in our 0-based offsets becomes
  `AB[ offsetAB + (ku+i-j)*strideAB1 + j*strideAB2 ]`.
