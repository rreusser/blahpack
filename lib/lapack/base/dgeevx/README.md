<!--

@license Apache-2.0

Copyright (c) 2026 The Stdlib Authors.

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

# dgeevx

> Computes eigenvalues and, optionally, the left and/or right eigenvectors of a real nonsymmetric matrix, along with a balancing transformation and reciprocal condition numbers.

<section class="usage">

## Usage

```javascript
var dgeevx = require( '@stdlib/lapack/base/dgeevx' );
```

#### dgeevx( balanc, jobvl, jobvr, sense, N, A, LDA, WR, strideWR, WI, strideWI, VL, LDVL, VR, LDVR, SCALE, RCONDE, RCONDV )

Computes eigenvalues and, optionally, the left and/or right eigenvectors of a real `N`-by-`N` nonsymmetric matrix `A`.

```javascript
var Float64Array = require( '@stdlib/array/float64' );

var A = new Float64Array( [ 1, 0, 0, 0, 2, 0, 0, 0, 3 ] );
var WR = new Float64Array( 3 );
var WI = new Float64Array( 3 );
var VL = new Float64Array( 9 );
var VR = new Float64Array( 9 );
var SCALE = new Float64Array( 3 );
var RCONDE = new Float64Array( 3 );
var RCONDV = new Float64Array( 3 );

var out = dgeevx( 'both', 'compute-vectors', 'compute-vectors', 'none', 3, A, 3, WR, 1, WI, 1, VL, 3, VR, 3, SCALE, RCONDE, RCONDV );
// out => { info: 0, ilo: ..., ihi: ..., abnrm: ... }
```

The function has the following parameters:

-   **balanc**: balancing option (`'none'`, `'permute'`, `'scale'`, or `'both'`).
-   **jobvl**: left eigenvectors option (`'no-vectors'` or `'compute-vectors'`).
-   **jobvr**: right eigenvectors option (`'no-vectors'` or `'compute-vectors'`).
-   **sense**: condition-number option (`'none'`, `'eigenvalues'`, `'right-vectors'`, or `'both'`).
-   **N**: order of the matrix `A`.
-   **A**: input matrix (overwritten on exit).
-   **LDA**: leading dimension of `A`.
-   **WR**: output array for real parts of the computed eigenvalues.
-   **strideWR**: stride length for `WR`.
-   **WI**: output array for imaginary parts of the computed eigenvalues.
-   **strideWI**: stride length for `WI`.
-   **VL**: output array for left eigenvectors.
-   **LDVL**: leading dimension of `VL`.
-   **VR**: output array for right eigenvectors.
-   **LDVR**: leading dimension of `VR`.
-   **SCALE**: output array containing balancing and scaling details.
-   **RCONDE**: output array of reciprocal condition numbers for eigenvalues (only written when `sense` is not `'none'`).
-   **RCONDV**: output array of reciprocal condition numbers for right eigenvectors (only written when `sense` is not `'none'`).

Returns an object `{ info, ilo, ihi, abnrm }` where `info` is 0 on success and greater than 0 if the QR algorithm failed to converge. `ilo`/`ihi` describe the balanced submatrix, and `abnrm` is the one-norm of the balanced matrix.

#### dgeevx.ndarray( balanc, jobvl, jobvr, sense, N, A, strideA1, strideA2, offsetA, WR, strideWR, offsetWR, WI, strideWI, offsetWI, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR, SCALE, strideSCALE, offsetSCALE, RCONDE, strideRCONDE, offsetRCONDE, RCONDV, strideRCONDV, offsetRCONDV )

Computes eigenvalues and eigenvectors using alternative indexing semantics for accessing arrays.

```javascript
var Float64Array = require( '@stdlib/array/float64' );

var A = new Float64Array( [ 1, 0, 0, 0, 2, 0, 0, 0, 3 ] );
var WR = new Float64Array( 3 );
var WI = new Float64Array( 3 );
var VL = new Float64Array( 9 );
var VR = new Float64Array( 9 );
var SCALE = new Float64Array( 3 );
var RCONDE = new Float64Array( 3 );
var RCONDV = new Float64Array( 3 );

var out = dgeevx.ndarray( 'both', 'compute-vectors', 'compute-vectors', 'none', 3, A, 1, 3, 0, WR, 1, 0, WI, 1, 0, VL, 1, 3, 0, VR, 1, 3, 0, SCALE, 1, 0, RCONDE, 1, 0, RCONDV, 1, 0 );
// out => { info: 0, ilo: ..., ihi: ..., abnrm: ... }
```

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   When `balanc` is `'none'`, no balancing is performed and `SCALE` entries are set to 1.
-   Currently, only `sense = 'none'` is supported. Other `sense` values require the LAPACK routine `dtrsna`, which has not yet been translated to JavaScript.
-   Complex eigenvalues appear as consecutive conjugate pairs; the eigenvalue with positive imaginary part is stored first.

</section>

<!-- /.notes -->

<section class="examples">

## Examples

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var dgeevx = require( '@stdlib/lapack/base/dgeevx' );

var N = 3;
var A = new Float64Array( [ 1, 0, 0, 0, 2, 0, 0, 0, 3 ] );
var WR = new Float64Array( N );
var WI = new Float64Array( N );
var VL = new Float64Array( N * N );
var VR = new Float64Array( N * N );
var SCALE = new Float64Array( N );
var RCONDE = new Float64Array( N );
var RCONDV = new Float64Array( N );

var out = dgeevx( 'both', 'compute-vectors', 'compute-vectors', 'none', N, A, N, WR, 1, WI, 1, VL, N, VR, N, SCALE, RCONDE, RCONDV );
console.log( out );
```

</section>

<!-- /.examples -->

<!-- fortran-docs:start (generated by bin/fortran-docs.mjs from data/lapack-3.12.0/SRC/dgeevx.f; do not edit) -->

<section class="fortran-docs">

## Reference documentation

From the reference LAPACK 3.12.0 source of `DGEEVX`, converted to Markdown with KaTeX math. Indices are the 1-based Fortran indices of the source.

> Computes the eigenvalues and, optionally, the left and/or right eigenvectors for GE matrices

### Purpose

DGEEVX computes for an N-by-N real nonsymmetric matrix A, the eigenvalues and, optionally, the left and/or right eigenvectors.

Optionally also, it computes a balancing transformation to improve the conditioning of the eigenvalues and eigenvectors (`ILO`, `IHI`, `SCALE`, and `ABNRM`), reciprocal condition numbers for the eigenvalues (`RCONDE`), and reciprocal condition numbers for the right eigenvectors (`RCONDV`).

The right eigenvector v(j) of A satisfies

$$
A \, v(j) = \lambda (j) \, v(j)
$$

where lambda(j) is its eigenvalue. The left eigenvector u(j) of A satisfies

$$
u(j)^H \, A = \lambda (j) \, u(j)^H
$$

where $u(j)^H$ denotes the conjugate-transpose of u(j).

The computed eigenvectors are normalized to have Euclidean norm equal to 1 and largest component real.

Balancing a matrix means permuting the rows and columns to make it more nearly upper triangular, and applying a diagonal similarity transformation $D \, A \, D^{-1}$, where D is a diagonal matrix, to make its rows and columns closer in norm and the condition numbers of its eigenvalues and eigenvectors smaller. The computed reciprocal condition numbers correspond to the balanced matrix. Permuting rows and columns will not change the condition numbers (in exact arithmetic) but diagonal scaling will. For further explanation of balancing, see section 4.10.2 of the LAPACK Users' Guide.

### Arguments

#### BALANC `[in]`

_CHARACTER\*1_

Indicates how the input matrix should be diagonally scaled and/or permuted to improve the conditioning of its eigenvalues.

-   `= 'N'`: Do not diagonally scale or permute;
-   `= 'P'`: Perform permutations to make the matrix more nearly upper triangular. Do not diagonally scale;
-   `= 'S'`: Diagonally scale the matrix, i.e. replace A by $D \, A \, D^{-1}$, where D is a diagonal matrix chosen to make the rows and columns of A more equal in norm. Do not permute;
-   `= 'B'`: Both diagonally scale and permute A.

Computed reciprocal condition numbers will be for the matrix after balancing and/or permuting. Permuting does not change condition numbers (in exact arithmetic), but balancing does.

#### JOBVL `[in]`

_CHARACTER\*1_

-   `= 'N'`: left eigenvectors of A are not computed;
-   `= 'V'`: left eigenvectors of A are computed. If `SENSE = 'E'` or 'B', `JOBVL` must = 'V'.

#### JOBVR `[in]`

_CHARACTER\*1_

-   `= 'N'`: right eigenvectors of A are not computed;
-   `= 'V'`: right eigenvectors of A are computed. If `SENSE = 'E'` or 'B', `JOBVR` must = 'V'.

#### SENSE `[in]`

_CHARACTER\*1_

Determines which reciprocal condition numbers are computed.

-   `= 'N'`: None are computed;
-   `= 'E'`: Computed for eigenvalues only;
-   `= 'V'`: Computed for right eigenvectors only;
-   `= 'B'`: Computed for eigenvalues and right eigenvectors.

If `SENSE = 'E'` or 'B', both left and right eigenvectors must also be computed (`JOBVL = 'V'` and `JOBVR = 'V'`).

#### N `[in]`

_INTEGER_

The order of the matrix A. $N \ge 0$.

#### A `[in,out]`

_DOUBLE PRECISION array, dimension (LDA,N)_

On entry, the N-by-N matrix A. On exit, A has been overwritten. If `JOBVL = 'V'` or `JOBVR = 'V'`, A contains the real Schur form of the balanced version of the input matrix A.

#### LDA `[in]`

_INTEGER_

The leading dimension of the array A. $\mathrm{LDA} \ge \max (1,N)$.

#### WR `[out]`

_DOUBLE PRECISION array, dimension (N)_

#### WI `[out]`

_DOUBLE PRECISION array, dimension (N)_

`WR` and `WI` contain the real and imaginary parts, respectively, of the computed eigenvalues. Complex conjugate pairs of eigenvalues will appear consecutively with the eigenvalue having the positive imaginary part first.

#### VL `[out]`

_DOUBLE PRECISION array, dimension (LDVL,N)_

If `JOBVL = 'V'`, the left eigenvectors u(j) are stored one after another in the columns of `VL`, in the same order as their eigenvalues. If `JOBVL = 'N'`, `VL` is not referenced. If the j-th eigenvalue is real, then $u(j) = \mathrm{VL}(:,j)$, the j-th column of `VL`. If the j-th and (j+1)-st eigenvalues form a complex conjugate pair, then $u(j) = \mathrm{VL}(:,j) + i \, \mathrm{VL}(:,j+1)$ and $u(j+1) = \mathrm{VL}(:,j) - i \, \mathrm{VL}(:,j+1)$.

#### LDVL `[in]`

_INTEGER_

The leading dimension of the array `VL`. $\mathrm{LDVL} \ge 1$; if `JOBVL = 'V'`, $\mathrm{LDVL} \ge N$.

#### VR `[out]`

_DOUBLE PRECISION array, dimension (LDVR,N)_

If `JOBVR = 'V'`, the right eigenvectors v(j) are stored one after another in the columns of `VR`, in the same order as their eigenvalues. If `JOBVR = 'N'`, `VR` is not referenced. If the j-th eigenvalue is real, then $v(j) = \mathrm{VR}(:,j)$, the j-th column of `VR`. If the j-th and (j+1)-st eigenvalues form a complex conjugate pair, then $v(j) = \mathrm{VR}(:,j) + i \, \mathrm{VR}(:,j+1)$ and $v(j+1) = \mathrm{VR}(:,j) - i \, \mathrm{VR}(:,j+1)$.

#### LDVR `[in]`

_INTEGER_

The leading dimension of the array `VR`. $\mathrm{LDVR} \ge 1$, and if `JOBVR = 'V'`, $\mathrm{LDVR} \ge N$.

#### ILO `[out]`

_INTEGER_

#### IHI `[out]`

_INTEGER_

`ILO` and `IHI` are integer values determined when A was balanced. The balanced $A(i,j) = 0$ if $I > J$ and $J = 1$,...,`ILO`-1 or $I = \mathrm{IHI}+1$,...,N.

#### SCALE `[out]`

_DOUBLE PRECISION array, dimension (N)_

Details of the permutations and scaling factors applied when balancing A. If P(j) is the index of the row and column interchanged with row and column j, and D(j) is the scaling factor applied to row and column j, then

```text
SCALE(J) = P(J),    for J = 1,...,ILO-1
         = D(J),    for J = ILO,...,IHI
         = P(J)     for J = IHI+1,...,N.
```

The order in which the interchanges are made is N to `IHI`+1, then 1 to `ILO`-1.

#### ABNRM `[out]`

_DOUBLE PRECISION_

The one-norm of the balanced matrix (the maximum of the sum of absolute values of elements of any column).

#### RCONDE `[out]`

_DOUBLE PRECISION array, dimension (N)_

`RCONDE(j)` is the reciprocal condition number of the j-th eigenvalue.

#### RCONDV `[out]`

_DOUBLE PRECISION array, dimension (N)_

`RCONDV(j)` is the reciprocal condition number of the j-th right eigenvector.

#### WORK `[out]`

_DOUBLE PRECISION array, dimension (MAX(1,LWORK))_

On exit, if `INFO = 0`, `WORK(1)` returns the optimal `LWORK`.

#### LWORK `[in]`

_INTEGER_

The dimension of the array `WORK`. If `SENSE = 'N'` or 'E', $\mathrm{LWORK} \ge \max (1,2 \, N)$, and if `JOBVL = 'V'` or `JOBVR = 'V'`, $\mathrm{LWORK} \ge 3 \, N$. If `SENSE = 'V'` or 'B', $\mathrm{LWORK} \ge N \, (N+6)$. For good performance, `LWORK` must generally be larger.

If `LWORK = -1`, then a workspace query is assumed; the routine only calculates the optimal size of the `WORK` array, returns this value as the first entry of the `WORK` array, and no error message related to `LWORK` is issued by XERBLA.

#### IWORK `[out]`

_INTEGER array, dimension (2\*N-2)_

If `SENSE = 'N'` or 'E', not referenced.

#### INFO `[out]`

_INTEGER_

-   `= 0`: successful exit
-   `< 0`: if `INFO = -i`, the i-th argument had an illegal value.
-   `> 0`: if `INFO = i`, the QR algorithm failed to compute all the eigenvalues, and no eigenvectors or condition numbers have been computed; elements 1:`ILO`-1 and i+1:N of `WR` and `WI` contain eigenvalues which have converged.

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
