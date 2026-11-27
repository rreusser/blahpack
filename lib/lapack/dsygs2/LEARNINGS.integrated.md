# dsygs2: Translation Learnings

## Translation pitfalls

- The Fortran uses A(K, K+1) with stride LDA for row access in the upper case, and A(K+1, K) with stride 1 for column access in the lower case. In JS, these translate to stride=sa2 (row access) and stride=sa1 (column access) respectively. Getting these swapped causes silent corruption.
- The dsyr2 call in itype=1/upper uses the row vectors A(K, K+1:N) and B(K, K+1:N) as if they were column vectors (stride = LDA = sa2). dsyr2's x/y parameters take a stride, so passing sa2 correctly treats row segments as vectors.

## Dependency interface surprises

- dtrsv takes (uplo, trans, diag, N, A, strideA1, strideA2, offsetA, x, strideX, offsetX) -- the vector parameter x uses a single stride, not stride1/stride2. This is consistent with all BLAS-1/2 vector parameters.
- dsyr2 takes the vector strides as plain stride (not stride1/stride2), but the matrix A parameter uses stride1/stride2/offset.

## Automation opportunities

- The Fortran test requires dpotrf as a setup step. The deps file generator should detect calls to external routines in the test program and auto-add them.

## Coverage gaps

- All 4 branches (itype=1 upper/lower, itype=2/3 upper/lower) are tested. 100% line and branch coverage achieved.

## Complex number handling

- N/A -- real-only routine.
