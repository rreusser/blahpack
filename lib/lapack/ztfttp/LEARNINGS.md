# ztfttp: Translation Learnings

## Translation pitfalls

- The d-prefix counterpart (dtfttp) uses `'transpose'` for TRANSR, but the z-prefix version uses `'conjugate-transpose'` since the Fortran uses `DCONJG` (conjugate) instead of just transpose. The `transr` parameter maps `'N'` to `'no-transpose'` and `'C'` to `'conjugate-transpose'`.
- All array indexing in the Fortran uses 0-based indices (`AP(0:*)`, `ARF(0:*)`), which maps cleanly to the logical-index approach used in the stride/offset pattern.

## Dependency interface surprises

- N/A. ztfttp has no BLAS/LAPACK dependencies -- it is a leaf routine that only copies data.

## Automation opportunities

- The d-to-z translation for "tf" format routines (dtfttp to ztfttp, dtfttr to ztfttr, etc.) is highly mechanical: add `reinterpret()`, double all strides/offsets, copy both real and imaginary parts, and negate imaginary parts where Fortran uses `DCONJG`. Could be automated with a transform pass.

## Coverage gaps

- N/A. 100% line and branch coverage achieved with N=0 (quick return), N=1 (both normal and conjugate-transpose), N=5,7 (odd), and N=6,8 (even) covering all 8 code paths.

## Complex number handling

- Conjugation is a simple sign flip on the imaginary part (`-ARFv[idx+1]`). No complex arithmetic library calls needed since this routine only copies and conjugates elements.
- Used the standard `reinterpret()` pattern: API receives `Complex128Array` with complex-element strides/offsets, then internally converts to Float64 views with doubled strides/offsets for direct real/imaginary part access.
