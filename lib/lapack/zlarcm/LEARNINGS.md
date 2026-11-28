# zlarcm: Translation Learnings

## Translation pitfalls

- The Fortran `RWORK` is partitioned into two contiguous M-by-N column-major
  panels: `RWORK(1..M*N)` holds packed real (then imag) parts of `B`,
  `RWORK(M*N+1..2*M*N)` holds the DGEMM output. Both panels have leading
  dimension `M`. The Fortran computes `L = M*N + 1` (1-based) which becomes
  `oL = offsetRWORK + M*N*strideRWORK` (0-based JS).
- The DGEMM call inside zlarcm uses `RWORK` simultaneously as B (input) and
  C (output) at different offsets within the same array — that works because
  the offsets are disjoint. In JS we pass the same `RWORK` Float64Array as
  both arguments with different `offset` values.

## Dependency interface surprises

- `dgemm` signature is `dgemm(transA, transB, M, N, K, alpha, A, sa1, sa2,
  oA, B, sb1, sb2, oB, beta, C, sc1, sc2, oC)`. For the M-by-N column-major
  panel inside `RWORK`, pass `strideB1 = strideRWORK` and `strideB2 = M *
  strideRWORK`.

## Complex number handling

- `B` and `C` are `Complex128Array`; reinterpreted to a Float64 view at
  function entry. Strides/offsets multiplied by 2 to index re/im pairs.
- The packing loops only touch one component (real or imag) at a time,
  so we read `Bv[ib]` then later `Bv[ib+1]`. No inlined complex arithmetic
  is needed — the only multiplies happen inside the (real) `dgemm` calls.
- `RWORK` is `Float64Array`, never reinterpreted, since it stores plain
  reals throughout (the M-by-N panels are real M-by-N matrices passed to
  `dgemm`).

## Test layout

- For `Float64Array` packing routines tested via fixture, store complex
  arrays in fixture as flat interleaved re/im pairs (matching Fortran
  `EQUIVALENCE` printing); reconstruct via `new Complex128Array(tc.b)`
  and compare via `reinterpret(C, 0)`.
