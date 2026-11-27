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

# zggevx

> Computes the eigenvalues and, optionally, the left and/or right eigenvectors for general matrices.

<section class="usage">

## Usage

```javascript
var zggevx = require( '@stdlib/lapack/base/zggevx' );
```

#### zggevx( order, balanc, jobvl, jobvr, sense, N, A, LDA, B, LDB, ALPHA, strideALPHA, BETA, strideBETA, VL, LDVL, VR, LDVR, LSCALE, strideLSCALE, RSCALE, strideRSCALE, RCONDE, strideRCONDE, RCONDV, strideRCONDV )

Computes the generalized eigenvalues and, optionally, the left and/or right generalized eigenvectors of a complex matrix pair `(A, B)`, with optional balancing.

```javascript
var Complex128Array = require( '@stdlib/array/complex128' );
var Float64Array = require( '@stdlib/array/float64' );

var A = new Complex128Array( [ 2.0, 1.0, 1.0, -1.0, 1.0, 0.5, 3.0, 0.0 ] );
var B = new Complex128Array( [ 3.0, 0.0, 0.5, -0.5, 1.0, 0.5, 2.0, 1.0 ] );
var ALPHA = new Complex128Array( 2 );
var BETA = new Complex128Array( 2 );
var VL = new Complex128Array( 4 );
var VR = new Complex128Array( 4 );
var LSCALE = new Float64Array( 2 );
var RSCALE = new Float64Array( 2 );
var RCONDE = new Float64Array( 2 );
var RCONDV = new Float64Array( 2 );

var r = zggevx( 'column-major', 'none', 'compute-vectors', 'compute-vectors', 'none', 2, A, 2, B, 2, ALPHA, 1, BETA, 1, VL, 2, VR, 2, LSCALE, 1, RSCALE, 1, RCONDE, 1, RCONDV, 1 );
// returns { info, ilo, ihi, abnrm, bbnrm }
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **balanc**: balancing option (`'none'`, `'permute'`, `'scale'`, or `'both'`).
-   **jobvl**: left eigenvector option (`'no-vectors'` or `'compute-vectors'`).
-   **jobvr**: right eigenvector option (`'no-vectors'` or `'compute-vectors'`).
-   **sense**: condition number option (`'none'`, `'eigenvalues'`, `'right-vectors'`, or `'both'`). Only `'none'` is currently implemented; other values return `info = -4` (ztgsna not yet available).
-   **N**: order of matrices A and B.
-   **A**: input matrix A ([`Complex128Array`][@stdlib/array/complex128]).
-   **LDA**: leading dimension of `A`.
-   **B**: input matrix B ([`Complex128Array`][@stdlib/array/complex128]).
-   **LDB**: leading dimension of `B`.
-   **ALPHA**: output eigenvalue numerators ([`Complex128Array`][@stdlib/array/complex128]).
-   **strideALPHA**: stride length for `ALPHA`.
-   **BETA**: output eigenvalue denominators ([`Complex128Array`][@stdlib/array/complex128]).
-   **strideBETA**: stride length for `BETA`.
-   **VL**: left eigenvector matrix ([`Complex128Array`][@stdlib/array/complex128]).
-   **LDVL**: leading dimension of `VL`.
-   **VR**: right eigenvector matrix ([`Complex128Array`][@stdlib/array/complex128]).
-   **LDVR**: leading dimension of `VR`.
-   **LSCALE**: output: details of left permutations/scaling ([`Float64Array`][mdn-float64array]).
-   **strideLSCALE**: stride length for `LSCALE`.
-   **RSCALE**: output: details of right permutations/scaling ([`Float64Array`][mdn-float64array]).
-   **strideRSCALE**: stride length for `RSCALE`.
-   **RCONDE**: output: reciprocal condition numbers for eigenvalues ([`Float64Array`][mdn-float64array]); unused when `sense='none'`.
-   **strideRCONDE**: stride length for `RCONDE`.
-   **RCONDV**: output: reciprocal condition numbers for right eigenvectors ([`Float64Array`][mdn-float64array]); unused when `sense='none'`.
-   **strideRCONDV**: stride length for `RCONDV`.

The function returns an object `{ info, ilo, ihi, abnrm, bbnrm }` where `info` is the LAPACK status code (0 on success), `ilo`/`ihi` are the 1-based active block bounds produced by balancing, and `abnrm`/`bbnrm` are the 1-norms of the balanced A and B.

#### zggevx.ndarray( balanc, jobvl, jobvr, sense, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, ALPHA, strideALPHA, offsetALPHA, BETA, strideBETA, offsetBETA, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR, LSCALE, strideLSCALE, offsetLSCALE, RSCALE, strideRSCALE, offsetRSCALE, RCONDE, strideRCONDE, offsetRCONDE, RCONDV, strideRCONDV, offsetRCONDV )

Same as `zggevx`, but with `ndarray`-style stride/offset arguments.

```javascript
var Complex128Array = require( '@stdlib/array/complex128' );
var Float64Array = require( '@stdlib/array/float64' );

var A = new Complex128Array( [ 2.0, 1.0, 1.0, -1.0, 1.0, 0.5, 3.0, 0.0 ] );
var B = new Complex128Array( [ 3.0, 0.0, 0.5, -0.5, 1.0, 0.5, 2.0, 1.0 ] );
var ALPHA = new Complex128Array( 2 );
var BETA = new Complex128Array( 2 );
var VL = new Complex128Array( 4 );
var VR = new Complex128Array( 4 );
var LSCALE = new Float64Array( 2 );
var RSCALE = new Float64Array( 2 );
var RCONDE = new Float64Array( 2 );
var RCONDV = new Float64Array( 2 );

var r = zggevx.ndarray( 'none', 'compute-vectors', 'compute-vectors', 'none', 2, A, 1, 2, 0, B, 1, 2, 0, ALPHA, 1, 0, BETA, 1, 0, VL, 1, 2, 0, VR, 1, 2, 0, LSCALE, 1, 0, RSCALE, 1, 0, RCONDE, 1, 0, RCONDV, 1, 0 );
// returns { info, ilo, ihi, abnrm, bbnrm }
```

The `ndarray` method supports independent strides and offsets for all arrays, expressed in complex elements for `Complex128Array`s and in Float64 elements for `Float64Array`s.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   On exit, `A` is overwritten by the generalized Schur form and `B` by the corresponding upper-triangular matrix.
-   Strides and offsets for `A`, `B`, `ALPHA`, `BETA`, `VL`, `VR` are in complex elements.
-   The `sense` parameter is accepted but only the value `'none'` is currently implemented. Other values return `info = -4` because the supporting routine `ztgsna` is not yet available.

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var Complex128Array = require( '@stdlib/array/complex128' );
var Float64Array = require( '@stdlib/array/float64' );
var zggevx = require( '@stdlib/lapack/base/zggevx' );

var N = 2;

// Column-major A, B: diagonal pair so that eigenvalues are 4/2 = 2 and 6/3 = 2.
var A = new Complex128Array( [ 4.0, 0.0, 0.0, 0.0, 0.0, 0.0, 6.0, 0.0 ] );
var B = new Complex128Array( [ 2.0, 0.0, 0.0, 0.0, 0.0, 0.0, 3.0, 0.0 ] );
var ALPHA = new Complex128Array( N );
var BETA = new Complex128Array( N );
var VL = new Complex128Array( N * N );
var VR = new Complex128Array( N * N );
var LSCALE = new Float64Array( N );
var RSCALE = new Float64Array( N );
var RCONDE = new Float64Array( N );
var RCONDV = new Float64Array( N );

var r = zggevx( 'column-major', 'both', 'compute-vectors', 'compute-vectors', 'none', N, A, N, B, N, ALPHA, 1, BETA, 1, VL, N, VR, N, LSCALE, 1, RSCALE, 1, RCONDE, 1, RCONDV, 1 );
console.log( r );
```

</section>

<!-- /.examples -->

<!-- fortran-docs:start (generated by bin/fortran-docs.mjs from data/lapack-3.12.0/SRC/zggevx.f; do not edit) -->

<section class="fortran-docs">

## Reference documentation

From the reference LAPACK 3.12.0 source of `ZGGEVX`, converted to Markdown with KaTeX math. Indices are the 1-based Fortran indices of the source.

> Computes the eigenvalues and, optionally, the left and/or right eigenvectors for GE matrices

### Purpose

ZGGEVX computes for a pair of N-by-N complex nonsymmetric matrices (A,B) the generalized eigenvalues, and optionally, the left and/or right generalized eigenvectors.

Optionally, it also computes a balancing transformation to improve the conditioning of the eigenvalues and eigenvectors (`ILO`, `IHI`, `LSCALE`, `RSCALE`, `ABNRM`, and `BBNRM`), reciprocal condition numbers for the eigenvalues (`RCONDE`), and reciprocal condition numbers for the right eigenvectors (`RCONDV`).

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

Specifies the balance option to be performed:

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

_COMPLEX\*16 array, dimension (LDA, N)_

On entry, the matrix A in the pair (A,B). On exit, A has been overwritten. If `JOBVL='V'` or `JOBVR='V'` or both, then A contains the first part of the complex Schur form of the "balanced" versions of the input A and B.

#### LDA `[in]`

_INTEGER_

The leading dimension of A. $\mathrm{LDA} \ge \max (1,N)$.

#### B `[in,out]`

_COMPLEX\*16 array, dimension (LDB, N)_

On entry, the matrix B in the pair (A,B). On exit, B has been overwritten. If `JOBVL='V'` or `JOBVR='V'` or both, then B contains the second part of the complex Schur form of the "balanced" versions of the input A and B.

#### LDB `[in]`

_INTEGER_

The leading dimension of B. $\mathrm{LDB} \ge \max (1,N)$.

#### ALPHA `[out]`

_COMPLEX\*16 array, dimension (N)_

#### BETA `[out]`

_COMPLEX\*16 array, dimension (N)_

On exit, `ALPHA(j)`/`BETA(j)`, $j=1$,...,N, will be the generalized eigenvalues.

Note: the quotient `ALPHA(j)`/`BETA(j)` ) may easily over- or underflow, and `BETA(j)` may even be zero. Thus, the user should avoid naively computing the ratio `ALPHA`/`BETA`. However, `ALPHA` will be always less than and usually comparable with norm(A) in magnitude, and `BETA` always less than and usually comparable with norm(B).

#### VL `[out]`

_COMPLEX\*16 array, dimension (LDVL,N)_

If `JOBVL = 'V'`, the left generalized eigenvectors u(j) are stored one after another in the columns of `VL`, in the same order as their eigenvalues. Each eigenvector will be scaled so the largest component will have abs(real part) + abs(imag. part) = 1. Not referenced if `JOBVL = 'N'`.

#### LDVL `[in]`

_INTEGER_

The leading dimension of the matrix `VL`. $\mathrm{LDVL} \ge 1$, and if `JOBVL = 'V'`, $\mathrm{LDVL} \ge N$.

#### VR `[out]`

_COMPLEX\*16 array, dimension (LDVR,N)_

If `JOBVR = 'V'`, the right generalized eigenvectors v(j) are stored one after another in the columns of `VR`, in the same order as their eigenvalues. Each eigenvector will be scaled so the largest component will have abs(real part) + abs(imag. part) = 1. Not referenced if `JOBVR = 'N'`.

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

If `SENSE = 'E'` or 'B', the reciprocal condition numbers of the eigenvalues, stored in consecutive elements of the array. If `SENSE = 'N'` or 'V', `RCONDE` is not referenced.

#### RCONDV `[out]`

_DOUBLE PRECISION array, dimension (N)_

If `JOB = 'V'` or 'B', the estimated reciprocal condition numbers of the eigenvectors, stored in consecutive elements of the array. If the eigenvalues cannot be reordered to compute `RCONDV(j)`, `RCONDV(j)` is set to 0; this can only occur when the true value would be very small anyway. If `SENSE = 'N'` or 'E', `RCONDV` is not referenced.

#### WORK `[out]`

_COMPLEX\*16 array, dimension (MAX(1,LWORK))_

On exit, if `INFO = 0`, `WORK(1)` returns the optimal `LWORK`.

#### LWORK `[in]`

_INTEGER_

The dimension of the array `WORK`. $\mathrm{LWORK} \ge \max (1,2 \, N)$. If `SENSE = 'E'`, $\mathrm{LWORK} \ge \max (1,4 \, N)$. If `SENSE = 'V'` or 'B', $\mathrm{LWORK} \ge \max (1,2 \, N \, N+2 \, N)$.

If `LWORK = -1`, then a workspace query is assumed; the routine only calculates the optimal size of the `WORK` array, returns this value as the first entry of the `WORK` array, and no error message related to `LWORK` is issued by XERBLA.

#### RWORK `[out]`

_DOUBLE PRECISION array, dimension (lrwork)_

lrwork must be at least max(1,6\*N) if `BALANC = 'S'` or 'B', and at least max(1,2\*N) otherwise. Real workspace.

#### IWORK `[out]`

_INTEGER array, dimension (N+2)_

If `SENSE = 'E'`, `IWORK` is not referenced.

#### BWORK `[out]`

_LOGICAL array, dimension (N)_

If `SENSE = 'N'`, `BWORK` is not referenced.

#### INFO `[out]`

_INTEGER_

-   `= 0`: successful exit
-   `< 0`: if `INFO = -i`, the i-th argument had an illegal value.
-   `= 1,...,N`:  The QZ iteration failed.  No eigenvectors have been calculated, but `ALPHA(j)` and `BETA(j)` should be correct for $j=\mathrm{INFO}+1$,...,N.
-   `> N`: =N+1: other than QZ iteration failed in ZHGEQZ. =N+2: error return from ZTGEVC.

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

[@stdlib/array/complex128]: https://github.com/stdlib-js/stdlib
[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

</section>

<!-- /.links -->
