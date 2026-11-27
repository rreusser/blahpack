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

# dspsvx

> @license Apache-2.0.

<section class="usage">

## Usage

```javascript
var dspsvx = require( '@stdlib/lapack/base/dspsvx' );
```

#### dspsvx( fact, uplo, N, nrhs, AP, AFP, IPIV, strideIPIV, B, LDB, X, LDX, rcond, FERR, strideFERR, BERR, strideBERR, WORK, strideWORK, IWORK, strideIWORK )

@license Apache-2.0.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Int32Array = require( '@stdlib/array/int32' );
var dspsvx = require( '@stdlib/lapack/base/dspsvx' );

var AP = new Float64Array( [ 4.0, 2.0, 1.0, 5.0, 3.0, 6.0 ] );
var AFP = new Float64Array( 6 );
var IPIV = new Int32Array( 3 );
var B = new Float64Array( [ 7.0, 10.0, 10.0 ] );
var X = new Float64Array( 3 );
var rcond = new Float64Array( 1 );
var FERR = new Float64Array( 1 );
var BERR = new Float64Array( 1 );
var WORK = new Float64Array( 9 );
var IWORK = new Int32Array( 3 );

dspsvx.ndarray( 'not-factored', 'lower', 3, 1, AP, 1, 0, AFP, 1, 0, IPIV, 1, 0, B, 1, 3, 0, X, 1, 3, 0, rcond, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, IWORK, 1, 0 );
```

The function has the following parameters:

-   **fact**: `fact`.
-   **uplo**: specifies whether the upper or lower triangular part is referenced.
-   **N**: number of columns.
-   **nrhs**: number of right-hand sides.
-   **AP**: input array `AP`.
-   **AFP**: input array `AFP`.
-   **IPIV**: input array `IPIV`.
-   **strideIPIV**: stride length for `IPIV`.
-   **B**: input array `B`.
-   **LDB**: leading dimension of `B`.
-   **X**: input array `X`.
-   **LDX**: leading dimension of `X`.
-   **rcond**: `rcond`.
-   **FERR**: input array `FERR`.
-   **strideFERR**: stride length for `FERR`.
-   **BERR**: input array `BERR`.
-   **strideBERR**: stride length for `BERR`.
-   **WORK**: input array `WORK`.
-   **strideWORK**: stride length for `WORK`.
-   **IWORK**: input array `IWORK`.
-   **strideIWORK**: stride length for `IWORK`.

#### dspsvx.ndarray( fact, uplo, N, nrhs, AP, strideAP, offsetAP, AFP, strideAFP, offsetAFP, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, rcond, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWORK, offsetWORK, IWORK, strideIWORK, offsetIWORK )

@license Apache-2.0, using alternative indexing semantics.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Int32Array = require( '@stdlib/array/int32' );
var dspsvx = require( '@stdlib/lapack/base/dspsvx' );

var AP = new Float64Array( [ 4.0, 2.0, 1.0, 5.0, 3.0, 6.0 ] );
var AFP = new Float64Array( 6 );
var IPIV = new Int32Array( 3 );
var B = new Float64Array( [ 7.0, 10.0, 10.0 ] );
var X = new Float64Array( 3 );
var rcond = new Float64Array( 1 );
var FERR = new Float64Array( 1 );
var BERR = new Float64Array( 1 );
var WORK = new Float64Array( 9 );
var IWORK = new Int32Array( 3 );

dspsvx.ndarray( 'not-factored', 'lower', 3, 1, AP, 1, 0, AFP, 1, 0, IPIV, 1, 0, B, 1, 3, 0, X, 1, 3, 0, rcond, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, IWORK, 1, 0 );
```

The function has the following additional parameters:

-   **strideAP**: stride length for `AP`.
-   **offsetAP**: starting index for `AP`.
-   **strideAFP**: stride length for `AFP`.
-   **offsetAFP**: starting index for `AFP`.
-   **offsetIPIV**: starting index for `IPIV`.
-   **strideB1**: stride of dimension 1 of `B`.
-   **strideB2**: stride of dimension 2 of `B`.
-   **offsetB**: starting index for `B`.
-   **strideX1**: stride of dimension 1 of `X`.
-   **strideX2**: stride of dimension 2 of `X`.
-   **offsetX**: starting index for `X`.
-   **offsetFERR**: starting index for `FERR`.
-   **offsetBERR**: starting index for `BERR`.
-   **offsetWORK**: starting index for `WORK`.
-   **offsetIWORK**: starting index for `IWORK`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `dspsvx()` corresponds to the [LAPACK][lapack] level routine [`dspsvx`][lapack-dspsvx].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Int32Array = require( '@stdlib/array/int32' );
var dspsvx = require( '@stdlib/lapack/base/dspsvx' );

var AP = new Float64Array( [ 4.0, 2.0, 1.0, 5.0, 3.0, 6.0 ] );
var AFP = new Float64Array( 6 );
var IPIV = new Int32Array( 3 );
var B = new Float64Array( [ 7.0, 10.0, 10.0 ] );
var X = new Float64Array( 3 );
var rcond = new Float64Array( 1 );
var FERR = new Float64Array( 1 );
var BERR = new Float64Array( 1 );
var WORK = new Float64Array( 9 );
var IWORK = new Int32Array( 3 );

dspsvx.ndarray( 'not-factored', 'lower', 3, 1, AP, 1, 0, AFP, 1, 0, IPIV, 1, 0, B, 1, 3, 0, X, 1, 3, 0, rcond, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, IWORK, 1, 0 );
```

</section>

<!-- /.examples -->

<!-- fortran-docs:start (generated by bin/fortran-docs.mjs from data/lapack-3.12.0/SRC/dspsvx.f; do not edit) -->

<section class="fortran-docs">

## Reference documentation

From the reference LAPACK 3.12.0 source of `DSPSVX`, converted to Markdown with KaTeX math. Indices are the 1-based Fortran indices of the source.

> Computes the solution to system of linear equations $A \, X = B$ for OTHER matrices

### Purpose

DSPSVX uses the diagonal pivoting factorization $A = U \, D \, U^T$ or $A = L \, D \, L^T$ to compute the solution to a real system of linear equations $A \, X = B$, where A is an N-by-N symmetric matrix stored in packed format and X and B are N-by-`NRHS` matrices.

Error bounds on the solution and a condition estimate are also provided.

### Arguments

#### FACT `[in]`

_CHARACTER\*1_

Specifies whether or not the factored form of A has been supplied on entry.

-   `= 'F'`: On entry, `AFP` and `IPIV` contain the factored form of A.  `AP`, `AFP` and `IPIV` will not be modified.
-   `= 'N'`: The matrix A will be copied to `AFP` and factored.

#### UPLO `[in]`

_CHARACTER\*1_

-   `= 'U'`: Upper triangle of A is stored;
-   `= 'L'`: Lower triangle of A is stored.

#### N `[in]`

_INTEGER_

The number of linear equations, i.e., the order of the matrix A. $N \ge 0$.

#### NRHS `[in]`

_INTEGER_

The number of right hand sides, i.e., the number of columns of the matrices B and X. $\mathrm{NRHS} \ge 0$.

#### AP `[in]`

_DOUBLE PRECISION array, dimension (N\*(N+1)/2)_

The upper or lower triangle of the symmetric matrix A, packed columnwise in a linear array. The j-th column of A is stored in the array `AP` as follows: if `UPLO = 'U'`, `AP(i + (j-1)*j/2) = A(i,j)` for $1 \le i \le j$; if `UPLO = 'L'`, `AP(i + (j-1)*(2*n-j)/2) = A(i,j)` for $j \le i \le n$. See below for further details.

#### AFP `[in,out]`

_DOUBLE PRECISION array, dimension (N\*(N+1)/2)_

If `FACT = 'F'`, then `AFP` is an input argument and on entry contains the block diagonal matrix D and the multipliers used to obtain the factor U or L from the factorization $A = U \, D \, U^T$ or $A = L \, D \, L^T$ as computed by DSPTRF, stored as a packed triangular matrix in the same storage format as A.

If `FACT = 'N'`, then `AFP` is an output argument and on exit contains the block diagonal matrix D and the multipliers used to obtain the factor U or L from the factorization $A = U \, D \, U^T$ or $A = L \, D \, L^T$ as computed by DSPTRF, stored as a packed triangular matrix in the same storage format as A.

#### IPIV `[in,out]`

_INTEGER array, dimension (N)_

If `FACT = 'F'`, then `IPIV` is an input argument and on entry contains details of the interchanges and the block structure of D, as determined by DSPTRF. If $\mathrm{IPIV}(k) > 0$, then rows and columns k and `IPIV(k)` were interchanged and D(k,k) is a 1-by-1 diagonal block. If `UPLO = 'U'` and $\mathrm{IPIV}(k) = \mathrm{IPIV}(k-1) < 0$, then rows and columns k-1 and -`IPIV(k)` were interchanged and D(k-1:k,k-1:k) is a 2-by-2 diagonal block. If `UPLO = 'L'` and $\mathrm{IPIV}(k) = \mathrm{IPIV}(k+1) < 0$, then rows and columns k+1 and -`IPIV(k)` were interchanged and D(k:k+1,k:k+1) is a 2-by-2 diagonal block.

If `FACT = 'N'`, then `IPIV` is an output argument and on exit contains details of the interchanges and the block structure of D, as determined by DSPTRF.

#### B `[in]`

_DOUBLE PRECISION array, dimension (LDB,NRHS)_

The N-by-`NRHS` right hand side matrix B.

#### LDB `[in]`

_INTEGER_

The leading dimension of the array B. $\mathrm{LDB} \ge \max (1,N)$.

#### X `[out]`

_DOUBLE PRECISION array, dimension (LDX,NRHS)_

If `INFO = 0` or $\mathrm{INFO} = N+1$, the N-by-`NRHS` solution matrix X.

#### LDX `[in]`

_INTEGER_

The leading dimension of the array X. $\mathrm{LDX} \ge \max (1,N)$.

#### RCOND `[out]`

_DOUBLE PRECISION_

The estimate of the reciprocal condition number of the matrix A. If `RCOND` is less than the machine precision (in particular, if `RCOND = 0`), the matrix is singular to working precision. This condition is indicated by a return code of $\mathrm{INFO} > 0$.

#### FERR `[out]`

_DOUBLE PRECISION array, dimension (NRHS)_

The estimated forward error bound for each solution vector `X(j)` (the j-th column of the solution matrix X). If XTRUE is the true solution corresponding to `X(j)`, `FERR(j)` is an estimated upper bound for the magnitude of the largest element in (`X(j)` - XTRUE) divided by the magnitude of the largest element in `X(j)`. The estimate is as reliable as the estimate for `RCOND`, and is almost always a slight overestimate of the true error.

#### BERR `[out]`

_DOUBLE PRECISION array, dimension (NRHS)_

The componentwise relative backward error of each solution vector `X(j)` (i.e., the smallest relative change in any element of A or B that makes `X(j)` an exact solution).

#### WORK `[out]`

_DOUBLE PRECISION array, dimension (3\*N)_

#### IWORK `[out]`

_INTEGER array, dimension (N)_

#### INFO `[out]`

_INTEGER_

-   `= 0`: successful exit
-   `< 0`: if `INFO = -i`, the i-th argument had an illegal value
-   `> 0`: if `INFO = i`, and i is \<= N:  D(i,i) is exactly zero.  The factorization has been completed but the factor D is exactly singular, so the solution and error bounds could not be computed. `RCOND = 0` is returned. = N+1: D is nonsingular, but `RCOND` is less than machine precision, meaning that the matrix is singular to working precision.  Nevertheless, the solution and error bounds are computed because there are a number of situations where the computed solution can be more accurate than the value of `RCOND` would suggest.

### Further Details

The packed storage scheme is illustrated by the following example when $N = 4$, `UPLO = 'U'`:

Two-dimensional storage of the symmetric matrix A:

a11 a12 a13 a14

a22 a23 a24 a33 a34 (aij = aji) a44

Packed storage of the upper triangle of A:

`AP` = \[ a11, a12, a22, a13, a23, a33, a14, a24, a34, a44 \]

</section>

<!-- fortran-docs:end -->

<!-- Section for related `stdlib` packages. Do not manually edit this section, as it is automatically populated. -->

<section class="related">

</section>

<!-- /.related -->

<!-- Section for all links. Make sure to keep an empty line after the `section` element and another before the `/section` close. -->

<section class="links">

[lapack]: https://www.netlib.org/lapack/explore-html/

[lapack-dspsvx]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__dspsvx.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->