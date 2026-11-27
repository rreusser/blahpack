# dorghr: Translation Learnings

## Translation pitfalls

- ILO and IHI are 1-based in the API (matching Fortran convention). The reflector shift loop iterates from `j = ihi-1` down to `ilo` in 0-based terms, which corresponds to Fortran's `J = IHI, ILO+1, -1`.
- The reflector vectors stored by dgehrd are in columns ILO..IHI-2 (0-based), but dorghr needs them in columns ILO..IHI-1. The shift-right loop copies column j-1 to column j, so it must iterate in reverse to avoid overwriting.
- TAU offset for dorgqr: dgehrd stores TAU(ILO) through TAU(IHI-1) in Fortran 1-based. In JS with 0-based offsetTAU, the TAU offset passed to dorgqr is `offsetTAU + (ilo-1)*strideTAU`.
- The submatrix passed to dorgqr is NH x NH starting at (ilo, ilo) in 0-based, where ilo is already the 0-based row/column (since Fortran ILO+1 minus 1 = ILO in 0-based).

## Dependency interface surprises

- dorgqr's WORK parameter is ignored (allocated internally), so we can pass a small dummy array. We still allocate `nh * 32` to be safe.
- dgehrd's ilo/ihi are also 1-based, matching dorghr. Consistent convention across the dgehrd/dorghr pair.

## Automation opportunities

- N/A. This routine is a thin wrapper around dorgqr with reflector shifting. No mechanical transforms identified.

## Coverage gaps

- 100% line, branch, and function coverage achieved on base.js.
- The blocked path in dorgqr is not exercised by these tests since NH <= 31 for all test cases. Larger tests would be needed to exercise the blocked dorgqr path through dorghr, but dorgqr has its own coverage for that.

## Complex number handling

- N/A. This is a real-valued (double precision) routine. The complex analogue would be zunghr.
