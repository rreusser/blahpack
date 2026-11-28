# LEARNINGS: dlapll

## Translation pitfalls

- dlarfg takes alpha as `(array, offset)` pair, not a scalar. The first element of X serves double duty as both the alpha input and the output (beta). After dlarfg, `x[offsetX]` holds beta (saved as a11), then must be overwritten with 1.0 for the Householder application.
- The second dlarfg call operates on `Y(2:N)`, so the alpha offset is `offsetY + strideY` and the vector starts at `offsetY + 2*strideY` with length `N-1`.

## Dependency interface surprises

- dlas2 returns both singular values via an output Float64Array: `out[0]` = ssmin, `out[1]` = ssmax. We only need ssmin.
- dlarfg writes tau to a Float64Array at a given offset, not returned as a scalar.

## Missing automation

- N/A -- the scaffold generator handled the module structure correctly.

## Coverage gaps

- 100% line and branch coverage on base.js achieved. No uncoverable paths -- the routine is simple with only one branch (N <= 1 quick return).

## Complex number handling

- N/A -- this is a real-valued routine only.
