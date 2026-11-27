# dsptrf: Translation Learnings

## Translation pitfalls

- The lower triangle swap loop (Fortran DO 80) uses `KX = KNC + KP - KK` which matches the Fortran 1-based convention directly. The 0-based AP access requires `kx - 1`, not `kx - 2`. The upper triangle has a different initialization (`kx = kpc + kp` which is Fortran's `KPC + KP - 1` plus one), so `kx - 2` is correct there. This asymmetry caused an off-by-one bug in the lower swap path.
- All internal loop variables (k, imax, kp, kc, kpc, knc) use 1-based Fortran conventions. AP is accessed as `AP[offsetAP + (pos-1)*strideAP]` where pos is 1-based.
- IPIV is 0-based in JS. For 1x1 pivots: `IPIV[k] = kp - 1`. For 2x2 pivots: `IPIV[k] = ~(kp - 1)` (bitwise NOT encodes 0-based pivot).

## Dependency interface surprises

- idamax returns a 0-based index, so we add 1 to match Fortran's 1-based IMAX convention used throughout the algorithm.
- dspr, dscal, dswap all use stride/offset signatures and work directly on the packed array.

## Automation opportunities

- The packed index helper functions `iupp(i, j)` and `ilow(i, j, N)` could be shared across packed storage routines (dsptrf, dsptrs, dspcon, etc.).

## Coverage gaps

- The upper triangle 2x2 pivot swap path (lines 208-231 in base.js) is not exercised by current test cases because the 4x4_indef_upper test does not trigger `kp !== kk`. Adding a matrix that forces upper triangle row interchange with kp < kk would improve coverage.

## Complex number handling

- N/A: dsptrf is a real-valued routine.
