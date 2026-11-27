# dstebz: Translation Learnings

## Translation pitfalls

- The dlaebz interface requires careful parameter marshalling. dstebz uses WORK and IWORK as backing storage for dlaebz's AB, NAB, C arrays with 2D column-major layouts. Rather than passing sub-views of WORK with computed offsets (error-prone due to stride mixing), I allocated separate local Float64Array/Int32Array for each dlaebz call. This is cleaner and avoids stride confusion, at a small allocation cost.
- ISPLIT stores 1-based indices (Fortran convention). When computing `ibegin` (0-based) and `iend` (1-based), `in_ = iend - ioff` where `ioff` is the previous `iend`. The block spans 0-based indices `ibegin..iend-1`.
- The ILAENV call for NB was replaced with `nb = 0` (scalar-only mode). The Fortran reference implementation queries ILAENV for the optimal block size, but since dlaebz already handles both scalar and "parallel" paths, setting `nb=0` ensures consistent behavior.
- M and nsplit are scalar outputs that must be passed as Int32Array containers (M[0], nsplit[0]) since JS lacks pass-by-reference for scalars.
- The RANGE='I' code path uses dlaebz IJOB=3 with 2 search intervals to find the eigenvalue count boundaries. The NVAL array mapping (IWORK[4..5]) is reordered by dlaebz, so the output check `IWORK[5] === IU` determines which interval maps to WL vs WU.

## Dependency interface surprises

- dlaebz requires `mmax` as an explicit parameter (4th argument) even though the signature generator listed it as "consumed". This is needed for the overflow check when intervals split beyond available capacity.
- dlaebz's MOUT is an Int32Array[1] output, not a return value. The return value is INFO. This dual-output pattern requires callers to pre-allocate the mout container.
- The E2 (squared off-diagonals) array passed to dlaebz comes from the WORK array computed during the splitting-point phase. The WORK[0..N-1] region stores these squared values, with WORK[J-1] = E(J)^2 when there's no split at J.

## Automation opportunities

- The dlaebz call-site boilerplate (allocating abWork, nabWork, cWork, wScratch, iwScratch per block) could be automated with a higher-level wrapper that handles the workspace allocation internally.

## Coverage gaps

- INFO=4 path (Gershgorin interval too small for RANGE='I') is hard to trigger without specially crafted floating-point edge cases. Would need near-underflow inputs.
- The "bad arithmetic" kill-off paths (idiscl>0 / idiscu>0 after the initial discard pass) handle non-monotonic Sturm sequences, which are extremely rare in IEEE 754 arithmetic.
- The ncnvrg (non-convergence) flag path requires bisection to fail within NITMAX iterations, which is unlikely with the default tolerance settings.

## Complex number handling

- N/A: dstebz is a real-valued routine.
