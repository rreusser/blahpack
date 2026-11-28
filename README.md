<div align="center">
  <img width="377px" src="./blahpack.png" alt="BLAHPACK">
</div>

# BLAHPACK

Idiomatic JavaScript implementations of BLAS and LAPACK routines (hence the portmanteau "BLA"), translated from the Fortran reference implementations via an LLM (hence the resulting "BLAH").

## What's included

### Linear systems

| Problem | Real | Complex |
|---|---|---|
| General solve (LU) | [`dgesv`](lib/lapack/dgesv) | [`zgesv`](lib/lapack/zgesv) |
| Triangular solve | [`dtrsm`](lib/blas/dtrsm), [`dtrtrs`](lib/lapack/dtrtrs) | [`ztrsm`](lib/blas/ztrsm) |
| SPD / Hermitian PD solve (Cholesky) | [`dposv`](lib/lapack/dposv) | [`zposv`](lib/lapack/zposv) |
| Least-squares (QR / LQ) | [`dgels`](lib/lapack/dgels) | |

### Factorizations

| Factorization | Real | Complex |
|---|---|---|
| LU (partial pivoting) | [`dgetrf`](lib/lapack/dgetrf) | [`zgetrf`](lib/lapack/zgetrf) |
| Cholesky | [`dpotrf`](lib/lapack/dpotrf) | [`zpotrf`](lib/lapack/zpotrf) |
| QR | [`dgeqrf`](lib/lapack/dgeqrf) | [`zgeqrf`](lib/lapack/zgeqrf) |
| LQ | [`dgelqf`](lib/lapack/dgelqf) | [`zgelqf`](lib/lapack/zgelqf) |
| QR with column pivoting | | [`zgeqp3`](lib/lapack/zgeqp3) |
| Bidiagonal reduction | [`dgebrd`](lib/lapack/dgebrd) | [`zgebrd`](lib/lapack/zgebrd) |
| Hessenberg reduction | | [`zgghrd`](lib/lapack/zgghrd) |

### Eigenvalues and singular values

| Problem | Real | Complex |
|---|---|---|
| SVD | [`dgesvd`](lib/lapack/dgesvd) | [`zgesvd`](lib/lapack/zgesvd) |
| Symmetric / Hermitian eigenvalues | [`dsyev`](lib/lapack/dsyev) | |
| Generalized eigenvalues | | [`zggev`](lib/lapack/zggev) |
| Bidiagonal SVD | [`dbdsqr`](lib/lapack/dbdsqr) | [`zbdsqr`](lib/lapack/zbdsqr) |
| Symmetric tridiagonal eigenvalues | [`dsterf`](lib/lapack/dsterf), [`dsteqr`](lib/lapack/dsteqr) | [`zsteqr`](lib/lapack/zsteqr) |
| Generalized Schur / QZ | | [`zhgeqz`](lib/lapack/zhgeqz) |

### Matrix inverse

| Problem | Real | Complex |
|---|---|---|
| General inverse (from LU) | [`dgetri`](lib/lapack/dgetri) | [`zgetri`](lib/lapack/zgetri) |
| Triangular inverse | [`dtrtri`](lib/lapack/dtrtri) | [`ztrtri`](lib/lapack/ztrtri) |
| SPD / Hermitian PD inverse (from Cholesky) | [`dpotri`](lib/lapack/dpotri) | |

### Orthogonal / unitary transforms

| Operation | Real | Complex |
|---|---|---|
| Apply Q from QR | [`dormqr`](lib/lapack/dormqr) | [`zunmqr`](lib/lapack/zunmqr) |
| Apply Q from LQ | [`dormlq`](lib/lapack/dormlq) | [`zunmlq`](lib/lapack/zunmlq) |
| Apply Q from bidiag | [`dormbr`](lib/lapack/dormbr) | [`zunmbr`](lib/lapack/zunmbr) |
| Generate Q from QR | [`dorgqr`](lib/lapack/dorgqr) | [`zungqr`](lib/lapack/zungqr) |
| Generate Q from LQ | [`dorglq`](lib/lapack/dorglq) | [`zunglq`](lib/lapack/zunglq) |
| Generate Q from bidiag | [`dorgbr`](lib/lapack/dorgbr) | [`zungbr`](lib/lapack/zungbr) |
| Generate Q from tridiag | [`dorgtr`](lib/lapack/dorgtr) | |

### BLAS (building blocks)

**Real (double):**
[`daxpy`](lib/blas/daxpy),
[`dcopy`](lib/blas/dcopy),
[`ddot`](lib/blas/ddot),
[`dgemm`](lib/blas/dgemm),
[`dgemv`](lib/blas/dgemv),
[`dger`](lib/blas/dger),
[`dnrm2`](lib/blas/dnrm2),
[`drot`](lib/blas/drot),
[`dscal`](lib/blas/dscal),
[`dswap`](lib/blas/dswap),
[`dsymv`](lib/blas/dsymv),
[`dsyr`](lib/blas/dsyr),
[`dsyr2`](lib/blas/dsyr2),
[`dsyr2k`](lib/blas/dsyr2k),
[`dsyrk`](lib/blas/dsyrk),
[`dtrmm`](lib/blas/dtrmm),
[`dtrmv`](lib/blas/dtrmv),
[`dtrsm`](lib/blas/dtrsm),
[`idamax`](lib/blas/idamax)

**Complex (double-complex):**
[`dcabs1`](lib/blas/dcabs1),
[`dznrm2`](lib/blas/dznrm2),
[`izamax`](lib/blas/izamax),
[`zaxpy`](lib/blas/zaxpy),
[`zcopy`](lib/blas/zcopy),
[`zdotc`](lib/blas/zdotc),
[`zdrot`](lib/blas/zdrot),
[`zdscal`](lib/blas/zdscal),
[`zgemm`](lib/blas/zgemm),
[`zgemv`](lib/blas/zgemv),
[`zgerc`](lib/blas/zgerc),
[`zhemv`](lib/blas/zhemv),
[`zher2`](lib/blas/zher2),
[`zher2k`](lib/blas/zher2k),
[`zherk`](lib/blas/zherk),
[`zscal`](lib/blas/zscal),
[`zswap`](lib/blas/zswap),
[`ztrmm`](lib/blas/ztrmm),
[`ztrmv`](lib/blas/ztrmv),
[`ztrsm`](lib/blas/ztrsm)

## License

&copy; 2026 Ricky Reusser. MIT License.
