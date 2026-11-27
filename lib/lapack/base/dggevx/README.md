<!--

@license Apache-2.0

Copyright (c) 2025 The Stdlib Authors.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

-->

# dggevx

> Compute generalized eigenvalues, eigenvectors, and optional balancing/condition numbers for a pair of real non-symmetric matrices.

<section class="usage">

## Usage

```javascript
var dggevx = require( '@stdlib/lapack/base/dggevx' );
```

#### dggevx( order, balanc, jobvl, jobvr, sense, N, A, LDA, B, LDB, ALPHAR, strideALPHAR, ALPHAI, strideALPHAI, BETA, strideBETA, VL, LDVL, VR, LDVR, LSCALE, strideLSCALE, RSCALE, strideRSCALE, RCONDE, strideRCONDE, RCONDV, strideRCONDV )

Computes for a pair of N-by-N real nonsymmetric matrices (A,B) the generalized eigenvalues, and, optionally, the left and/or right generalized eigenvectors, along with optional balancing (ILO/IHI/LSCALE/RSCALE/ABNRM/BBNRM).

```javascript
var Float64Array = require( '@stdlib/array/float64' );

var A = new Float64Array( [ 2.0, 0.0, 0.0, 3.0 ] );
var B = new Float64Array( [ 1.0, 0.0, 0.0, 1.0 ] );
var ALPHAR = new Float64Array( 2 );
var ALPHAI = new Float64Array( 2 );
var BETA = new Float64Array( 2 );
var VL = new Float64Array( 1 );
var VR = new Float64Array( 1 );
var LSCALE = new Float64Array( 2 );
var RSCALE = new Float64Array( 2 );
var RCONDE = new Float64Array( 2 );
var RCONDV = new Float64Array( 2 );

var out = dggevx( 'column-major', 'none', 'no-vectors', 'no-vectors', 'none', 2, A, 2, B, 2, ALPHAR, 1, ALPHAI, 1, BETA, 1, VL, 1, VR, 1, LSCALE, 1, RSCALE, 1, RCONDE, 1, RCONDV, 1 );
// out => { info: 0, ilo: 1, ihi: 2, abnrm: 3.0, bbnrm: 1.0 }
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **balanc**: balancing option (`'none'`, `'permute'`, `'scale'`, or `'both'`).
-   **jobvl**: `'compute-vectors'` to compute left eigenvectors, `'no-vectors'` otherwise.
-   **jobvr**: `'compute-vectors'` to compute right eigenvectors, `'no-vectors'` otherwise.
-   **sense**: reciprocal condition numbers to compute (`'none'`, `'eigenvalues'`, `'right-vectors'`, or `'both'`). Currently only `'none'` is supported — passing any other value throws, pending translation of `dtgsna`.
-   **N**: order of `A` and `B`.
-   **A**: input matrix, overwritten on exit.
-   **LDA**: leading dimension of `A`.
-   **B**: input matrix, overwritten on exit.
-   **LDB**: leading dimension of `B`.
-   **ALPHAR**: output, real parts of alpha (length `N`).
-   **strideALPHAR**: stride for `ALPHAR`.
-   **ALPHAI**: output, imaginary parts of alpha (length `N`).
-   **strideALPHAI**: stride for `ALPHAI`.
-   **BETA**: output, beta values (length `N`).
-   **strideBETA**: stride for `BETA`.
-   **VL**: output, left eigenvectors.
-   **LDVL**: leading dimension of `VL`.
-   **VR**: output, right eigenvectors.
-   **LDVR**: leading dimension of `VR`.
-   **LSCALE**: output, permutation/scaling factors (length `N`).
-   **strideLSCALE**: stride for `LSCALE`.
-   **RSCALE**: output, permutation/scaling factors (length `N`).
-   **strideRSCALE**: stride for `RSCALE`.
-   **RCONDE**: output, reciprocal condition numbers of eigenvalues (length `N`). Currently unused.
-   **strideRCONDE**: stride for `RCONDE`.
-   **RCONDV**: output, reciprocal condition numbers of right eigenvectors (length `N`). Currently unused.
-   **strideRCONDV**: stride for `RCONDV`.

The function returns an object `{ info, ilo, ihi, abnrm, bbnrm }`. `info` is `0` on success, `1..N` if the QZ iteration failed, or `N+1`/`N+2` for other errors. `ilo` and `ihi` are the 1-based row/column indices of the central submatrix produced by balancing. `abnrm` and `bbnrm` are the one-norms of the original (unscaled) `A` and `B`.

#### dggevx.ndarray( balanc, jobvl, jobvr, sense, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, ALPHAR, strideALPHAR, offsetALPHAR, ALPHAI, strideALPHAI, offsetALPHAI, BETA, strideBETA, offsetBETA, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR, LSCALE, strideLSCALE, offsetLSCALE, RSCALE, strideRSCALE, offsetRSCALE, RCONDE, strideRCONDE, offsetRCONDE, RCONDV, strideRCONDV, offsetRCONDV )

Same as above using ndarray indexing semantics. Takes a pair of strides and an offset for each input/output array in place of a single leading dimension.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   Workspace (`WORK`, `IWORK`, `BWORK`) is allocated internally; there is no `LWORK` parameter.
-   `sense` values other than `'none'` require `dtgsna`, which is not yet translated. Passing any other value throws an error.

</section>

<!-- /.notes -->

<section class="examples">

## Examples

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var dggevx = require( '@stdlib/lapack/base/dggevx' );

var A = new Float64Array( [ 2.0, 0.0, 0.0, 5.0 ] );
var B = new Float64Array( [ 1.0, 0.0, 0.0, 1.0 ] );
var ALPHAR = new Float64Array( 2 );
var ALPHAI = new Float64Array( 2 );
var BETA = new Float64Array( 2 );
var VL = new Float64Array( 1 );
var VR = new Float64Array( 1 );
var LSCALE = new Float64Array( 2 );
var RSCALE = new Float64Array( 2 );
var RCONDE = new Float64Array( 2 );
var RCONDV = new Float64Array( 2 );

var out = dggevx( 'column-major', 'none', 'no-vectors', 'no-vectors', 'none', 2, A, 2, B, 2, ALPHAR, 1, ALPHAI, 1, BETA, 1, VL, 1, VR, 1, LSCALE, 1, RSCALE, 1, RCONDE, 1, RCONDV, 1 );
console.log( out );
console.log( 'eigenvalue 0:', ALPHAR[ 0 ] / BETA[ 0 ] );
console.log( 'eigenvalue 1:', ALPHAR[ 1 ] / BETA[ 1 ] );
```

</section>

<!-- /.examples -->

<!-- fortran-docs:start (generated by bin/fortran-docs.mjs from data/lapack-3.12.0/SRC/dggevx.f; do not edit) -->

<section class="fortran-docs">

## Reference documentation

From the reference LAPACK 3.12.0 source of `DGGEVX`, converted to Markdown with KaTeX math. Indices are the 1-based Fortran indices of the source.

> Computes the eigenvalues and, optionally, the left and/or right eigenvectors for GE matrices

### Purpose

DGGEVX computes for a pair of N-by-N real nonsymmetric matrices (A,B) the generalized eigenvalues, and optionally, the left and/or right generalized eigenvectors.

Optionally also, it computes a balancing transformation to improve the conditioning of the eigenvalues and eigenvectors (`ILO`, `IHI`, `LSCALE`, `RSCALE`, `ABNRM`, and `BBNRM`), reciprocal condition numbers for the eigenvalues (`RCONDE`), and reciprocal condition numbers for the right eigenvectors (`RCONDV`).

A generalized eigenvalue for a pair of matrices (A,B) is a scalar $\lambda$ or a ratio $\alpha /\beta = \lambda$, such that $A - \lambda \, B$ is singular. It is usually represented as the pair ($\alpha$,$\beta$), as there is a reasonable interpretation for $\beta =0$, and even for both being zero.

The right eigenvector v(j) corresponding to the eigenvalue lambda(j) of (A,B) satisfies

$$
A \, v(j) = \lambda (j) \, B \, v(j)
$$

The left eigenvector u(j) corresponding to the eigenvalue lambda(j) of (A,B) satisfies

$$
u(j)^H \, A = \lambda (j) \, u(j)^H \, B
$$

where $u(j)^H$ is the conjugate-transpose of u(j).

### Arguments

#### BALANC `[in]`

_CHARACTER\*1_

Specifies the balance option to be performed.

-   `= 'N'`: do not diagonally scale or permute;
-   `= 'P'`: permute only;
-   `= 'S'`: scale only;
-   `= 'B'`: both permute and scale. Computed reciprocal condition numbers will be for the matrices after permuting and/or balancing. Permuting does not change condition numbers (in exact arithmetic), but balancing does.

#### JOBVL `[in]`

_CHARACTER\*1_

-   `= 'N'`: do not compute the left generalized eigenvectors;
-   `= 'V'`: compute the left generalized eigenvectors.

#### JOBVR `[in]`

_CHARACTER\*1_

-   `= 'N'`: do not compute the right generalized eigenvectors;
-   `= 'V'`: compute the right generalized eigenvectors.

#### SENSE `[in]`

_CHARACTER\*1_

Determines which reciprocal condition numbers are computed.

-   `= 'N'`: none are computed;
-   `= 'E'`: computed for eigenvalues only;
-   `= 'V'`: computed for eigenvectors only;
-   `= 'B'`: computed for eigenvalues and eigenvectors.

#### N `[in]`

_INTEGER_

The order of the matrices A, B, `VL`, and `VR`. $N \ge 0$.

#### A `[in,out]`

_DOUBLE PRECISION array, dimension (LDA, N)_

On entry, the matrix A in the pair (A,B). On exit, A has been overwritten. If `JOBVL='V'` or `JOBVR='V'` or both, then A contains the first part of the real Schur form of the "balanced" versions of the input A and B.

#### LDA `[in]`

_INTEGER_

The leading dimension of A. $\mathrm{LDA} \ge \max (1,N)$.

#### B `[in,out]`

_DOUBLE PRECISION array, dimension (LDB, N)_

On entry, the matrix B in the pair (A,B). On exit, B has been overwritten. If `JOBVL='V'` or `JOBVR='V'` or both, then B contains the second part of the real Schur form of the "balanced" versions of the input A and B.

#### LDB `[in]`

_INTEGER_

The leading dimension of B. $\mathrm{LDB} \ge \max (1,N)$.

#### ALPHAR `[out]`

_DOUBLE PRECISION array, dimension (N)_

#### ALPHAI `[out]`

_DOUBLE PRECISION array, dimension (N)_

#### BETA `[out]`

_DOUBLE PRECISION array, dimension (N)_

On exit, (`ALPHAR(j)` + `ALPHAI(j)`\*i)/`BETA(j)`, $j=1$,...,N, will be the generalized eigenvalues. If `ALPHAI(j)` is zero, then the j-th eigenvalue is real; if positive, then the j-th and (j+1)-st eigenvalues are a complex conjugate pair, with `ALPHAI(j+1)` negative.

Note: the quotients `ALPHAR(j)`/`BETA(j)` and `ALPHAI(j)`/`BETA(j)` may easily over- or underflow, and `BETA(j)` may even be zero. Thus, the user should avoid naively computing the ratio ALPHA/`BETA`. However, `ALPHAR` and `ALPHAI` will be always less than and usually comparable with norm(A) in magnitude, and `BETA` always less than and usually comparable with norm(B).

#### VL `[out]`

_DOUBLE PRECISION array, dimension (LDVL,N)_

If `JOBVL = 'V'`, the left eigenvectors u(j) are stored one after another in the columns of `VL`, in the same order as their eigenvalues. If the j-th eigenvalue is real, then $u(j) = \mathrm{VL}(:,j)$, the j-th column of `VL`. If the j-th and (j+1)-th eigenvalues form a complex conjugate pair, then $u(j) = \mathrm{VL}(:,j)+i \, \mathrm{VL}(:,j+1)$ and $u(j+1) = \mathrm{VL}(:,j)-i \, \mathrm{VL}(:,j+1)$. Each eigenvector will be scaled so the largest component have abs(real part) + abs(imag. part) = 1. Not referenced if `JOBVL = 'N'`.

#### LDVL `[in]`

_INTEGER_

The leading dimension of the matrix `VL`. $\mathrm{LDVL} \ge 1$, and if `JOBVL = 'V'`, $\mathrm{LDVL} \ge N$.

#### VR `[out]`

_DOUBLE PRECISION array, dimension (LDVR,N)_

If `JOBVR = 'V'`, the right eigenvectors v(j) are stored one after another in the columns of `VR`, in the same order as their eigenvalues. If the j-th eigenvalue is real, then $v(j) = \mathrm{VR}(:,j)$, the j-th column of `VR`. If the j-th and (j+1)-th eigenvalues form a complex conjugate pair, then $v(j) = \mathrm{VR}(:,j)+i \, \mathrm{VR}(:,j+1)$ and $v(j+1) = \mathrm{VR}(:,j)-i \, \mathrm{VR}(:,j+1)$. Each eigenvector will be scaled so the largest component have abs(real part) + abs(imag. part) = 1. Not referenced if `JOBVR = 'N'`.

#### LDVR `[in]`

_INTEGER_

The leading dimension of the matrix `VR`. $\mathrm{LDVR} \ge 1$, and if `JOBVR = 'V'`, $\mathrm{LDVR} \ge N$.

#### ILO `[out]`

_INTEGER_

#### IHI `[out]`

_INTEGER_

`ILO` and `IHI` are integer values such that on exit $A(i,j) = 0$ and $B(i,j) = 0$ if $i > j$ and $j = 1$,...,`ILO`-1 or $i = \mathrm{IHI}+1$,...,N. If `BALANC = 'N'` or 'S', `ILO = 1` and `IHI = N`.

#### LSCALE `[out]`

_DOUBLE PRECISION array, dimension (N)_

Details of the permutations and scaling factors applied to the left side of A and B. If PL(j) is the index of the row interchanged with row j, and DL(j) is the scaling factor applied to row j, then

$$
\mathrm{LSCALE}(j) = \mathrm{PL}(j) \quad\text{for}\quad j = 1, \cdots ,\mathrm{ILO}-1
$$

$$
= \mathrm{DL}(j) \quad\text{for}\quad j = \mathrm{ILO}, \cdots ,\mathrm{IHI}
$$

$$
= \mathrm{PL}(j) \quad\text{for}\quad j = \mathrm{IHI}+1, \cdots ,N
$$

The order in which the interchanges are made is N to `IHI`+1, then 1 to `ILO`-1.

#### RSCALE `[out]`

_DOUBLE PRECISION array, dimension (N)_

Details of the permutations and scaling factors applied to the right side of A and B. If PR(j) is the index of the column interchanged with column j, and DR(j) is the scaling factor applied to column j, then

$$
\mathrm{RSCALE}(j) = \mathrm{PR}(j) \quad\text{for}\quad j = 1, \cdots ,\mathrm{ILO}-1
$$

$$
= \mathrm{DR}(j) \quad\text{for}\quad j = \mathrm{ILO}, \cdots ,\mathrm{IHI}
$$

$$
= \mathrm{PR}(j) \quad\text{for}\quad j = \mathrm{IHI}+1, \cdots ,N
$$

The order in which the interchanges are made is N to `IHI`+1, then 1 to `ILO`-1.

#### ABNRM `[out]`

_DOUBLE PRECISION_

The one-norm of the balanced matrix A.

#### BBNRM `[out]`

_DOUBLE PRECISION_

The one-norm of the balanced matrix B.

#### RCONDE `[out]`

_DOUBLE PRECISION array, dimension (N)_

If `SENSE = 'E'` or 'B', the reciprocal condition numbers of the eigenvalues, stored in consecutive elements of the array. For a complex conjugate pair of eigenvalues two consecutive elements of `RCONDE` are set to the same value. Thus `RCONDE(j)`, `RCONDV(j)`, and the j-th columns of `VL` and `VR` all correspond to the j-th eigenpair. If `SENSE` = 'N or 'V', `RCONDE` is not referenced.

#### RCONDV `[out]`

_DOUBLE PRECISION array, dimension (N)_

If `SENSE = 'V'` or 'B', the estimated reciprocal condition numbers of the eigenvectors, stored in consecutive elements of the array. For a complex eigenvector two consecutive elements of `RCONDV` are set to the same value. If the eigenvalues cannot be reordered to compute `RCONDV(j)`, `RCONDV(j)` is set to 0; this can only occur when the true value would be very small anyway. If `SENSE = 'N'` or 'E', `RCONDV` is not referenced.

#### WORK `[out]`

_DOUBLE PRECISION array, dimension (MAX(1,LWORK))_

On exit, if `INFO = 0`, `WORK(1)` returns the optimal `LWORK`.

#### LWORK `[in]`

_INTEGER_

The dimension of the array `WORK`. $\mathrm{LWORK} \ge \max (1,2 \, N)$. If `BALANC = 'S'` or 'B', or `JOBVL = 'V'`, or `JOBVR = 'V'`, $\mathrm{LWORK} \ge \max (1,6 \, N)$. If `SENSE = 'E'` or 'B', $\mathrm{LWORK} \ge \max (1,10 \, N)$. If `SENSE = 'V'` or 'B', $\mathrm{LWORK} \ge 2 \, N \, N+8 \, N+16$.

If `LWORK = -1`, then a workspace query is assumed; the routine only calculates the optimal size of the `WORK` array, returns this value as the first entry of the `WORK` array, and no error message related to `LWORK` is issued by XERBLA.

#### IWORK `[out]`

_INTEGER array, dimension (N+6)_

If `SENSE = 'E'`, `IWORK` is not referenced.

#### BWORK `[out]`

_LOGICAL array, dimension (N)_

If `SENSE = 'N'`, `BWORK` is not referenced.

#### INFO `[out]`

_INTEGER_

-   `= 0`: successful exit
-   `< 0`: if `INFO = -i`, the i-th argument had an illegal value.
-   `= 1,...,N`:  The QZ iteration failed.  No eigenvectors have been calculated, but `ALPHAR(j)`, `ALPHAI(j)`, and `BETA(j)` should be correct for $j=\mathrm{INFO}+1$,...,N.
-   `> N`: =N+1: other than QZ iteration failed in DHGEQZ. =N+2: error return from DTGEVC.

### Further Details

Balancing a matrix pair (A,B) includes, first, permuting rows and columns to isolate eigenvalues, second, applying diagonal similarity transformation to the rows and columns to make the rows and columns as close in norm as possible. The computed reciprocal condition numbers correspond to the balanced matrix. Permuting rows and columns will not change the condition numbers (in exact arithmetic) but diagonal scaling will. For further explanation of balancing, see section 4.11.1.2 of LAPACK Users' Guide.

An approximate error bound on the chordal distance between the i-th computed generalized eigenvalue w and the corresponding exact eigenvalue $\lambda$ is

chord(w, $\lambda$) \<= $\mathrm{EPS} \, \operatorname{norm}(\mathrm{ABNRM}, \mathrm{BBNRM}) / \mathrm{RCONDE}(I)$

An approximate error bound for the angle between the i-th computed eigenvector `VL(i)` or `VR(i)` is given by

$$
\mathrm{EPS} \, \operatorname{norm}(\mathrm{ABNRM}, \mathrm{BBNRM}) / \mathrm{DIF}(i)
$$

For further explanation of the reciprocal condition numbers `RCONDE` and `RCONDV`, see section 4.11 of LAPACK User's Guide.

</section>

<!-- fortran-docs:end -->

<!-- Section for related `stdlib` packages. Do not manually edit this section, as it is automatically populated. -->

<section class="related">

</section>

<!-- /.related -->

<!-- Section for all links. Make sure to keep an empty line after the `section` element and another before the `/section` close. -->

<section class="links">

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

</section>

<!-- /.links -->
