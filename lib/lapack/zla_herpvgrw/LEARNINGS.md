# zla_herpvgrw: Translation Learnings

## Translation pitfalls

- The `info` parameter is marked as "consumed" by `signature.py` because it does not appear in the output parameter list, but it is actually an input parameter that determines `NCOLS`. It must be manually added back to the base.js signature and all wrappers (ndarray.js, zla_herpvgrw.js). The same issue exists in `dla_syrpvgrw`.
- The Fortran test deps file needs `dlamch` for transitive dependency through `dlapy2` (called by `zhetf2`). The standard `deps.py` output does not include this.

## Dependency interface surprises

- N/A -- this is a leaf routine with no JS dependencies (only calls `reinterpret`).

## Automation opportunities

- `init_routine.py` should detect when a Fortran function (not subroutine) has a consumed scalar input parameter like `INFO` that is not a dimension/leading-dimension and should not be removed from the JS signature. Currently it silently drops `INFO`, requiring manual addition.
- The Fortran deps file generator should handle transitive Fortran-only deps like `dlamch` automatically when `dlapy2` is in the tree.

## Coverage gaps

- The upper-triangle first-pass while loop (lines 140-180 of base.js) is structurally unreachable: K starts at N-1 and NCOLS is always <= N, so `(K+1) < NCOLS` is never true. Code preserved to match reference Fortran.
- The upper-triangle final growth computation (lines 271-280) never triggers `rpvgrw = Math.min(...)` because the first-pass while loop never populated WORK[0..N-1], so umax is always 0.
- The lower-triangle 2x2 pivot diagonal update (lines 237-243) is hard to trigger because ZHETRF picks 2x2 pivots when the off-diagonal dominates, so the max is typically already set.

## Complex number handling

- Only `CABS1` (= `|Re| + |Im|`) is used on complex elements; no complex arithmetic (multiply, divide, etc.) is needed. Implemented as a local `cabs1At(view, idx)` helper on Float64 views.
- A and AF are Complex128Array with complex-element strides. Strides and offsets are multiplied by 2 at function entry for Float64 indexing. WORK and IPIV remain real (Float64 and Int32).
- The routine is structurally identical to `dla_syrpvgrw` -- the only difference is complex array types and CABS1 instead of Math.abs for element magnitudes. Hermitian vs symmetric distinction does not matter here since CABS1 treats both parts symmetrically.
