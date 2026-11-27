# zppsvx: Translation Learnings

## Translation pitfalls

- B and X are Complex128Array, so scaling by real S[i] requires reinterpret and scaling both real/imag parts separately: `Bv[bi] *= si; Bv[bi+1] *= si;`
- The stride for B/X in Float64 view is `strideB1 * 2` (since each complex element occupies 2 doubles), and the column stride must also be doubled: `j * strideB2 * 2`
- Unlike dppsvx which uses IWORK (Int32Array), zppsvx uses RWORK (Float64Array) for real workspace. The complex workspace WORK replaces dppsvx's real WORK.

## Dependency interface surprises

- `zlanhp` takes `'inf-norm'` (not `'inf'`), consistent with other z-prefix norm routines.
- `zlaqhp` returns equed string directly (not via output param), same pattern as `dlaqsp`.
- `zppequ` returns `{info, scond, amax}` object, same pattern as `dppequ`.
- `zppcon` takes Complex128Array WORK and Float64Array RWORK (no IWORK), unlike `dppcon` which takes Float64Array WORK and Int32Array IWORK.
- `zpprfs` similarly takes Complex128Array WORK and Float64Array RWORK instead of Float64Array WORK and Int32Array IWORK.

## Automation opportunities

- Fortran deps file generation misses transitive dependencies. ZPPSVX needed zlassq's module deps (la_constants, la_xisnan, disnan, dlaisnan) and zlatps's dep (zladiv -> dladiv). These had to be manually added.

## Coverage gaps

- The equilibrate path produces `equed='none'` for the well-conditioned test matrix. A poorly-conditioned matrix would be needed to exercise the `equed='yes'` path through equilibrate, but the `fact_f_equed_y` test covers the rcequ=true path via FACT='F'.

## Complex number handling

- AP, AFP, B, X, WORK are Complex128Array with complex-element strides/offsets.
- S, FERR, BERR, RWORK, rcond are regular Float64Array.
- reinterpret(Complex128Array) gives Float64Array view for element-wise real scaling of B and X.
- No complex arithmetic needed in zppsvx itself - all complex operations delegated to dependencies (zcopy, zlacpy, zlanhp, zlaqhp, zppcon, zpprfs, zpptrf, zpptrs).
