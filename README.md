<div align="center">
  <img width="377px" src="./blahpack.png" alt="BLAHPACK">
</div>

# BLAHPACK

Idiomatic JavaScript implementations of BLAS and LAPACK routines (hence the portmanteau "BLA"), translated from the Fortran reference implementations via an LLM (hence the resulting "BLAH").

## What's included

### Linear systems

| Problem | Real | Complex |
|---|---|---|
| General solve (LU) | [`dgesv`](lib/lapack/base/dgesv) | [`zgesv`](lib/lapack/base/zgesv) |
| Triangular solve | [`dtrsm`](lib/blas/base/dtrsm), [`dtrtrs`](lib/lapack/base/dtrtrs) | [`ztrsm`](lib/blas/base/ztrsm) |
| SPD / Hermitian PD solve (Cholesky) | [`dposv`](lib/lapack/base/dposv) | [`zposv`](lib/lapack/base/zposv) |
| Least-squares (QR / LQ) | [`dgels`](lib/lapack/base/dgels) | |

### Factorizations

| Factorization | Real | Complex |
|---|---|---|
| LU (partial pivoting) | [`dgetrf`](lib/lapack/base/dgetrf) | [`zgetrf`](lib/lapack/base/zgetrf) |
| Cholesky | [`dpotrf`](lib/lapack/base/dpotrf) | [`zpotrf`](lib/lapack/base/zpotrf) |
| QR | [`dgeqrf`](lib/lapack/base/dgeqrf) | [`zgeqrf`](lib/lapack/base/zgeqrf) |
| LQ | [`dgelqf`](lib/lapack/base/dgelqf) | [`zgelqf`](lib/lapack/base/zgelqf) |
| QR with column pivoting | | [`zgeqp3`](lib/lapack/base/zgeqp3) |
| Bidiagonal reduction | [`dgebrd`](lib/lapack/base/dgebrd) | [`zgebrd`](lib/lapack/base/zgebrd) |
| Hessenberg reduction | | [`zgghrd`](lib/lapack/base/zgghrd) |

### Eigenvalues and singular values

| Problem | Real | Complex |
|---|---|---|
| SVD | [`dgesvd`](lib/lapack/base/dgesvd) | [`zgesvd`](lib/lapack/base/zgesvd) |
| Symmetric / Hermitian eigenvalues | [`dsyev`](lib/lapack/base/dsyev) | |
| Generalized eigenvalues | | [`zggev`](lib/lapack/base/zggev) |
| Bidiagonal SVD | [`dbdsqr`](lib/lapack/base/dbdsqr) | [`zbdsqr`](lib/lapack/base/zbdsqr) |
| Symmetric tridiagonal eigenvalues | [`dsterf`](lib/lapack/base/dsterf), [`dsteqr`](lib/lapack/base/dsteqr) | [`zsteqr`](lib/lapack/base/zsteqr) |
| Generalized Schur / QZ | | [`zhgeqz`](lib/lapack/base/zhgeqz) |

### Matrix inverse

| Problem | Real | Complex |
|---|---|---|
| General inverse (from LU) | [`dgetri`](lib/lapack/base/dgetri) | [`zgetri`](lib/lapack/base/zgetri) |
| Triangular inverse | [`dtrtri`](lib/lapack/base/dtrtri) | [`ztrtri`](lib/lapack/base/ztrtri) |
| SPD / Hermitian PD inverse (from Cholesky) | [`dpotri`](lib/lapack/base/dpotri) | |

### Orthogonal / unitary transforms

| Operation | Real | Complex |
|---|---|---|
| Apply Q from QR | [`dormqr`](lib/lapack/base/dormqr) | [`zunmqr`](lib/lapack/base/zunmqr) |
| Apply Q from LQ | [`dormlq`](lib/lapack/base/dormlq) | [`zunmlq`](lib/lapack/base/zunmlq) |
| Apply Q from bidiag | [`dormbr`](lib/lapack/base/dormbr) | [`zunmbr`](lib/lapack/base/zunmbr) |
| Generate Q from QR | [`dorgqr`](lib/lapack/base/dorgqr) | [`zungqr`](lib/lapack/base/zungqr) |
| Generate Q from LQ | [`dorglq`](lib/lapack/base/dorglq) | [`zunglq`](lib/lapack/base/zunglq) |
| Generate Q from bidiag | [`dorgbr`](lib/lapack/base/dorgbr) | [`zungbr`](lib/lapack/base/zungbr) |
| Generate Q from tridiag | [`dorgtr`](lib/lapack/base/dorgtr) | |

### BLAS (building blocks)

**Real (double):**
[`daxpy`](lib/blas/base/daxpy),
[`dcopy`](lib/blas/base/dcopy),
[`ddot`](lib/blas/base/ddot),
[`dgemm`](lib/blas/base/dgemm),
[`dgemv`](lib/blas/base/dgemv),
[`dger`](lib/blas/base/dger),
[`dnrm2`](lib/blas/base/dnrm2),
[`drot`](lib/blas/base/drot),
[`dscal`](lib/blas/base/dscal),
[`dswap`](lib/blas/base/dswap),
[`dsymv`](lib/blas/base/dsymv),
[`dsyr`](lib/blas/base/dsyr),
[`dsyr2`](lib/blas/base/dsyr2),
[`dsyr2k`](lib/blas/base/dsyr2k),
[`dsyrk`](lib/blas/base/dsyrk),
[`dtrmm`](lib/blas/base/dtrmm),
[`dtrmv`](lib/blas/base/dtrmv),
[`dtrsm`](lib/blas/base/dtrsm),
[`idamax`](lib/blas/base/idamax)

**Complex (double-complex):**
[`dcabs1`](lib/blas/base/dcabs1),
[`dznrm2`](lib/blas/base/dznrm2),
[`izamax`](lib/blas/base/izamax),
[`zaxpy`](lib/blas/base/zaxpy),
[`zcopy`](lib/blas/base/zcopy),
[`zdotc`](lib/blas/base/zdotc),
[`zdrot`](lib/blas/base/zdrot),
[`zdscal`](lib/blas/base/zdscal),
[`zgemm`](lib/blas/base/zgemm),
[`zgemv`](lib/blas/base/zgemv),
[`zgerc`](lib/blas/base/zgerc),
[`zhemv`](lib/blas/base/zhemv),
[`zher2`](lib/blas/base/zher2),
[`zher2k`](lib/blas/base/zher2k),
[`zherk`](lib/blas/base/zherk),
[`zscal`](lib/blas/base/zscal),
[`zswap`](lib/blas/base/zswap),
[`ztrmm`](lib/blas/base/ztrmm),
[`ztrmv`](lib/blas/base/ztrmv),
[`ztrsm`](lib/blas/base/ztrsm)

## License

&copy; 2026 Ricky Reusser. MIT License.
