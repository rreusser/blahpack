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

# zsprfs

> @license Apache-2.0.

<section class="usage">

## Usage

```javascript
var zsprfs = require( '@stdlib/lapack/base/zsprfs' );
```

#### zsprfs( re, im )

@license Apache-2.0.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Complex128Array = require( '@stdlib/array/complex128' );
var Int32Array = require( '@stdlib/array/int32' );
var zsprfs = require( '@stdlib/lapack/base/zsprfs' );

var AP = new Complex128Array( new Float64Array( [ 3.0, 1.0 ] ) );
var AFP = new Complex128Array( new Float64Array( [ 3.0, 1.0 ] ) );
var IPIV = new Int32Array( [ 0 ] );
var B = new Complex128Array( new Float64Array( [ 1.0, 1.0 ] ) );
var X = new Complex128Array( new Float64Array( [ 0.4, 0.2 ] ) );
var FERR = new Float64Array( 1 );
var BERR = new Float64Array( 1 );
var WORK = new Complex128Array( 2 );
var RWORK = new Float64Array( 1 );

zsprfs.ndarray( 'upper', 1, 1, AP, 1, 0, AFP, 1, 0, IPIV, 1, 0, B, 1, 1, 0, X, 1, 1, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 );
```

The function has the following parameters:

-   **re**: `re`.
-   **im**: `im`.

#### zsprfs.ndarray( uplo, N, nrhs, AP, strideAP, offsetAP, AFP, strideAFP, offsetAFP, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWORK, offsetWORK, RWORK, strideRWORK, offsetRWORK )

@license Apache-2.0, using alternative indexing semantics.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Complex128Array = require( '@stdlib/array/complex128' );
var Int32Array = require( '@stdlib/array/int32' );
var zsprfs = require( '@stdlib/lapack/base/zsprfs' );

var AP = new Complex128Array( new Float64Array( [ 3.0, 1.0 ] ) );
var AFP = new Complex128Array( new Float64Array( [ 3.0, 1.0 ] ) );
var IPIV = new Int32Array( [ 0 ] );
var B = new Complex128Array( new Float64Array( [ 1.0, 1.0 ] ) );
var X = new Complex128Array( new Float64Array( [ 0.4, 0.2 ] ) );
var FERR = new Float64Array( 1 );
var BERR = new Float64Array( 1 );
var WORK = new Complex128Array( 2 );
var RWORK = new Float64Array( 1 );

zsprfs.ndarray( 'upper', 1, 1, AP, 1, 0, AFP, 1, 0, IPIV, 1, 0, B, 1, 1, 0, X, 1, 1, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 );
```

The function has the following additional parameters:

-   **uplo**: specifies whether the upper or lower triangular part is referenced.
-   **N**: number of columns.
-   **nrhs**: number of right-hand sides.
-   **AP**: input array `AP`.
-   **strideAP**: stride length for `AP`.
-   **offsetAP**: starting index for `AP`.
-   **AFP**: input array `AFP`.
-   **strideAFP**: stride length for `AFP`.
-   **offsetAFP**: starting index for `AFP`.
-   **IPIV**: input array `IPIV`.
-   **strideIPIV**: stride length for `IPIV`.
-   **offsetIPIV**: starting index for `IPIV`.
-   **B**: input array `B`.
-   **strideB1**: stride of dimension 1 of `B`.
-   **strideB2**: stride of dimension 2 of `B`.
-   **offsetB**: starting index for `B`.
-   **X**: input array `X`.
-   **strideX1**: stride of dimension 1 of `X`.
-   **strideX2**: stride of dimension 2 of `X`.
-   **offsetX**: starting index for `X`.
-   **FERR**: input array `FERR`.
-   **strideFERR**: stride length for `FERR`.
-   **offsetFERR**: starting index for `FERR`.
-   **BERR**: input array `BERR`.
-   **strideBERR**: stride length for `BERR`.
-   **offsetBERR**: starting index for `BERR`.
-   **WORK**: input array `WORK`.
-   **strideWORK**: stride length for `WORK`.
-   **offsetWORK**: starting index for `WORK`.
-   **RWORK**: input array `RWORK`.
-   **strideRWORK**: stride length for `RWORK`.
-   **offsetRWORK**: starting index for `RWORK`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `zsprfs()` corresponds to the [LAPACK][lapack] level routine [`zsprfs`][lapack-zsprfs].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Complex128Array = require( '@stdlib/array/complex128' );
var Int32Array = require( '@stdlib/array/int32' );
var zsprfs = require( '@stdlib/lapack/base/zsprfs' );

var AP = new Complex128Array( new Float64Array( [ 3.0, 1.0 ] ) );
var AFP = new Complex128Array( new Float64Array( [ 3.0, 1.0 ] ) );
var IPIV = new Int32Array( [ 0 ] );
var B = new Complex128Array( new Float64Array( [ 1.0, 1.0 ] ) );
var X = new Complex128Array( new Float64Array( [ 0.4, 0.2 ] ) );
var FERR = new Float64Array( 1 );
var BERR = new Float64Array( 1 );
var WORK = new Complex128Array( 2 );
var RWORK = new Float64Array( 1 );

zsprfs.ndarray( 'upper', 1, 1, AP, 1, 0, AFP, 1, 0, IPIV, 1, 0, B, 1, 1, 0, X, 1, 1, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 );
```

</section>

<!-- /.examples -->

<!-- fortran-docs:start (generated by bin/fortran-docs.mjs from data/lapack-3.12.0/SRC/zsprfs.f; do not edit) -->

<section class="fortran-docs">

## Reference documentation

From the reference LAPACK 3.12.0 source of `ZSPRFS`, converted to Markdown with KaTeX math. Indices are the 1-based Fortran indices of the source.

### Purpose

ZSPRFS improves the computed solution to a system of linear equations when the coefficient matrix is symmetric indefinite and packed, and provides error bounds and backward error estimates for the solution.

### Arguments

#### UPLO `[in]`

_CHARACTER\*1_

-   `= 'U'`: Upper triangle of A is stored;
-   `= 'L'`: Lower triangle of A is stored.

#### N `[in]`

_INTEGER_

The order of the matrix A. $N \ge 0$.

#### NRHS `[in]`

_INTEGER_

The number of right hand sides, i.e., the number of columns of the matrices B and X. $\mathrm{NRHS} \ge 0$.

#### AP `[in]`

_COMPLEX\*16 array, dimension (N\*(N+1)/2)_

The upper or lower triangle of the symmetric matrix A, packed columnwise in a linear array. The j-th column of A is stored in the array `AP` as follows: if `UPLO = 'U'`, `AP(i + (j-1)*j/2) = A(i,j)` for $1 \le i \le j$; if `UPLO = 'L'`, `AP(i + (j-1)*(2*n-j)/2) = A(i,j)` for $j \le i \le n$.

#### AFP `[in]`

_COMPLEX\*16 array, dimension (N\*(N+1)/2)_

The factored form of the matrix A. `AFP` contains the block diagonal matrix D and the multipliers used to obtain the factor U or L from the factorization $A = U \, D \, U^T$ or $A = L \, D \, L^T$ as computed by ZSPTRF, stored as a packed triangular matrix.

#### IPIV `[in]`

_INTEGER array, dimension (N)_

Details of the interchanges and the block structure of D as determined by ZSPTRF.

#### B `[in]`

_COMPLEX\*16 array, dimension (LDB,NRHS)_

The right hand side matrix B.

#### LDB `[in]`

_INTEGER_

The leading dimension of the array B. $\mathrm{LDB} \ge \max (1,N)$.

#### X `[in,out]`

_COMPLEX\*16 array, dimension (LDX,NRHS)_

On entry, the solution matrix X, as computed by ZSPTRS. On exit, the improved solution matrix X.

#### LDX `[in]`

_INTEGER_

The leading dimension of the array X. $\mathrm{LDX} \ge \max (1,N)$.

#### FERR `[out]`

_DOUBLE PRECISION array, dimension (NRHS)_

The estimated forward error bound for each solution vector `X(j)` (the j-th column of the solution matrix X). If XTRUE is the true solution corresponding to `X(j)`, `FERR(j)` is an estimated upper bound for the magnitude of the largest element in (`X(j)` - XTRUE) divided by the magnitude of the largest element in `X(j)`. The estimate is as reliable as the estimate for RCOND, and is almost always a slight overestimate of the true error.

#### BERR `[out]`

_DOUBLE PRECISION array, dimension (NRHS)_

The componentwise relative backward error of each solution vector `X(j)` (i.e., the smallest relative change in any element of A or B that makes `X(j)` an exact solution).

#### WORK `[out]`

_COMPLEX\*16 array, dimension (2\*N)_

#### RWORK `[out]`

_DOUBLE PRECISION array, dimension (N)_

#### INFO `[out]`

_INTEGER_

-   `= 0`: successful exit
-   `< 0`: if `INFO = -i`, the i-th argument had an illegal value

</section>

<!-- fortran-docs:end -->

<!-- Section for related `stdlib` packages. Do not manually edit this section, as it is automatically populated. -->

<section class="related">

</section>

<!-- /.related -->

<!-- Section for all links. Make sure to keep an empty line after the `section` element and another before the `/section` close. -->

<section class="links">

[lapack]: https://www.netlib.org/lapack/explore-html/

[lapack-zsprfs]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__zsprfs.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->