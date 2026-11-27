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

# dggev

> Computes generalized eigenvalues and, optionally, left and/or right generalized eigenvectors for a pair of N-by-N real nonsymmetric matrices (A,B).

<section class="usage">

## Usage

```javascript
var dggev = require( '@stdlib/lapack/base/dggev' );
```

#### dggev( order, jobvl, jobvr, N, A, LDA, B, LDB, ALPHAR, ALPHAI, BETA, VL, LDVL, VR, LDVR )

Computes generalized eigenvalues and, optionally, eigenvectors for a pair of real nonsymmetric matrices.

```javascript
var Float64Array = require( '@stdlib/array/float64' );

var A = new Float64Array( [ 1, 0, 0, 3 ] );
var B = new Float64Array( [ 1, 0, 0, 1 ] );
var ALPHAR = new Float64Array( 2 );
var ALPHAI = new Float64Array( 2 );
var BETA = new Float64Array( 2 );
var VL = new Float64Array( 1 );
var VR = new Float64Array( 1 );

var info = dggev( 'column-major', 'no-vectors', 'no-vectors', 2, A, 2, B, 2, ALPHAR, ALPHAI, BETA, VL, 1, VR, 1 );
// info => 0
// ALPHAR => [ 1.0, 3.0 ]
// BETA => [ 1.0, 1.0 ]
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **jobvl**: `'compute-vectors'` to compute left eigenvectors, `'no-vectors'` to not.
-   **jobvr**: `'compute-vectors'` to compute right eigenvectors, `'no-vectors'` to not.
-   **N**: order of matrices A and B.
-   **A**: input matrix A (N x N), overwritten on exit.
-   **LDA**: leading dimension of `A`.
-   **B**: input matrix B (N x N), overwritten on exit.
-   **LDB**: leading dimension of `B`.
-   **ALPHAR**: output array for real parts of alpha (length N).
-   **ALPHAI**: output array for imaginary parts of alpha (length N).
-   **BETA**: output array for beta values (length N).
-   **VL**: output matrix for left eigenvectors (N x N).
-   **LDVL**: leading dimension of `VL`.
-   **VR**: output matrix for right eigenvectors (N x N).
-   **LDVR**: leading dimension of `VR`.

#### dggev.ndarray( jobvl, jobvr, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, ALPHAR, strideALPHAR, offsetALPHAR, ALPHAI, strideALPHAI, offsetALPHAI, BETA, strideBETA, offsetBETA, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR )

Computes generalized eigenvalues and eigenvectors using alternative indexing semantics.

```javascript
var Float64Array = require( '@stdlib/array/float64' );

var A = new Float64Array( [ 1, 0, 0, 3 ] );
var B = new Float64Array( [ 1, 0, 0, 1 ] );
var ALPHAR = new Float64Array( 2 );
var ALPHAI = new Float64Array( 2 );
var BETA = new Float64Array( 2 );
var VL = new Float64Array( 1 );
var VR = new Float64Array( 1 );

var info = dggev.ndarray( 'no-vectors', 'no-vectors', 2, A, 1, 2, 0, B, 1, 2, 0, ALPHAR, 1, 0, ALPHAI, 1, 0, BETA, 1, 0, VL, 1, 1, 0, VR, 1, 1, 0 );
// info => 0
```

The function has the following additional parameters:

-   **jobvl**: `'compute-vectors'` or `'no-vectors'`.
-   **jobvr**: `'compute-vectors'` or `'no-vectors'`.
-   **N**: order of matrices A and B.
-   **A**: input matrix A.
-   **strideA1**: stride of dimension 1 of `A`.
-   **strideA2**: stride of dimension 2 of `A`.
-   **offsetA**: starting index for `A`.
-   **B**: input matrix B.
-   **strideB1**: stride of dimension 1 of `B`.
-   **strideB2**: stride of dimension 2 of `B`.
-   **offsetB**: starting index for `B`.
-   **ALPHAR**: output array for real parts of alpha.
-   **strideALPHAR**: stride length for `ALPHAR`.
-   **offsetALPHAR**: starting index for `ALPHAR`.
-   **ALPHAI**: output array for imaginary parts of alpha.
-   **strideALPHAI**: stride length for `ALPHAI`.
-   **offsetALPHAI**: starting index for `ALPHAI`.
-   **BETA**: output array for beta values.
-   **strideBETA**: stride length for `BETA`.
-   **offsetBETA**: starting index for `BETA`.
-   **VL**: output matrix for left eigenvectors.
-   **strideVL1**: stride of dimension 1 of `VL`.
-   **strideVL2**: stride of dimension 2 of `VL`.
-   **offsetVL**: starting index for `VL`.
-   **VR**: output matrix for right eigenvectors.
-   **strideVR1**: stride of dimension 1 of `VR`.
-   **strideVR2**: stride of dimension 2 of `VR`.
-   **offsetVR**: starting index for `VR`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   The generalized eigenvalues are returned as the pairs (ALPHAR(j)+i*ALPHAI(j), BETA(j)), j=1,...,N. The eigenvalue is ALPHAR(j)/BETA(j) + i*ALPHAI(j)/BETA(j) when BETA(j) is nonzero.
-   Workspace is allocated internally; there is no LWORK parameter.

</section>

<!-- /.notes -->

<section class="examples">

## Examples

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var dggev = require( '@stdlib/lapack/base/dggev' );

var N = 3;
var A = new Float64Array( [ 1, 4, 7, 2, 5, 8, 3, 6, 10 ] );
var B = new Float64Array( [ 1, 0, 0, 0, 2, 0, 0, 0, 3 ] );
var ALPHAR = new Float64Array( N );
var ALPHAI = new Float64Array( N );
var BETA = new Float64Array( N );
var VR = new Float64Array( N * N );

var info = dggev( 'column-major', 'no-vectors', 'compute-vectors', N, A, N, B, N, ALPHAR, ALPHAI, BETA, new Float64Array( 1 ), 1, VR, N );
// info => 0
```

</section>

<!-- /.examples -->

<!-- fortran-docs:start (generated by bin/fortran-docs.mjs from data/lapack-3.12.0/SRC/dggev.f; do not edit) -->

<section class="fortran-docs">

## Reference documentation

From the reference LAPACK 3.12.0 source of `DGGEV`, converted to Markdown with KaTeX math. Indices are the 1-based Fortran indices of the source.

> Computes the eigenvalues and, optionally, the left and/or right eigenvectors for GE matrices

### Purpose

DGGEV computes for a pair of N-by-N real nonsymmetric matrices (A,B) the generalized eigenvalues, and optionally, the left and/or right generalized eigenvectors.

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

#### JOBVL `[in]`

_CHARACTER\*1_

-   `= 'N'`: do not compute the left generalized eigenvectors;
-   `= 'V'`: compute the left generalized eigenvectors.

#### JOBVR `[in]`

_CHARACTER\*1_

-   `= 'N'`: do not compute the right generalized eigenvectors;
-   `= 'V'`: compute the right generalized eigenvectors.

#### N `[in]`

_INTEGER_

The order of the matrices A, B, `VL`, and `VR`. $N \ge 0$.

#### A `[in,out]`

_DOUBLE PRECISION array, dimension (LDA, N)_

On entry, the matrix A in the pair (A,B). On exit, A has been overwritten.

#### LDA `[in]`

_INTEGER_

The leading dimension of A. $\mathrm{LDA} \ge \max (1,N)$.

#### B `[in,out]`

_DOUBLE PRECISION array, dimension (LDB, N)_

On entry, the matrix B in the pair (A,B). On exit, B has been overwritten.

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

Note: the quotients `ALPHAR(j)`/`BETA(j)` and `ALPHAI(j)`/`BETA(j)` may easily over- or underflow, and `BETA(j)` may even be zero. Thus, the user should avoid naively computing the ratio $\alpha$/$\beta$. However, `ALPHAR` and `ALPHAI` will be always less than and usually comparable with norm(A) in magnitude, and `BETA` always less than and usually comparable with norm(B).

#### VL `[out]`

_DOUBLE PRECISION array, dimension (LDVL,N)_

If `JOBVL = 'V'`, the left eigenvectors u(j) are stored one after another in the columns of `VL`, in the same order as their eigenvalues. If the j-th eigenvalue is real, then $u(j) = \mathrm{VL}(:,j)$, the j-th column of `VL`. If the j-th and (j+1)-th eigenvalues form a complex conjugate pair, then $u(j) = \mathrm{VL}(:,j)+i \, \mathrm{VL}(:,j+1)$ and $u(j+1) = \mathrm{VL}(:,j)-i \, \mathrm{VL}(:,j+1)$. Each eigenvector is scaled so the largest component has abs(real part)+abs(imag. part)=1. Not referenced if `JOBVL = 'N'`.

#### LDVL `[in]`

_INTEGER_

The leading dimension of the matrix `VL`. $\mathrm{LDVL} \ge 1$, and if `JOBVL = 'V'`, $\mathrm{LDVL} \ge N$.

#### VR `[out]`

_DOUBLE PRECISION array, dimension (LDVR,N)_

If `JOBVR = 'V'`, the right eigenvectors v(j) are stored one after another in the columns of `VR`, in the same order as their eigenvalues. If the j-th eigenvalue is real, then $v(j) = \mathrm{VR}(:,j)$, the j-th column of `VR`. If the j-th and (j+1)-th eigenvalues form a complex conjugate pair, then $v(j) = \mathrm{VR}(:,j)+i \, \mathrm{VR}(:,j+1)$ and $v(j+1) = \mathrm{VR}(:,j)-i \, \mathrm{VR}(:,j+1)$. Each eigenvector is scaled so the largest component has abs(real part)+abs(imag. part)=1. Not referenced if `JOBVR = 'N'`.

#### LDVR `[in]`

_INTEGER_

The leading dimension of the matrix `VR`. $\mathrm{LDVR} \ge 1$, and if `JOBVR = 'V'`, $\mathrm{LDVR} \ge N$.

#### WORK `[out]`

_DOUBLE PRECISION array, dimension (MAX(1,LWORK))_

On exit, if `INFO = 0`, `WORK(1)` returns the optimal `LWORK`.

#### LWORK `[in]`

_INTEGER_

The dimension of the array `WORK`. $\mathrm{LWORK} \ge \max (1,8 \, N)$. For good performance, `LWORK` must generally be larger.

If `LWORK = -1`, then a workspace query is assumed; the routine only calculates the optimal size of the `WORK` array, returns this value as the first entry of the `WORK` array, and no error message related to `LWORK` is issued by XERBLA.

#### INFO `[out]`

_INTEGER_

-   `= 0`: successful exit
-   `< 0`: if `INFO = -i`, the i-th argument had an illegal value.
-   `= 1,...,N`:  The QZ iteration failed.  No eigenvectors have been calculated, but `ALPHAR(j)`, `ALPHAI(j)`, and `BETA(j)` should be correct for $j=\mathrm{INFO}+1$,...,N.
-   `> N`: =N+1: other than QZ iteration failed in DHGEQZ. =N+2: error return from DTGEVC.

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
