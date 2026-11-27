# dsyr2k: Translation Learnings

## Translation pitfalls

- Straightforward translation from dsyrk pattern. The key difference is the addition of matrix B: instead of `A(I,L)*TEMP` (rank-k), we have `A(I,L)*TEMP1 + B(I,L)*TEMP2` (rank-2k).
- In the TRANS='N' inner loop, the Fortran checks `A(J,L).NE.ZERO .OR. B(J,L).NE.ZERO` (note: OR not AND). Both TEMP1 and TEMP2 must be computed together when either is nonzero.
- The lower-triangle starting index for i uses `j*sc1 + j*sc2` (diagonal element), matching the dsyrk pattern.

## Dependency interface surprises

- N/A -- dsyr2k is a leaf routine with no BLAS/LAPACK dependencies.

## Automation opportunities

- The dsyr2k implementation closely mirrors dsyrk with an added B matrix. A parameterized template for syrk/syr2k/herk/her2k could reduce duplication.

## Coverage gaps

- Branch coverage at 96.55%. The uncovered branch is likely the implicit `beta === 1.0` path in the main computation loops (where C is left unchanged). This is a no-op path that skips the beta scaling, exercised implicitly through the `beta === 1.0` tests (upper_N, lower_N, upper_T, lower_T).

## Complex number handling

- N/A -- dsyr2k is a real-valued (double precision) routine. The complex analog would be zsyr2k or zher2k.
