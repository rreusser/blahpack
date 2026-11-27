# dtgexc: Translation Learnings

## Translation pitfalls

- Fortran IFST/ILST are 1-based; JS version uses 0-based indices. All boundary checks (e.g., `IFST > 1` becomes `ifst > 0`, `HERE >= 3` becomes `here >= 2`) must be carefully adjusted.
- The routine returns an object `{ info, ifst, ilst }` because IFST and ILST are in/out parameters that may be adjusted when pointing to the second row of a 2-by-2 block.
- The `NBF === 3` code path (2x2 block that splits into two 1x1 blocks during forward/backward swapping) is very difficult to trigger with test data. It requires specific numerical conditions where dtgex2 causes a 2x2 block to deflate.

## Dependency interface surprises

- dtgex2 uses 0-based `j1` parameter (unlike dlaexc which uses 1-based indices in the dtrexc implementation). This simplifies the translation since dtgexc can pass 0-based `here` directly.
- dtgex2 may produce orthogonal transformations with different sign conventions compared to Fortran LAPACK. Both are mathematically valid, but element-wise comparison against Fortran fixtures may show sign flips. Tests should verify structural properties (orthogonality of Q/Z, correctness of decomposition Q^T*A*Z) rather than exact element values.
