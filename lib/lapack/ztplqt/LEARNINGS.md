# ztplqt: Translation Learnings

## Translation pitfalls

- The Fortran driver `ZTPLQT` is structurally identical to its real
  counterpart `DTPLQT` (same loop, same panel partition arithmetic,
  same `LB` formula). The translation was effectively a clone of
  `lib/lapack/base/dtplqt/lib/base.js` with `dtplqt2`/`dtprfb` swapped
  for `ztplqt2`/`ztprfb` and the `Float64Array` parameter doc strings
  changed to `Complex128Array`.
- The `LB` derivation `lb = nb - N + l - i` (rather than `lb = nb - N
  + l - i + 1`) keeps the Fortran 1-based +1 cancelled by the i+1
  conversion when re-expressed in 0-based loop variables — leaving
  the `if (i + 1 >= l)` test as the single 1-based artifact at the
  panel-skip boundary.
- `mb` is exposed as an explicit JavaScript parameter (no ILAENV
  query) per the project's "no ILAENV" rule. The wrapper validates
  `1 <= mb <= M` (when `M > 0`), and the gate's leading-dimension
  check is `LDT >= mb`.

## Dependency interface surprises

- `ztprfb` treats its WORK buffer as logically 2D (`ldwork x K`) and
  takes both `strideWORK1` and `strideWORK2`. From the right-side
  caller we pass `(WORK, strideWORK, (M-i-ib)*strideWORK, offsetWORK)`
  — i.e., the second stride is `ldwork * strideWORK` with `ldwork =
  M - i - ib`. The complex BLAS-style wrapper `ztplqt.js` passes
  `(WORK, 1, 0)` as the flat 1-D base call.
- `ztplqt2` accepts strides/offsets in **complex elements**; the
  `reinterpret()` × 2 conversion happens inside the dependency, so
  the parent driver can simply forward `strideA1`/`strideA2`/`offsetA`
  unchanged.

## Complex number handling

- `base.js` itself contains no complex arithmetic — all complex work
  happens inside `ztplqt2` and `ztprfb`. The driver only orchestrates
  panel partitioning and dependency calls. As a result, no
  `reinterpret()` / `Complex128` machinery is needed in `base.js` and
  the gate's "z-prefix uses reinterpret()" check is informational
  (the warning is expected for pure dispatch routines).

## Coverage notes

- 100% line and 100% branch coverage on `base.js` was reached with the
  9 Fortran-fixture cases plus the validator throw tests. Cases cover
  blocked (mb=2, mb=3) and unblocked (mb=M, mb=1) paths, l=0 and l>0,
  M<N, M>N, M=N, the M=0 / N=0 quick returns, and a real-valued (im=0)
  variant to keep parity with `dtplqt`'s test suite.
