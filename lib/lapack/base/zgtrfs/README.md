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

# zgtrfs

> Improves the computed solution to a complex tridiagonal system and provides error bounds.

<section class="usage">

## Usage

```javascript
var zgtrfs = require( '@stdlib/lapack/base/zgtrfs' );
```

#### zgtrfs( trans, N, nrhs, DL, strideDL, d, strideD, DU, strideDU, DLF, strideDLF, DF, strideDF, DUF, strideDUF, DU2, strideDU2, IPIV, strideIPIV, B, LDB, X, LDX, FERR, strideFERR, BERR, strideBERR, WORK, strideWORK, RWORK, strideRWORK )

Improves the computed solution to a complex tridiagonal system and provides error bounds.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Complex128Array = require( '@stdlib/array/complex128' );
var Int32Array = require( '@stdlib/array/int32' );
var zgtrfs = require( '@stdlib/lapack/base/zgtrfs' );

var n = 4;
var DL = new Complex128Array( [ 2, 1, 1, -1, 3, 0.5 ] );
var d = new Complex128Array( [ 4, 1, 5, 2, 3, 1, 6, -1 ] );
var DU = new Complex128Array( [ 1, 0.5, -1, 1, 2, 1 ] );
var DLF = new Complex128Array( [ 2, 1, 1, -1, 3, 0.5 ] );
var DF = new Complex128Array( [ 4, 1, 5, 2, 3, 1, 6, -1 ] );
var DUF = new Complex128Array( [ 1, 0.5, -1, 1, 2, 1 ] );
var DU2 = new Complex128Array( n );
var IPIV = new Int32Array( n );
var B = new Complex128Array( [ 5, 1.5, 6, 4, 6, 1, 9, -0.5 ] );
var X = new Complex128Array( [ 5, 1.5, 6, 4, 6, 1, 9, -0.5 ] );
var WORK = new Complex128Array( 2 * n );
var RWORK = new Float64Array( n );
var FERR = new Float64Array( 1 );
var BERR = new Float64Array( 1 );

zgtrfs.ndarray( 'no-transpose', n, 1, DL, 1, 0, d, 1, 0, DU, 1, 0, DLF, 1, 0, DF, 1, 0, DUF, 1, 0, DU2, 1, 0, IPIV, 1, 0, B, 1, n, 0, X, 1, n, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 );
```

The function has the following parameters:

-   **trans**: specifies whether the matrix should be transposed.
-   **N**: number of columns.
-   **nrhs**: number of right-hand sides.
-   **DL**: input array `DL`.
-   **strideDL**: stride length for `DL`.
-   **d**: `d`.
-   **strideD**: stride length for `D`.
-   **DU**: input array `DU`.
-   **strideDU**: stride length for `DU`.
-   **DLF**: input array `DLF`.
-   **strideDLF**: stride length for `DLF`.
-   **DF**: input array `DF`.
-   **strideDF**: stride length for `DF`.
-   **DUF**: input array `DUF`.
-   **strideDUF**: stride length for `DUF`.
-   **DU2**: input array `DU2`.
-   **strideDU2**: stride of dimension 2 of `DU`.
-   **IPIV**: input array `IPIV`.
-   **strideIPIV**: stride length for `IPIV`.
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
-   **RWORK**: input array `RWORK`.
-   **strideRWORK**: stride length for `RWORK`.

#### zgtrfs.ndarray( trans, N, nrhs, DL, strideDL, offsetDL, d, strideD, offsetD, DU, strideDU, offsetDU, DLF, strideDLF, offsetDLF, DF, strideDF, offsetDF, DUF, strideDUF, offsetDUF, DU2, strideDU2, offsetDU2, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWORK, offsetWORK, RWORK, strideRWORK, offsetRWORK )

Improves the computed solution to a complex tridiagonal system and provides error bounds, using alternative indexing semantics.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Complex128Array = require( '@stdlib/array/complex128' );
var Int32Array = require( '@stdlib/array/int32' );
var zgtrfs = require( '@stdlib/lapack/base/zgtrfs' );

var n = 4;
var DL = new Complex128Array( [ 2, 1, 1, -1, 3, 0.5 ] );
var d = new Complex128Array( [ 4, 1, 5, 2, 3, 1, 6, -1 ] );
var DU = new Complex128Array( [ 1, 0.5, -1, 1, 2, 1 ] );
var DLF = new Complex128Array( [ 2, 1, 1, -1, 3, 0.5 ] );
var DF = new Complex128Array( [ 4, 1, 5, 2, 3, 1, 6, -1 ] );
var DUF = new Complex128Array( [ 1, 0.5, -1, 1, 2, 1 ] );
var DU2 = new Complex128Array( n );
var IPIV = new Int32Array( n );
var B = new Complex128Array( [ 5, 1.5, 6, 4, 6, 1, 9, -0.5 ] );
var X = new Complex128Array( [ 5, 1.5, 6, 4, 6, 1, 9, -0.5 ] );
var WORK = new Complex128Array( 2 * n );
var RWORK = new Float64Array( n );
var FERR = new Float64Array( 1 );
var BERR = new Float64Array( 1 );

zgtrfs.ndarray( 'no-transpose', n, 1, DL, 1, 0, d, 1, 0, DU, 1, 0, DLF, 1, 0, DF, 1, 0, DUF, 1, 0, DU2, 1, 0, IPIV, 1, 0, B, 1, n, 0, X, 1, n, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 );
```

The function has the following additional parameters:

-   **offsetDL**: starting index for `DL`.
-   **offsetD**: starting index for `D`.
-   **offsetDU**: starting index for `DU`.
-   **offsetDLF**: starting index for `DLF`.
-   **offsetDF**: starting index for `DF`.
-   **offsetDUF**: starting index for `DUF`.
-   **offsetDU2**: starting index for `DU2`.
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
-   **offsetRWORK**: starting index for `RWORK`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `zgtrfs()` corresponds to the [LAPACK][lapack] level routine [`zgtrfs`][lapack-zgtrfs].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Complex128Array = require( '@stdlib/array/complex128' );
var Int32Array = require( '@stdlib/array/int32' );
var zgtrfs = require( '@stdlib/lapack/base/zgtrfs' );

var n = 4;
var DL = new Complex128Array( [ 2, 1, 1, -1, 3, 0.5 ] );
var d = new Complex128Array( [ 4, 1, 5, 2, 3, 1, 6, -1 ] );
var DU = new Complex128Array( [ 1, 0.5, -1, 1, 2, 1 ] );
var DLF = new Complex128Array( [ 2, 1, 1, -1, 3, 0.5 ] );
var DF = new Complex128Array( [ 4, 1, 5, 2, 3, 1, 6, -1 ] );
var DUF = new Complex128Array( [ 1, 0.5, -1, 1, 2, 1 ] );
var DU2 = new Complex128Array( n );
var IPIV = new Int32Array( n );
var B = new Complex128Array( [ 5, 1.5, 6, 4, 6, 1, 9, -0.5 ] );
var X = new Complex128Array( [ 5, 1.5, 6, 4, 6, 1, 9, -0.5 ] );
var WORK = new Complex128Array( 2 * n );
var RWORK = new Float64Array( n );
var FERR = new Float64Array( 1 );
var BERR = new Float64Array( 1 );

zgtrfs.ndarray( 'no-transpose', n, 1, DL, 1, 0, d, 1, 0, DU, 1, 0, DLF, 1, 0, DF, 1, 0, DUF, 1, 0, DU2, 1, 0, IPIV, 1, 0, B, 1, n, 0, X, 1, n, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 );
```

</section>

<!-- /.examples -->

<!-- fortran-docs:start (generated by bin/fortran-docs.mjs from data/lapack-3.12.0/SRC/zgtrfs.f; do not edit) -->

<section class="fortran-docs">

## Reference documentation

From the reference LAPACK 3.12.0 source of `ZGTRFS`, converted to Markdown with KaTeX math. Indices are the 1-based Fortran indices of the source.

### Purpose

ZGTRFS improves the computed solution to a system of linear equations when the coefficient matrix is tridiagonal, and provides error bounds and backward error estimates for the solution.

### Arguments

#### TRANS `[in]`

_CHARACTER\*1_

Specifies the form of the system of equations:

-   `= 'N'`: $A \, X = B$     (No transpose)
-   `= 'T'`: $A^T \, X = B$  (Transpose)
-   `= 'C'`: $A^H \, X = B$  (Conjugate transpose)

#### N `[in]`

_INTEGER_

The order of the matrix A. $N \ge 0$.

#### NRHS `[in]`

_INTEGER_

The number of right hand sides, i.e., the number of columns of the matrix B. $\mathrm{NRHS} \ge 0$.

#### DL `[in]`

_COMPLEX\*16 array, dimension (N-1)_

The (n-1) subdiagonal elements of A.

#### D `[in]`

_COMPLEX\*16 array, dimension (N)_

The diagonal elements of A.

#### DU `[in]`

_COMPLEX\*16 array, dimension (N-1)_

The (n-1) superdiagonal elements of A.

#### DLF `[in]`

_COMPLEX\*16 array, dimension (N-1)_

The (n-1) multipliers that define the matrix L from the LU factorization of A as computed by ZGTTRF.

#### DF `[in]`

_COMPLEX\*16 array, dimension (N)_

The n diagonal elements of the upper triangular matrix U from the LU factorization of A.

#### DUF `[in]`

_COMPLEX\*16 array, dimension (N-1)_

The (n-1) elements of the first superdiagonal of U.

#### DU2 `[in]`

_COMPLEX\*16 array, dimension (N-2)_

The (n-2) elements of the second superdiagonal of U.

#### IPIV `[in]`

_INTEGER array, dimension (N)_

The pivot indices; for $1 \le i \le n$, row i of the matrix was interchanged with row `IPIV(i)`. `IPIV(i)` will always be either i or i+1; `IPIV(i) = i` indicates a row interchange was not required.

#### B `[in]`

_COMPLEX\*16 array, dimension (LDB,NRHS)_

The right hand side matrix B.

#### LDB `[in]`

_INTEGER_

The leading dimension of the array B. $\mathrm{LDB} \ge \max (1,N)$.

#### X `[in,out]`

_COMPLEX\*16 array, dimension (LDX,NRHS)_

On entry, the solution matrix X, as computed by ZGTTRS. On exit, the improved solution matrix X.

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

[lapack-zgtrfs]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__zgtrfs.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->