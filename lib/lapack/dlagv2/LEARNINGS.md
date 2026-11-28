# dlagv2: Translation Learnings

## Translation pitfalls

- The DLASV2 output mapping in the complex eigenvalue branch was initially wrong: I swapped `csr=svd.snr` instead of `csr=svd.csr`, etc. The Fortran call `DLASV2(B(1,1), B(1,2), B(2,2), R, T, SNR, CSR, SNL, CSL)` maps directly to the JS object fields `{snr, csr, snl, csl}` -- no reordering needed.
- The DROT calls use different stride arguments depending on whether applying a left rotation (stepping across columns, stride = strideA2) or right rotation (stepping down rows, stride = strideA1). This maps to Fortran's `DROT(2, A(1,1), LDA, ...)` for rows and `DROT(2, A(1,1), 1, ...)` for columns.
- The function returns CSL/SNL/CSR/SNR as object properties (not as scalar parameters) since they are output-only scalars with no corresponding array. ALPHAR/ALPHAI/BETA are written to output arrays in-place.

## Dependency interface surprises

- DLARTG uses output array: `dlartg(f, g, out)` where `out[0]=cs`, `out[1]=sn`, `out[2]=r`. Allocate a module-level `lartgOut` buffer to avoid per-call allocation.
- DLASV2 returns an object with fields `{ssmin, ssmax, snr, csr, snl, csl}`. The `ssmin`/`ssmax` (singular values R and T in the Fortran call) are not used by dlagv2 -- only the rotation angles matter.
- DLAG2 returns `{scale1, scale2, wr1, wr2, wi}`. The `scale2` and `wr2` values are not used by dlagv2.

## Automation opportunities

- N/A: Translation was straightforward with existing tooling.

## Coverage gaps

- All branches reached 100% coverage with 12 test cases. The `rr <= qq` branch in the real eigenvalue path required a specific test case with large A(2,1) relative to the eigenvalue residuals.

## Complex number handling

- N/A: dlagv2 is a real-valued routine.
