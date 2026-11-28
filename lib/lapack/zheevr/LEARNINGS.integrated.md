# zheevr: Translation Learnings

## Translation pitfalls

- ZSTEMR (the MRRR algorithm) is not implemented in this codebase. The implementation skips the ZSTEMR fast path entirely and always uses the DSTEBZ+ZSTEIN fallback. This is what LAPACK does on non-IEEE platforms or when partial spectrum is requested.
- For eigenvalues-only with all eigenvalues (alleig && !wantz), DSTERF is used as a fast path. If it fails, the code falls through to DSTEBZ.
- TAU must be allocated as a separate Complex128Array to avoid aliasing with WORK. In the Fortran code, TAU occupies WORK(INDTAU:INDTAU+N-1), but if zunmtr also uses WORK as scratch, it can clobber TAU. The safe approach is always to allocate TAU separately.
- The N=1 special case reads the real part of A(1,1) using `reinterpret()` and double-based indexing: `Av[offsetA * 2]`.

## Dependency interface surprises

- zhetrd does NOT take WORK/LWORK parameters -- it allocates internally. This differs from the Fortran interface which takes WORK and LWORK.
- zdscal takes strides and offsets in complex elements (not doubles).
- zswap takes strides and offsets in complex elements.
- zlanhe (not zlansy) is the correct function for Hermitian norm, using Complex128Array with complex-element strides.
- zstein outputs into a Complex128Array Z with complex-element strides.
- dstebz uses long-form strings ('all'/'value'/'index', 'block'/'entire') but its M and nsplit outputs are Int32Array (M[0], nsplit[0]).

## Automation opportunities

- The deps.py tool missed many transitive dependencies for the Fortran test compilation. Had to manually add ~20 deps including dstemr, dlarrf, dlarrb, dlarrc, dlarrd, dlarre, dlarrj, dlarrk, dlarrv, dlaneg, dlar1v, dlarra, dlarrr, dlasq2-6, la_xisnan, zlar1v, zlarrv, zlacgv, zladiv, dladiv, dlapy3, ilazlc, ilazlr, etc. The deps.py script should be improved to find all transitive deps.

## Coverage gaps

- 85.83% line coverage, 62.07% branch coverage.
- The `iscale` scaling path (lines 220-246) is not exercised because test matrices have normal-range norms. Would need matrices with elements near underflow/overflow.
- The dsterf failure fallthrough (lines 282-283) can't be easily triggered.
- The eigenvector sorting loop (lines 351-363) is not tested because dstebz already returns eigenvalues in order for our test cases.
- The N=1 value-range match case (lines 186-190) was not tested.

## Complex number handling

- Used `reinterpret()` to access Float64 views for N=1 special case.
- All complex array operations (zdscal, zswap, zstein, zunmtr, zhetrd) use complex-element strides/offsets, not double-based.
- No inline complex arithmetic was needed -- the routine is a driver that delegates to specialized subroutines.
