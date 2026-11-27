# dlaqr3: Translation Learnings

## Translation pitfalls

- **dlaqr3 vs dlaqr2 are nearly identical**: The only difference is that dlaqr3 conditionally uses dlaqr4 (multi-shift QR) for large deflation windows (JW > NMIN), while dlaqr2 always uses dlahqr. This enabled a shared `dlaqr23impl` function in dlaqr2/lib/base.js, with dlaqr3 passing dlaqr4 as a function parameter.
- **ILAENV crossover threshold**: dlaqr3 uses `ILAENV(12, 'DLAQR3', ...)` to decide between dlahqr and dlaqr4. We hardcoded NMIN=12 as the default. This means for window sizes <= 12, dlaqr3 behaves identically to dlaqr2.
- **1-based indexing throughout**: KTOP, KBOT, ILOZ, IHIZ are all 1-based. Helper closures `hij(r,c)`, `tij(r,c)`, etc. convert to 0-based offsets.
- **LAPACK recursion-breaking pattern**: dlaqr0 -> dlaqr3 -> dlaqr4 -> dlaqr2. dlaqr4 is identical to dlaqr0 but calls dlaqr2 instead of dlaqr3, breaking infinite recursion. In JS, dlaqr4 requires dlaqr2 which requires dtrexc -> dlaexc -> {dlasy2, dlarfx, dlartg, dlanv2, etc.}.

## Dependency interface surprises

- **dtrexc returns `{ info, ifst, ilst }`**: IFST/ILST are in/out in Fortran. dlaqr2/dlaqr3 only uses `trxResult.ilst` and `trxResult.info`.
- **dlanv2 returns an object**: `{ a, b, c, d, rt1r, rt1i, rt2r, rt2i, cs, sn }`. Used for eigenvalue extraction from 2x2 blocks in the shift-restore loop.
- **dlasy2 uses Float64Array(1) for scalar outputs**: `scale` and `xnorm` are passed as single-element arrays.
- **dlarfg signature**: `dlarfg(N, alpha, offsetAlpha, x, strideX, offsetX, tau, offsetTau)` — alpha and tau are array+offset, not scalars.
- **DCOPY with stride = LDH+1**: The Fortran `DCOPY(JW-1, H(KWTOP+1,KWTOP), LDH+1, T(2,1), LDT+1)` copies the sub-diagonal. In JS this becomes stride = strideH1 + strideH2.

## Automation opportunities

- deps.py should be extended to transitively include dtrexc/dlaexc/dlaqr4 chain automatically. The Fortran deps file had to be manually expanded with ~40 extra routines.
- The `dlaqr23impl` shared implementation pattern (parameterized by an optional dlaqr4 function) could be generated automatically when translating paired routines like dlaqr2/dlaqr3.

## Coverage gaps

- dlaqr3/lib/base.js itself is 100% covered (it's a thin wrapper calling dlaqr23impl).
- The shared dlaqr23impl has some uncovered paths with small test matrices:
  - The dlaqr4 code path requires matrices > 12x12 to trigger
  - The bubble-sort path for diagonal blocks requires enough eigenvalues that sorting occurs
  - The dormhr accumulation path requires ns > 1 AND s != 0 after deflation
  - dtrexc backward movement (ifst > ilst) is not exercised
- These paths ARE exercised when dlaqr3 is called from higher-level routines (e.g., dhseqr on large matrices).

## Complex number handling

- N/A (dlaqr3 is a double-precision real routine)
