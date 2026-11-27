# dsfrk: Translation Learnings

## Translation pitfalls

- The RFP format stores a symmetric matrix in N*(N+1)/2 elements but treats
  sub-blocks as 2D with varying "leading dimensions" (N, N1, N2, NK, N+1).
  In JS these become strideC2 = strideC * LDA. Getting the offset right for
  each of the 16 dispatch paths requires careful 1-based to 0-based index
  conversion (Fortran C(K) = JS offsetC + (K-1)*strideC).
- The N-odd/upper branch uses A(N2,1) in Fortran -- row index N2, which is
  0-based (N2-1). This is an easy off-by-one to miss since most other
  branches use A(N1+1,1) which is simply strideA1*N1 in 0-based.
- dsyrk and dgemm in this project take 2D strides (strideC1, strideC2) for
  their C parameter, not a single LDA. The C array in dsfrk is 1D RFP, so
  strideC1=sc (element stride) and strideC2=sc*LDA.

## Dependency interface surprises

- dsyrk signature: dsyrk(uplo, trans, N, K, alpha, A, sA1, sA2, oA, beta, C, sC1, sC2, oC)
- dgemm signature: dgemm(transa, transb, M, N, K, alpha, A, sA1, sA2, oA, B, sB1, sB2, oB, beta, C, sC1, sC2, oC)
- Both A references in dgemm calls point into the same physical A array
  (the input matrix to dsfrk), just at different offsets. This is fine since
  A is read-only.

## Automation opportunities

- The 16-path RFP dispatch is highly mechanical. A code generator that takes
  a table of (uplo_syrk, trans_syrk, dim, offset_C, uplo_syrk2, ..., dgemm_params)
  and emits the JS would eliminate transcription errors.

## Coverage gaps

- All 16 paths (2 transr x 2 uplo x 2 trans x 2 parity) are covered via
  Fortran-generated reference fixtures for N=3 (odd) and N=4 (even).
- Larger N=5 covered for 2 paths. Full coverage of all 8 paths for N=5
  would be nice but is not strictly necessary.

## Complex number handling

- N/A: dsfrk is a real-valued routine.
