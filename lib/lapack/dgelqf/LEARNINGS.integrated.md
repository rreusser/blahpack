# dgelqf: Translation Learnings

## Translation pitfalls

- Direct translation from zgelqf (complex version). The real version is simpler since there is no reinterpret step or complex stride doubling.
- Fortran dgelqf stores T inside WORK and uses WORK(IB+1) for dlarfb workspace. We allocate T separately (like zgelqf) to avoid aliasing issues.
- ILAENV calls are replaced with hardcoded NB=32, nx=0, nbmin=2 (matching zgelqf pattern).
- The Fortran deps file needed ilaenv, ieeeck, iparmq, iparam2stage added beyond what `bin/deps.py` generated, because the Fortran dgelqf.f calls ILAENV directly. xerbla was already provided by BLAS sources (duplicate symbol error if included).

## Dependency interface surprises

- dlarfb takes 2D WORK strides `(strideWORK1, strideWORK2, offsetWORK)` — consistent with zlarfb.
- dlarft takes `(strideT1, strideT2, offsetT)` for the T matrix — pass `(1, nb, 0)` for the locally allocated T.
- No new surprises beyond what was documented for zgelqf.

## Automation opportunities

- The deps file generation (`bin/deps.py`) does not include ilaenv and its sub-dependencies. For any routine that uses ILAENV in Fortran (which is removed in JS), the deps file for the Fortran test still needs those symbols. Consider adding a flag or auto-detecting ILAENV usage.

## Coverage gaps

- 100% line and 100% branch coverage achieved.
- The 35x40 test exercises the blocked code path (K=35 > NB=32), confirming both the blocked loop and the unblocked tail (last 3 rows).
- Small matrices (3x5, 5x3, 4x4, 2x6, 1x1) all take the unblocked-only path.

## Complex number handling

- N/A: dgelqf is a real-valued routine. No complex arithmetic needed.
