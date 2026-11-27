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

# dtbrfs

> Provides error bounds for the solution to a system with a real triangular band matrix.

<section class="usage">

## Usage

```javascript
var dtbrfs = require( '@stdlib/lapack/base/dtbrfs' );
```

#### dtbrfs( uplo, trans, diag, N, kd, nrhs, AB, LDAB, B, LDB, X, LDX, FERR, strideFERR, BERR, strideBERR, WORK, strideWORK, IWORK, strideIWORK )

Provides error bounds for the solution to a system with a real triangular band matrix.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Int32Array = require( '@stdlib/array/int32' );
var dtbrfs = require( '@stdlib/lapack/base/dtbrfs' );

var B = new Float64Array( [ 13.0, 31.0, 22.0, 12.0 ] );
var X = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
var FERR = new Float64Array( 1 );
var BERR = new Float64Array( 1 );
var WORK = new Float64Array( 12 );
var IWORK = new Int32Array( 4 );

dtbrfs.ndarray( 'upper', 'no-transpose', 'non-unit', 4, 2, 1, AB, 1, 3, 0, B, 1, 4, 0, X, 1, 4, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, IWORK, 1, 0 );
```

The function has the following parameters:

-   **uplo**: specifies whether the upper or lower triangular part is referenced.
-   **trans**: specifies whether the matrix should be transposed.
-   **diag**: specifies whether the matrix is unit triangular.
-   **N**: number of columns.
-   **kd**: `kd`.
-   **nrhs**: number of right-hand sides.
-   **AB**: input array `AB`.
-   **LDAB**: leading dimension of `AB`.
-   **B**: input array `B`.
-   **LDB**: leading dimension of `B`.
-   **X**: input array `X`.
-   **LDX**: leading dimension of `X`.
-   **FERR**: input array `FERR`.
-   **strideFERR**: stride length for `FERR`.
-   **BERR**: input array `BERR`.
-   **strideBERR**: stride length for `BERR`.
-   **WORK**: input array `WORK`.
-   **strideWORK**: stride length for `WORK`.
-   **IWORK**: input array `IWORK`.
-   **strideIWORK**: stride length for `IWORK`.

#### dtbrfs.ndarray( uplo, trans, diag, N, kd, nrhs, AB, strideAB1, strideAB2, offsetAB, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWORK, offsetWORK, IWORK, strideIWORK, offsetIWORK )

Provides error bounds for the solution to a system with a real triangular band matrix, using alternative indexing semantics.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Int32Array = require( '@stdlib/array/int32' );
var dtbrfs = require( '@stdlib/lapack/base/dtbrfs' );

var B = new Float64Array( [ 13.0, 31.0, 22.0, 12.0 ] );
var X = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
var FERR = new Float64Array( 1 );
var BERR = new Float64Array( 1 );
var WORK = new Float64Array( 12 );
var IWORK = new Int32Array( 4 );

dtbrfs.ndarray( 'upper', 'no-transpose', 'non-unit', 4, 2, 1, AB, 1, 3, 0, B, 1, 4, 0, X, 1, 4, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, IWORK, 1, 0 );
```

The function has the following additional parameters:

-   **strideAB1**: stride of dimension 1 of `AB`.
-   **strideAB2**: stride of dimension 2 of `AB`.
-   **offsetAB**: starting index for `AB`.
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

-   `dtbrfs()` corresponds to the [LAPACK][lapack] level routine [`dtbrfs`][lapack-dtbrfs].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Int32Array = require( '@stdlib/array/int32' );
var dtbrfs = require( '@stdlib/lapack/base/dtbrfs' );

var B = new Float64Array( [ 13.0, 31.0, 22.0, 12.0 ] );
var X = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
var FERR = new Float64Array( 1 );
var BERR = new Float64Array( 1 );
var WORK = new Float64Array( 12 );
var IWORK = new Int32Array( 4 );

dtbrfs.ndarray( 'upper', 'no-transpose', 'non-unit', 4, 2, 1, AB, 1, 3, 0, B, 1, 4, 0, X, 1, 4, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, IWORK, 1, 0 );
```

</section>

<!-- /.examples -->

<!-- fortran-docs:start (generated by bin/fortran-docs.mjs from data/lapack-3.12.0/SRC/dtbrfs.f; do not edit) -->

<section class="fortran-docs">

## Reference documentation

From the reference LAPACK 3.12.0 source of `DTBRFS`, converted to Markdown with KaTeX math. Indices are the 1-based Fortran indices of the source.

### Purpose

DTBRFS provides error bounds and backward error estimates for the solution to a system of linear equations with a triangular band coefficient matrix.

The solution matrix X must be computed by DTBTRS or some other means before entering this routine. DTBRFS does not do iterative refinement because doing so cannot improve the backward error.

### Arguments

#### UPLO `[in]`

_CHARACTER\*1_

-   `= 'U'`: A is upper triangular;
-   `= 'L'`: A is lower triangular.

#### TRANS `[in]`

_CHARACTER\*1_

Specifies the form of the system of equations:

-   `= 'N'`: $A \, X = B$  (No transpose)
-   `= 'T'`: $A^T \, X = B$  (Transpose)
-   `= 'C'`: $A^H \, X = B$  (Conjugate transpose = Transpose)

#### DIAG `[in]`

_CHARACTER\*1_

-   `= 'N'`: A is non-unit triangular;
-   `= 'U'`: A is unit triangular.

#### N `[in]`

_INTEGER_

The order of the matrix A. $N \ge 0$.

#### KD `[in]`

_INTEGER_

The number of superdiagonals or subdiagonals of the triangular band matrix A. $\mathrm{KD} \ge 0$.

#### NRHS `[in]`

_INTEGER_

The number of right hand sides, i.e., the number of columns of the matrices B and X. $\mathrm{NRHS} \ge 0$.

#### AB `[in]`

_DOUBLE PRECISION array, dimension (LDAB,N)_

The upper or lower triangular band matrix A, stored in the first kd+1 rows of the array. The j-th column of A is stored in the j-th column of the array `AB` as follows: if `UPLO = 'U'`, `AB(kd+1+i-j,j) = A(i,j)` for $\max (1,j-\mathrm{kd}) \le i \le j$; if `UPLO = 'L'`, `AB(1+i-j,j) = A(i,j)` for $j \le i \le \min (n,j+\mathrm{kd})$. If `DIAG = 'U'`, the diagonal elements of A are not referenced and are assumed to be 1.

#### LDAB `[in]`

_INTEGER_

The leading dimension of the array `AB`. $\mathrm{LDAB} \ge \mathrm{KD}+1$.

#### B `[in]`

_DOUBLE PRECISION array, dimension (LDB,NRHS)_

The right hand side matrix B.

#### LDB `[in]`

_INTEGER_

The leading dimension of the array B. $\mathrm{LDB} \ge \max (1,N)$.

#### X `[in]`

_DOUBLE PRECISION array, dimension (LDX,NRHS)_

The solution matrix X.

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

_DOUBLE PRECISION array, dimension (3\*N)_

#### IWORK `[out]`

_INTEGER array, dimension (N)_

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

[lapack-dtbrfs]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__dtbrfs.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->