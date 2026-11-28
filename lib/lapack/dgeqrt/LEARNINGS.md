# dgeqrt: Translation Learnings

## Translation pitfalls

- **`mb`/`nb` is exposed as an explicit JS parameter.** The Fortran
  reference declares `USE_RECURSIVE_QR=.TRUE.` and would normally
  call `dgeqrt3` for each panel. Because `dgeqrt3` is not yet
  available in this codebase, the JS port takes the `dgeqrt2` branch
  unconditionally (which the Fortran also exposes via the
  `USE_RECURSIVE_QR=.FALSE.` toggle). When `dgeqrt3` lands, swapping
  the panel kernel is a one-line change in `base.js`.
- **`T` is `nb`-by-`min(M,N)`, not `nb`-by-`nb`.** The block
  triangular factor stores all per-panel `T1..TB` factors
  side-by-side in columns. Inside the blocked loop, the i-th panel
  writes its `ib`-by-`ib` factor at `T(:, i:i+ib-1)` — pass
  `offsetT + i*strideT2` to `dgeqrt2`. The wrapper validators must
  use `LDT >= nb` (column-major) or `LDT >= min(M,N)` (row-major),
  NOT `LDT >= max(1,M)` (the scaffold default).
- **Quick-return on `min(M,N) === 0`.** Both `M=0` and `N=0` short
  circuit before any indexing — important for the wrapper where
  `LDA >= max(1,M)` could otherwise be tripped at `M=0` with a
  zero-length array.
- **`WORK` is logically 2D for `dlarfb`.** `dlarfb` takes
  `strideWORK1` and `strideWORK2`. The Fortran call passes
  `LDWORK = N-I-IB+1` (the trailing column count). In the JS port,
  the single `strideWORK` API parameter is reused as
  `strideWORK1=strideWORK, strideWORK2=ldwork*strideWORK` so the
  caller only ever sees one stride.

## Dependency interface surprises

- `dgeqrt2` returns `0` always (it has no algorithmic failure
  mode). The blocked driver therefore drops the per-panel `IINFO`
  rather than offsetting it.
- `dlarfb` requires the WORK leading dimension equal to the
  trailing column count of `C`, NOT the row count. Easy to invert
  by reflex when copying from the symmetric `dgeqrf` pattern.
- Tests must require `lib/ndarray.js` (not `lib/base.js`) to
  exercise the validator layer, per project convention.

## Coverage notes

- `dgeqrt/lib/base.js` reaches 100% line / 100% branch coverage
  with seven block-shape variations (small/large block, last block
  smaller than `nb`, single-reflector blocks `nb=1`, single-block
  full-K factor, wide `M<N`) plus the two quick-return cases.
- The `dgeqrt.js` wrapper is fully covered by negative-path tests
  in `test.dgeqrt.js`; the only uncovered branch is the
  `LDA < max(1,M)` early-throw being skipped on a happy path
  (counted by the harness as a single missed branch out of 23).

## Automation gaps

- The scaffold puts `LDT >= max(1,M)` validation in the generated
  `<routine>.js` because it cannot tell that `T` is `nb`-by-K
  rather than M-by-N. Audit and rewrite this block by hand
  whenever the Fortran has a non-square output buffer (the
  compact-WY family is the prime example).
- Scaffolded `benchmark.js` allocates an `N*N` WORK buffer at
  10^max=1000 (~8MB) and uses single-letter Fortran flags in the
  call. Replace both with: a properly-sized `nb*N` WORK buffer
  and long-form layout strings, and lower `max` to `2` to keep
  benchmarking fast.
