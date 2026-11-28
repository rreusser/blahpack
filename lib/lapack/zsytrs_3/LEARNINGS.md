# zsytrs_3: Translation Learnings

## Translation pitfalls

- Structurally identical to `zhetrs_3` but with three critical differences
  reflecting symmetric-vs-Hermitian semantics: (1) diagonal entries of
  `A` are fully complex (no real-part-only shortcut); (2) no `conj()` is
  applied to `e(k)` in the `2x2` solve; and (3) the back substitution
  uses `'transpose'` rather than `'conjugate-transpose'` for `ztrsm`.
- The `1x1` diagonal solve uses `zscal` with a complex scalar (computed
  via `cDiv(1, 0, A(i,i).re, A(i,i).im)`), not the real `zdscal` used by
  `zhetrs_3`.
- The `2x2` AKM1 / AK formulas are simpler than the Hermitian variant —
  both use plain (non-conjugated) division by `e(k)`.

## Dependency interface surprises

- `zscal` takes a `Complex128` scalar (not a real). Constructed inline
  per `1x1` block via `new Complex128(cdR, cdI)` after `cDiv` computes
  the inverse. The allocation is tolerable because it happens once per
  diagonal block, not per inner loop iteration.

## Complex number handling

- Inlined `cDiv` (Smith's algorithm) at file scope, identical to
  `zhetrs_3` and `zhetrs`. Allocating a `Complex128` per pivot block to
  pass through `zscal` is the cleanest interface; the stdlib zscal
  signature has no Float64-pair variant.
- The `e` vector must be reinterpreted as Float64 via
  `reinterpret(e, 0)` — direct numeric indexing on a `Complex128Array`
  yields a `Complex128` object, not numbers.

## Test data approach

- Same as `zhetrs_3`: Fortran prints `A_factored` with leading dimension
  NMAX = 6 (not n). The JS test must use `strideA2 = NMAX` to match.
