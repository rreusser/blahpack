# zla_syrpvgrw: Translation Learnings

## Translation pitfalls

- The `signature.py` tool consumed INFO as a return value, but for this routine INFO is an _input_ parameter (the function returns the rpvgrw scalar). Had to manually add `info` back to all wrapper signatures.
- The Fortran CABS1 statement function `ABS(DBLE(ZDUM)) + ABS(DIMAG(ZDUM))` must use `Math.abs(v[idx]) + Math.abs(v[idx+1])` on Float64 views, not complex modulus.
- The upper first-pass while loop (K decreasing from N, NCOLS either 1 or INFO) is mathematically unreachable because K always starts >= NCOLS. This matches the d-prefix version exactly.

## Dependency interface surprises

- N/A (leaf routine with no BLAS/LAPACK dependencies).

## Automation opportunities

- `init_routine.py` should detect when a Fortran FUNCTION takes INFO as an input parameter (not output) and preserve it in the signature rather than consuming it.
- The Fortran test deps file generator should automatically include ZSYTRF and its transitive dependencies when the test program calls ZSYTRF.

## Coverage gaps

- Upper first-pass while loop (lines 147-182): unreachable because K starts at N-1 and NCOLS is at most N, so the condition `(K+1) < NCOLS` is never true. Documented with TODO.
- Upper rpvgrw computation (lines 281-282): consequence of the unreachable first pass; WORK[0..N-1] remains zero so `umax !== 0` never fires.
- Lower 2x2 pivot diagonal update (lines 244-245): hard to trigger because ZSYTRF picks 2x2 pivots when off-diagonal dominates, so the max is typically already set. Documented with TODO.

## Complex number handling

- Used `reinterpret()` at function entry to get Float64Array views of Complex128Array parameters.
- Converted complex-element strides/offsets to Float64 units with `*2` at function entry.
- CABS1 implemented as a local helper `cabs1(v, idx)` returning `Math.abs(v[idx]) + Math.abs(v[idx+1])`. No complex division, abs, or sqrt needed.
- WORK array remains Float64Array (real workspace) and IPIV remains Int32Array, same as the d-prefix version.
