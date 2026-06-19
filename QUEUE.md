# Implementation Queue

Prioritized remaining d\*/z\* LAPACK routines, ordered by tier then by
completion progress. Items near the top of each tier are closest to done.

**Implemented: 899 modules (312 algorithms complete) | Remaining: 198 routines (87 algorithms)**

> To update this file after implementing a routine, run `/blahpack-status`
> or check the box manually. Regenerate with `node bin/gen-queue.js > QUEUE.md`.

## Core Solvers & Factorizations (39 routines)

- [ ] **zlaswlq** (1/2 done) — Computes a blocked Tall-Skinny LQ factorization of a real M-by-N matrix A for M <= N: A = ( L 0 ) * Q, where: Q is a n-b
- [ ] **zlatrs3** (1/2 done) — Solves a triangular system of equations with the scale factors set to prevent overflow.
- [ ] **dbdsvdx, dgesvdx, zgesvdx** — Computes the singular value decomposition (SVD) of a real N-by-N (upper or lower) bidiagonal matrix B, B = U * S * VT, w
- [ ] **dgedmd, zgedmd** — Computes the Dynamic Mode Decomposition (DMD) for a pair of data snapshot matrices.
- [ ] **dgedmdq, zgedmdq** — Computes the Dynamic Mode Decomposition (DMD) for a pair of data snapshot matrices.
- [ ] **dgejsv, zgejsv** — Computes the singular value decomposition (SVD) of a real M-by-N matrix [A], where M >= N.
- [ ] **dgelq, zgelq** — Computes an LQ factorization of a real M-by-N matrix A: A = ( L 0 ) * Q where: Q is a N-by-N orthogonal matrix; L is a l
- [ ] **dgelst, zgelst** — Solves overdetermined or underdetermined systems for GE matrices using QR or LQ factorization with compact WY representa
- [ ] **dgelsy, zgelsy** — Solves overdetermined or underdetermined systems for GE matrices
- [ ] **dgeqp3rk, dlaqp3rk, zgeqp3rk, zlaqp3rk** — Computes a truncated Householder QR factorization with column pivoting of a real m-by-n matrix A by using Level 3 BLAS a
- [ ] **dgeqr, zgeqr** — Computes a QR factorization of a real M-by-N matrix A: A = Q * ( R ), ( 0 ) where: Q is a M-by-M orthogonal matrix; R is
- [ ] **dgesdd, zgesdd** — Computes the singular value decomposition (SVD) of a real M-by-N matrix A, optionally computing the left and right singu
- [ ] **dgesvdq, zgesvdq** — Computes the singular value decomposition (SVD) with a QR-Preconditioned QR SVD Method for GE matrices
- [ ] **dgesvj, zgesvj** — Computes the singular value decomposition (SVD) of a real M-by-N matrix A, where M >= N.
- [ ] **dgetsls, zgetsls** — Solves overdetermined or underdetermined real linear systems involving an M-by-N matrix A, using a tall skinny QR or sho
- [ ] **dlals0, zlals0** — Applies back multiplying factors in solving the least squares problem using divide and conquer SVD approach. Used by sge
- [ ] **dlaqp2rk, zlaqp2rk** — Computes truncated QR factorization with column pivoting of a real matrix block using Level 2 BLAS and overwrites a real
- [ ] **dlaqz0, zlaqz0** — Computes the eigenvalues of a real matrix pair (H,T), where H is an upper Hessenberg matrix and T is upper triangular, u
- [ ] **dlarrv, zlarrv** — Computes the eigenvectors of the tridiagonal matrix T = L D LT given L, D and the eigenvalues of L D LT.

## Divide-and-Conquer (eigen/SVD) (26 routines)

- [ ] **dbdsdc** — Computes the singular value decomposition (SVD) of a real N-by-N (upper or lower) bidiagonal matrix B: B = U * S * VT, u
- [ ] **dlaed0, zlaed0** — Used by DSTEDC. Computes all eigenvalues and corresponding eigenvectors of an unreduced symmetric tridiagonal matrix usi
- [ ] **dlaed1** — Used by DSTEDC. Computes the updated eigensystem of a diagonal matrix after modification by a rank-one symmetric matrix.
- [ ] **dlaed3** — Used by DSTEDC. Finds the roots of the secular equation and updates the eigenvectors. Used when the original matrix is t
- [ ] **dlaed4** — Used by DSTEDC. Finds a single root of the secular equation.
- [ ] **dlaed7, zlaed7** — Used by DSTEDC. Computes the updated eigensystem of a diagonal matrix after modification by a rank-one symmetric matrix.
- [ ] **dlaed8, zlaed8** — Used by DSTEDC. Merges eigenvalues and deflates secular equation. Used when the original matrix is dense.
- [ ] **dlaed9** — Used by DSTEDC. Finds the roots of the secular equation and updates the eigenvectors. Used when the original matrix is d
- [ ] **dlaeda** — Used by DSTEDC. Computes the Z vector determining the rank-one modification of the diagonal matrix. Used when the origin
- [ ] **dlasd0** — Computes the singular values of a real upper bidiagonal n-by-m matrix B with diagonal d and off-diagonal e. Used by sbds
- [ ] **dlasd1** — Computes the SVD of an upper bidiagonal matrix B of the specified size. Used by sbdsdc.
- [ ] **dlasd3** — Finds all square roots of the roots of the secular equation, as defined by the values in D and Z, and then updates the s
- [ ] **dlasd4** — Computes the square root of the i-th updated eigenvalue of a positive symmetric rank-one modification to a positive diag
- [ ] **dlasd6** — Computes the SVD of an updated upper bidiagonal matrix obtained by merging two smaller ones by appending a row. Used by 
- [ ] **dlasd8** — Finds the square roots of the roots of the secular equation, and stores, for each element in D, the distance to its two 
- [ ] **dlasda** — Computes the singular value decomposition (SVD) of a real upper bidiagonal matrix with diagonal d and off-diagonal e. Us
- [ ] **dlasdq** — Computes the SVD of a real bidiagonal matrix with diagonal d and off-diagonal e. Used by sbdsdc.
- [ ] **dstedc, zstedc** — Computes all eigenvalues and, optionally, eigenvectors of a symmetric tridiagonal matrix using the divide and conquer me
- [ ] **dstegr, zstegr** — Computes selected eigenvalues and, optionally, eigenvectors of a real symmetric tridiagonal matrix T.
- [ ] **dstemr, zstemr** — Computes selected eigenvalues and, optionally, eigenvectors of a real symmetric tridiagonal matrix T.

## Generalized Eigenvalue Problems (14 routines)

- [ ] **dgeesx, dggesx, zgeesx, zggesx** — Computes the eigenvalues, the Schur form, and, optionally, the matrix of Schur vectors for GE matrices
- [ ] **dgges3, zgges3** — Computes the eigenvalues, the Schur form, and, optionally, the matrix of Schur vectors for GE matrices (blocked algorith
- [ ] **dggev3, zggev3** — Computes the eigenvalues and, optionally, the left and/or right eigenvectors for GE matrices (blocked algorithm)
- [ ] **dggglm, zggglm** — Solves a general Gauss-Markov linear model (GLM) problem: minimize || y ||_2 subject to d = A*x + B*y x where A is an N-
- [ ] **dgghd3, zgghd3** — Reduces a pair of real matrices (A,B) to generalized upper Hessenberg form using orthogonal transformations, where A is 
- [ ] **dgglse, zgglse** — Solves overdetermined or underdetermined systems for OTHER matrices

## Banded & Packed Storage (16 routines)

- [ ] **dsb2st_kernels, zhb2st_kernels** — Is an internal routine used by the DSYTRD_SB2ST subroutine.
- [ ] **dsbevd, dspevd, dstevd, dsyevd, zhbevd, zheevd, zhpevd** — Computes the eigenvalues and, optionally, the left and/or right eigenvectors for OTHER matrices
- [ ] **dsbgvd, dspgvd, dsygvd, zhbgvd, zhegvd, zhpgvd** — Computes all the eigenvalues, and optionally, the eigenvectors of a real generalized symmetric-definite banded eigenprob
- [ ] **dsposv** — Computes the solution to system of linear equations A * X = B for PO matrices

## Condition Numbers, Norms & Refinement (22 routines)

- [ ] **dgemlq, zgemlq** (2/4 done) — Overwrites the general real M-by-N matrix C with SIDE = 'L' SIDE = 'R' TRANS = 'N': Q * C C * Q TRANS = 'T': Q**T * C C 
- [ ] **dgemqr, zgemqr** (2/4 done) — Overwrites the general real M-by-N matrix C with SIDE = 'L' SIDE = 'R' TRANS = 'N': Q * C C * Q TRANS = 'T': Q**T * C C 
- [ ] **dla_gerfsx_extended** (1/2 done) — Improves the computed solution to a system of linear equations for general matrices by performing extra-precise iterativ
- [ ] **dla_porfsx_extended** (1/2 done) — Improves the computed solution to a system of linear equations for symmetric or Hermitian positive-definite matrices by 
- [ ] **dgbrfsx, dgerfsx, dporfsx, dsyrfsx, zgbrfsx, zgerfsx, zherfsx, zporfsx, zsyrfsx** — Improves the computed solution to a system of linear equations and provides error bounds and backward error estimates fo
- [ ] **dla_syrfsx_extended, zla_syrfsx_extended** — Improves the computed solution to a system of linear equations for symmetric indefinite matrices by performing extra-pre
- [ ] **dormrz, zunmrz** — Overwrites the general real M-by-N matrix C with SIDE = 'L' SIDE = 'R' TRANS = 'N': Q * C C * Q TRANS = 'T': Q**T * C C 
- [ ] **dsytrd_sy2sb** — Reduces a real symmetric matrix A to real symmetric band-diagonal form AB by a orthogonal similarity transformation: Q**
- [ ] **dtrsyl3, ztrsyl3** — 

## Auxiliary Routines (12 routines)

- [ ] **zlamswlq** (1/2 done) — Overwrites the general real M-by-N matrix C with SIDE = 'L' SIDE = 'R' TRANS = 'N': Q * C C * Q TRANS = 'T': Q**T * C C 
- [ ] **zlaqz2** (1/2 done) — Chases a 2x2 shift bulge in a matrix pencil down a single position
- [ ] **dgelsd, dlalsd, zgelsd, zlalsd** — Computes the minimum-norm solution to a linear least squares problem for GE matrices
- [ ] **dlalsa, zlalsa** — Computes the SVD of the coefficient matrix in compact form. Used by sgelsd.
- [ ] **dlaqz3, zlaqz3** — Performs AED
- [ ] **dlarre** — Given the tridiagonal matrix T, sets small off-diagonal elements to zero and for each unreduced block Ti, finds base rep
- [ ] **zlahef_aa** — DLAHEF_AA factorizes a panel of a complex hermitian matrix A using the Aasen's algorithm.

## Expert Drivers (9 routines)

- [ ] **dgbsvxx, dgesvxx, dposvxx, dsysvxx, zgbsvxx, zgesvxx, zhesvxx, zposvxx, zsysvxx** — Computes the solution to system of linear equations A * X = B for GB matrices

## Variants, TSQR, Mixed-Precision & CSD (60 routines)

- [ ] **zhetrf_aa** (2/3 done) — Computes the factorization of a real symmetric matrix A using the Aasen's algorithm.
- [ ] **dbbcsd, dorcsd, zbbcsd, zuncsd** — Computes the CS decomposition of an orthogonal matrix in bidiagonal-block form, [ B11 | B12 0 0 ] [ 0 | 0 -I 0 ] X = [--
- [ ] **dgbequb, dgeequb, dpoequb, dsyequb, zgbequb, zgeequb, zheequb, zpoequb, zsyequb** — Computes row and column scalings intended to equilibrate an M-by-N matrix A and reduce its condition number.
- [ ] **dorbdb, zunbdb** — Simultaneously bidiagonalizes the blocks of an M-by-M partitioned orthogonal matrix X: [ B11 | B12 0 0 ] [ X11 | X12 ] [
- [ ] **dorcsd2by1, zuncsd2by1** — Computes the CS decomposition of an M-by-Q matrix X with orthonormal columns that has been partitioned into a 2-by-1 blo
- [ ] **dsbev_2stage, dsyev_2stage, zhbev_2stage, zheev_2stage** — Computes the eigenvalues and, optionally, the left and/or right eigenvectors for OTHER matrices
- [ ] **dsbevd_2stage, dsyevd_2stage, zhbevd_2stage, zheevd_2stage** — Computes the eigenvalues and, optionally, the left and/or right eigenvectors for OTHER matrices
- [ ] **dsbevx_2stage, dsyevx_2stage, zhbevx_2stage, zheevx_2stage** — Computes the eigenvalues and, optionally, the left and/or right eigenvectors for OTHER matrices
- [ ] **dsgesv** — Computes the solution to system of linear equations A * X = B for GE matrices (mixed precision with iterative refinement
- [ ] **dsyevr_2stage, zheevr_2stage** — Computes the eigenvalues and, optionally, the left and/or right eigenvectors for SY matrices
- [ ] **dsygv_2stage, zhegv_2stage** — Computes all the eigenvalues, and optionally, the eigenvectors of a real generalized symmetric-definite eigenproblem, of
- [ ] **dsysv_aa, zhesv_aa, zsysv_aa** — Computes the solution to system of linear equations A * X = B for SY matrices
- [ ] **dsysv_aa_2stage, zhesv_aa_2stage, zsysv_aa_2stage** — Computes the solution to system of linear equations A * X = B for SY matrices
- [ ] **dsysv_rk, zhesv_rk, zsysv_rk** — Computes the solution to system of linear equations A * X = B for SY matrices
- [ ] **dsysv_rook, zhesv_rook, zsysv_rook** — Computes the solution to system of linear equations A * X = B for SY matrices
- [ ] **dsytrd_2stage, zhetrd_2stage** — Reduces a real symmetric matrix A to real symmetric tridiagonal form T by a orthogonal similarity transformation: Q1**T 
- [ ] **dsytrf_aa_2stage, zhetrf_aa_2stage, zsytrf_aa_2stage** — Computes the factorization of a real symmetric matrix A using the Aasen's algorithm.
- [ ] **dsytrs_aa, zhetrs_aa, zsytrs_aa** — Solves a system of linear equations A*X = B with a real symmetric matrix A using the factorization A = U**T*T*U or A = L
- [ ] **dsytrs_aa_2stage, zhetrs_aa_2stage, zsytrs_aa_2stage** — Solves a system of linear equations A*X = B with a real symmetric matrix A using the factorization A = U**T*T*U or A = L
- [ ] **zcgesv** — Computes the solution to system of linear equations A * X = B for GE matrices (mixed precision with iterative refinement
- [ ] **zcposv** — Computes the solution to system of linear equations A * X = B for PO matrices

---
**Total remaining: 198 routines across 87 algorithms**
