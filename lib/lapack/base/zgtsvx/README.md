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

# zgtsvx

> @license Apache-2.0.

<section class="usage">

## Usage

```javascript
var zgtsvx = require( '@stdlib/lapack/base/zgtsvx' );
```

#### zgtsvx( fact, trans, N, nrhs, DL, strideDL, d, strideD, DU, strideDU, DLF, strideDLF, DF, strideDF, DUF, strideDUF, DU2, strideDU2, IPIV, strideIPIV, B, LDB, X, LDX, rcond, FERR, strideFERR, BERR, strideBERR, WORK, strideWORK, RWORK, strideRWORK )

@license Apache-2.0.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Complex128Array = require( '@stdlib/array/complex128' );
var Int32Array = require( '@stdlib/array/int32' );
var zgtsvx = require( '@stdlib/lapack/base/zgtsvx' );

var dl = new Complex128Array( new Float64Array( [1, 0.5, 2, -1] ) );
var d = new Complex128Array( new Float64Array( [4, 1, 5, 0, 3, -0.5] ) );
var du = new Complex128Array( new Float64Array( [-1, 0.5, 1, 1] ) );
var dlf = new Complex128Array( 2 );
var df = new Complex128Array( 3 );
var duf = new Complex128Array( 2 );
var du2 = new Complex128Array( 1 );
var ipiv = new Int32Array( 3 );
var b = new Complex128Array( new Float64Array( [3, 1.5, 8, 0.5, 5, -1.5] ) );
var x = new Complex128Array( 3 );
var rcond = new Float64Array( 1 );
var ferr = new Float64Array( 1 );
var berr = new Float64Array( 1 );
var work = new Complex128Array( 6 );
var rwork = new Float64Array( 3 );

zgtsvx.ndarray( 'not-factored', 'no-transpose', 3, 1, dl, 1, 0, d, 1, 0, du, 1, 0, dlf, 1, 0, df, 1, 0, duf, 1, 0, du2, 1, 0, ipiv, 1, 0, b, 1, 3, 0, x, 1, 3, 0, rcond, ferr, 1, 0, berr, 1, 0, work, 1, 0, rwork, 1, 0 );
```

The function has the following parameters:

-   **fact**: `fact`.
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
-   **rcond**: `rcond`.
-   **FERR**: input array `FERR`.
-   **strideFERR**: stride length for `FERR`.
-   **BERR**: input array `BERR`.
-   **strideBERR**: stride length for `BERR`.
-   **WORK**: input array `WORK`.
-   **strideWORK**: stride length for `WORK`.
-   **RWORK**: input array `RWORK`.
-   **strideRWORK**: stride length for `RWORK`.

#### zgtsvx.ndarray( fact, trans, N, nrhs, DL, strideDL, offsetDL, d, strideD, offsetD, DU, strideDU, offsetDU, DLF, strideDLF, offsetDLF, DF, strideDF, offsetDF, DUF, strideDUF, offsetDUF, DU2, strideDU2, offsetDU2, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, rcond, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWORK, offsetWORK, RWORK, strideRWORK, offsetRWORK )

@license Apache-2.0, using alternative indexing semantics.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Complex128Array = require( '@stdlib/array/complex128' );
var Int32Array = require( '@stdlib/array/int32' );
var zgtsvx = require( '@stdlib/lapack/base/zgtsvx' );

var dl = new Complex128Array( new Float64Array( [1, 0.5, 2, -1] ) );
var d = new Complex128Array( new Float64Array( [4, 1, 5, 0, 3, -0.5] ) );
var du = new Complex128Array( new Float64Array( [-1, 0.5, 1, 1] ) );
var dlf = new Complex128Array( 2 );
var df = new Complex128Array( 3 );
var duf = new Complex128Array( 2 );
var du2 = new Complex128Array( 1 );
var ipiv = new Int32Array( 3 );
var b = new Complex128Array( new Float64Array( [3, 1.5, 8, 0.5, 5, -1.5] ) );
var x = new Complex128Array( 3 );
var rcond = new Float64Array( 1 );
var ferr = new Float64Array( 1 );
var berr = new Float64Array( 1 );
var work = new Complex128Array( 6 );
var rwork = new Float64Array( 3 );

zgtsvx.ndarray( 'not-factored', 'no-transpose', 3, 1, dl, 1, 0, d, 1, 0, du, 1, 0, dlf, 1, 0, df, 1, 0, duf, 1, 0, du2, 1, 0, ipiv, 1, 0, b, 1, 3, 0, x, 1, 3, 0, rcond, ferr, 1, 0, berr, 1, 0, work, 1, 0, rwork, 1, 0 );
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

-   `zgtsvx()` corresponds to the [LAPACK][lapack] level routine [`zgtsvx`][lapack-zgtsvx].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Complex128Array = require( '@stdlib/array/complex128' );
var Int32Array = require( '@stdlib/array/int32' );
var zgtsvx = require( '@stdlib/lapack/base/zgtsvx' );

var dl = new Complex128Array( new Float64Array( [1, 0.5, 2, -1] ) );
var d = new Complex128Array( new Float64Array( [4, 1, 5, 0, 3, -0.5] ) );
var du = new Complex128Array( new Float64Array( [-1, 0.5, 1, 1] ) );
var dlf = new Complex128Array( 2 );
var df = new Complex128Array( 3 );
var duf = new Complex128Array( 2 );
var du2 = new Complex128Array( 1 );
var ipiv = new Int32Array( 3 );
var b = new Complex128Array( new Float64Array( [3, 1.5, 8, 0.5, 5, -1.5] ) );
var x = new Complex128Array( 3 );
var rcond = new Float64Array( 1 );
var ferr = new Float64Array( 1 );
var berr = new Float64Array( 1 );
var work = new Complex128Array( 6 );
var rwork = new Float64Array( 3 );

zgtsvx.ndarray( 'not-factored', 'no-transpose', 3, 1, dl, 1, 0, d, 1, 0, du, 1, 0, dlf, 1, 0, df, 1, 0, duf, 1, 0, du2, 1, 0, ipiv, 1, 0, b, 1, 3, 0, x, 1, 3, 0, rcond, ferr, 1, 0, berr, 1, 0, work, 1, 0, rwork, 1, 0 );
```

</section>

<!-- /.examples -->

<!-- fortran-docs:start (generated by bin/fortran-docs.mjs from data/lapack-3.12.0/SRC/zgtsvx.f; do not edit) -->

<section class="fortran-docs">

## Reference documentation

From the reference LAPACK 3.12.0 source of `ZGTSVX`, converted to Markdown with KaTeX math. Indices are the 1-based Fortran indices of the source.

> Computes the solution to system of linear equations $A \, X = B$ for GT matrices

### Purpose

ZGTSVX uses the LU factorization to compute the solution to a complex system of linear equations $A \, X = B$, $A^T \, X = B$, or $A^H \, X = B$, where A is a tridiagonal matrix of order N and X and B are N-by-`NRHS` matrices.

Error bounds on the solution and a condition estimate are also provided.

### Arguments

#### FACT `[in]`

_CHARACTER\*1_

Specifies whether or not the factored form of A has been supplied on entry.

-   `= 'F'`: `DLF`, `DF`, `DUF`, `DU2`, and `IPIV` contain the factored form of A; `DL`, D, `DU`, `DLF`, `DF`, `DUF`, `DU2` and `IPIV` will not be modified.
-   `= 'N'`: The matrix will be copied to `DLF`, `DF`, and `DUF` and factored.

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

The n diagonal elements of A.

#### DU `[in]`

_COMPLEX\*16 array, dimension (N-1)_

The (n-1) superdiagonal elements of A.

#### DLF `[in,out]`

_COMPLEX\*16 array, dimension (N-1)_

If `FACT = 'F'`, then `DLF` is an input argument and on entry contains the (n-1) multipliers that define the matrix L from the LU factorization of A as computed by ZGTTRF.

If `FACT = 'N'`, then `DLF` is an output argument and on exit contains the (n-1) multipliers that define the matrix L from the LU factorization of A.

#### DF `[in,out]`

_COMPLEX\*16 array, dimension (N)_

If `FACT = 'F'`, then `DF` is an input argument and on entry contains the n diagonal elements of the upper triangular matrix U from the LU factorization of A.

If `FACT = 'N'`, then `DF` is an output argument and on exit contains the n diagonal elements of the upper triangular matrix U from the LU factorization of A.

#### DUF `[in,out]`

_COMPLEX\*16 array, dimension (N-1)_

If `FACT = 'F'`, then `DUF` is an input argument and on entry contains the (n-1) elements of the first superdiagonal of U.

If `FACT = 'N'`, then `DUF` is an output argument and on exit contains the (n-1) elements of the first superdiagonal of U.

#### DU2 `[in,out]`

_COMPLEX\*16 array, dimension (N-2)_

If `FACT = 'F'`, then `DU2` is an input argument and on entry contains the (n-2) elements of the second superdiagonal of U.

If `FACT = 'N'`, then `DU2` is an output argument and on exit contains the (n-2) elements of the second superdiagonal of U.

#### IPIV `[in,out]`

_INTEGER array, dimension (N)_

If `FACT = 'F'`, then `IPIV` is an input argument and on entry contains the pivot indices from the LU factorization of A as computed by ZGTTRF.

If `FACT = 'N'`, then `IPIV` is an output argument and on exit contains the pivot indices from the LU factorization of A; row i of the matrix was interchanged with row `IPIV(i)`. `IPIV(i)` will always be either i or i+1; `IPIV(i) = i` indicates a row interchange was not required.

#### B `[in]`

_COMPLEX\*16 array, dimension (LDB,NRHS)_

The N-by-`NRHS` right hand side matrix B.

#### LDB `[in]`

_INTEGER_

The leading dimension of the array B. $\mathrm{LDB} \ge \max (1,N)$.

#### X `[out]`

_COMPLEX\*16 array, dimension (LDX,NRHS)_

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

_COMPLEX\*16 array, dimension (2\*N)_

#### RWORK `[out]`

_DOUBLE PRECISION array, dimension (N)_

#### INFO `[out]`

_INTEGER_

-   `= 0`: successful exit
-   `< 0`: if `INFO = -i`, the i-th argument had an illegal value
-   `> 0`: if `INFO = i`, and i is \<= N:  U(i,i) is exactly zero.  The factorization has not been completed unless $i = N$, but the factor U is exactly singular, so the solution and error bounds could not be computed. `RCOND = 0` is returned. = N+1: U is nonsingular, but `RCOND` is less than machine precision, meaning that the matrix is singular to working precision.  Nevertheless, the solution and error bounds are computed because there are a number of situations where the computed solution can be more accurate than the value of `RCOND` would suggest.

</section>

<!-- fortran-docs:end -->

<!-- Section for related `stdlib` packages. Do not manually edit this section, as it is automatically populated. -->

<section class="related">

</section>

<!-- /.related -->

<!-- Section for all links. Make sure to keep an empty line after the `section` element and another before the `/section` close. -->

<section class="links">

[lapack]: https://www.netlib.org/lapack/explore-html/

[lapack-zgtsvx]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__zgtsvx.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->