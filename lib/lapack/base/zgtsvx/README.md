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

## Reference notes

The mathematical description from the reference LAPACK 3.12.0 source of `ZGTSVX`. Indices are the 1-based Fortran indices of the source.

### Purpose

ZGTSVX uses the LU factorization to compute the solution to a complex system of linear equations $A \, X = B$, $A^T \, X = B$, or $A^H \, X = B$, where A is a tridiagonal matrix of order N and X and B are N-by-`NRHS` matrices.

Error bounds on the solution and a condition estimate are also provided.

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