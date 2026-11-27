# LEARNINGS: zgetrs

## Translation pitfalls

- The Fortran `ZGETRS` treats `trans='T'` and `trans='C'` in the same else-branch, passing `TRANS` directly to `ZTRSM`. In the JS translation, these are split into explicit branches for clarity, but the key insight is that `ztrsm` already handles `'T'` vs `'C'` correctly, so the only difference between the two paths is which character is forwarded to `ztrsm`.
- Unlike `dgetrs` where `trans='T'` and `trans='C'` are equivalent (real data), for complex data they produce genuinely different results. Every complex routine that has a `trans` parameter must distinguish all three cases.

## Dependency interface surprises

- `ztrsm` takes a `Complex128` scalar for `alpha`, not a plain number. Must pass `CONE = new Complex128(1.0, 0.0)` rather than `1.0`.
- `zlaswp` takes `Complex128Array` for `A`, strides/offsets in complex elements (not Float64 units). Same calling convention as the real `dlaswp` but with complex array types.
- `zgetrf2` uses 0-based pivot indices (unlike Fortran's 1-based), so no conversion is needed between `zgetrf2` output and `zgetrs` input.

## Missing automation

- N/A -- zgetrs is a thin dispatcher that calls zlaswp and ztrsm. No mechanical transforms were needed beyond the straightforward translation from dgetrs.

## Coverage gaps

- N/A -- 100% line, branch, and function coverage achieved. All three trans modes ('N', 'T', 'C') are tested with both single and multiple RHS.

## Complex number handling

- No complex arithmetic is performed directly in zgetrs. It delegates all complex operations to `zlaswp` (row swaps) and `ztrsm` (triangular solve). The only complex value in the routine is the constant `CONE = new Complex128(1.0, 0.0)` passed as the `alpha` scalar to `ztrsm`.
- The test helper functions (`zmatvec`, `zmatvecT`, `zmatvecH`) use inline complex multiply for verification. The conjugate transpose (`zmatvecH`) negates the imaginary part before multiplying -- this is the key difference from plain transpose.
