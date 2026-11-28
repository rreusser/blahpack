# zhetrd: Translation Learnings

## Translation pitfalls

- Nearly identical structure to dsytrd. The main difference is using Complex128Array for workspace W (allocated as `new Complex128Array(ldwork * nb)`) and calling zher2k instead of dsyr2k.
- zher2k takes `beta` as a real scalar (number), not Complex128. This matches the Fortran signature where BETA is DOUBLE PRECISION.
- The `alpha` argument to zher2k is Complex128 (CNONE = -1+0i), matching the Fortran CONE parameter.
- After zlatrd + zher2k, the loop copies superdiagonal/subdiagonal elements and diagonal into output arrays. Must ensure the stored off-diagonal has zero imaginary part.

## Dependency interface surprises

- zher2k had an existing but unimplemented stub. It takes `beta` as a plain `number` (real scalar), not Complex128, unlike zgemm-like routines where beta is complex. This is correct per the Fortran spec.
- The Fortran deps file needed `ilaenv`, `iparmq`, and `ieeeck` added manually (not auto-detected by deps.py since they're used indirectly via ZHETRD's ILAENV calls).

## Automation opportunities

- The dsytrd -> zhetrd translation is almost mechanical: replace dsytd2->zhetd2, dlatrd->zlatrd, dsyr2k->zher2k, Float64Array->Complex128Array for workspace. Could be partially automated.

## Coverage gaps

- 100% line and branch coverage achieved.
- 4x4 tests exercise the unblocked path (N <= NB=32).
- 35x35 tests exercise the blocked path (N=35 > NB=32, so one block of 32 is reduced by zlatrd+zher2k, then remaining 3 columns by zhetd2).

## Complex number handling

- zhetrd itself does minimal complex arithmetic -- it delegates to zlatrd (panel reduction) and zher2k (trailing update). The only complex values it handles directly are writing off-diagonal e[] values back into A with `Av[ai+1] = 0.0`.
