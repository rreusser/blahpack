# dlaqr2: Translation Learnings

## Translation pitfalls

- KTOP, KBOT, ILOZ, IHIZ are all 1-based Fortran indices. Every matrix access helper function subtracts 1.
- The Fortran DCOPY call `DCOPY(JW-1, H(KWTOP+1,KWTOP), LDH+1, T(2,1), LDT+1)` uses stride=LDH+1 to copy the subdiagonal. In JS this is strideH1+strideH2.
- The dlarfg call pattern is `dlarfg(ns, WORK, offsetWORK, WORK, strideWORK, offsetWORK+strideWORK, tauArr, 0)` where WORK serves double duty as both the alpha element and the vector.
- The dgehrd call reuses WORK[0..ns-2] for TAU and WORK[jw..] for workspace. dormhr then reads TAU from the same WORK location. This aliasing pattern must be preserved exactly.
- The Fortran test program reuses SR/SI arrays across test cases without re-zeroing, causing fixture comparison failures. Must zero SR/SI between Fortran test cases.

## Dependency interface surprises

- **dgemm base.js uses `'no-transpose'`/`'transpose'`, not `'N'`/`'C'`.** This is the stdlib-js convention. Using single-char Fortran codes causes dgemm to take the wrong code path and produce NaN. This was the primary bug encountered during translation.
- **dtrexc returns an object `{ info, ifst, ilst }`** because IFST and ILST are modified on output (they snap to the first row of 2x2 blocks and may be adjusted). Callers must use `result.ilst` not the original variable.
- **dlanv2 returns an object** with fields `a, b, c, d, rt1r, rt1i, rt2r, rt2i, cs, sn`.
- **dlartg takes an output Float64Array** `out` where `out[0]=cs, out[1]=sn, out[2]=r`.

## Automation opportunities

- The `dlaqr23impl` shared function pattern (with dlaqr4fn parameter) enables code reuse between dlaqr2 and dlaqr3. This was implemented proactively.
- Four new dependency routines (dlasy2, dlarfx, dlaexc, dtrexc) were all needed. The `init_routine.py` scaffold generator saved significant time.

## Coverage gaps

- dlaqr3/dlaqr4fn mode (lines 182-185, 227-252) is unreachable from dlaqr2 since it always passes null. Will be exercised when dlaqr3 is implemented.
- The bubble sort code (lines 292-365) is partially covered. Full coverage would require test matrices where eigenvalue sorting swaps occur with dtrexc exchange failures.
- The spike reflection + dgehrd + dormhr path (lines 379-420) is only exercised when ns>1 and s!=0 with deflation. Covered by "6x6 with deflation" test.

## Complex number handling

- N/A: dlaqr2 is a real (double precision) routine.
