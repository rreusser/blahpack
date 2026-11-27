# zgetrf: Translation Learnings

## Translation pitfalls

- The blocked algorithm is identical in structure to dgetrf, just using Complex128 scalars (CONE, CNEGONE) instead of real 1.0/-1.0 for the ztrsm and zgemm calls.
- The zgetrf2/zlaswp/ztrsm/zgemm dependencies all accept Complex128Array with strides/offsets in complex elements, so no `*2` conversion is needed at the zgetrf level (sub-routines handle their own reinterpret internally).
- The IPIV offset bug from dgetrf was avoided from the start: both zlaswp calls in the blocked path pass `offsetIPIV + j * strideIPIV`, not `offsetIPIV`.

## Dependency interface surprises

- ztrsm and zgemm take `Complex128` objects as scalar arguments (alpha, beta), not raw numbers. This differs from dgetrf which passes `1.0` and `-1.0` directly.
- The zgetrf2 recursive algorithm produces different pivot orderings than Fortran's non-recursive zgetrf for rank-deficient matrices. Floating-point rounding in the recursive split can prevent exact-zero detection, so `info` may be 0 when Fortran reports a singularity. For testing, P*L*U reconstruction is more robust than exact-value comparison.

## Automation opportunities

- N/A. The translation from dgetrf to zgetrf was straightforward: replace `Float64Array` with `Complex128Array`, scalar `1.0`/`-1.0` with `CONE`/`CNEGONE`, and real routine names with complex counterparts (d -> z prefix). This pattern could be automated for all blocked LAPACK routines that differ only in precision/type.

## Coverage gaps

- 100% line, branch, and function coverage achieved on base.js.
- The singular blocked test uses a zero-column strategy (column 64 zeroed) to guarantee exact zero detection. The duplicate-row strategy fails because the recursive algorithm introduces rounding that prevents exact zero pivots.
- The sfmin path in zgetrf2 (tiny pivot scaling) is not exercised from zgetrf tests since that is an internal detail of zgetrf2.

## Complex number handling

- zgetrf itself does not directly manipulate complex numbers; it delegates entirely to zgetrf2, zlaswp, ztrsm, and zgemm. The only complex-aware code is the CONE/CNEGONE constants passed to ztrsm/zgemm.
- Tests use `reinterpret(A, 0)` to get Float64Array views for comparison against Fortran fixtures (which output interleaved re/im pairs via EQUIVALENCE).
