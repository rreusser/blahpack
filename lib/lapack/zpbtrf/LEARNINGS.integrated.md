# zpbtrf: Translation Learnings

## Translation pitfalls

- Direct analog of dpbtrf with complex Level 3 BLAS calls.
- Key difference from dpbtrf: 'Transpose' becomes 'C' (Conjugate transpose) for ztrsm and zgemm. dsyrk becomes zherk. dtrsm becomes ztrsm with Complex128 alpha. dgemm becomes zgemm with Complex128 alpha/beta.
- WORK array must be Complex128Array, not Float64Array. Copy operations between AB and WORK use `AB.get()` and `WORK.set()` with Complex128 indexing.
- zpotf2 is required as a dependency for the diagonal block factorization.
- The blocked path only triggers when kd > 32 (NBMAX). Testing required N=100, KD=33 to exercise this path.

## Dependency interface surprises

- zherk uses REAL alpha and beta (number), not Complex128. This matches the Fortran ZHERK signature.
- ztrsm uses Complex128 alpha. Must pass `new Complex128(1,0)` as CONE.
- zgemm uses Complex128 alpha AND beta. Must pass CONE and CMONE as appropriate.
- zpotf2 uses complex-element strides. The band storage sub-matrix stride is `sa2 - sa1` (in complex elements), matching `LDAB-1` in Fortran.

## Automation opportunities

- The dpbtrf -> zpbtrf translation pattern is very mechanical: substitute complex BLAS for real BLAS, change 'T' to 'C', change Float64Array WORK to Complex128Array WORK, change alpha/beta types.
- deps file generation missed ilaenv/ieeeck/iparmq/iparam2stage for the Fortran test compilation. These should be auto-detected.

## Coverage gaps

- 98.46% line, 92.86% branch coverage on zpbtrf/base.js. The uncovered lines are the `nb < 1` guard (dead code since NBMAX=32) and WORK initialization zero-fill (always executed but marked partial).
- Both upper and lower blocked paths exercised with N=100, KD=33.

## Complex number handling

- No complex arithmetic is inlined in zpbtrf. All operations delegated to zpotf2, ztrsm, zherk, zgemm.
- WORK copy operations use Complex128Array .get()/.set() methods which handle complex-element indexing.
