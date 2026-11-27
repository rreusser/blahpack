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

# dgbsvx

> Solves a real system of linear equations `A * X = B` where A is a general band matrix, with equilibration, condition estimation, and error bounds.

<section class="usage">

## Usage

```javascript
var dgbsvx = require( '@stdlib/lapack/base/dgbsvx' );
```

#### dgbsvx( fact, trans, N, kl, ku, nrhs, AB, LDAB, AFB, LDAFB, IPIV, strideIPIV, equed, r, strideR, c, strideC, B, LDB, X, LDX, FERR, strideFERR, BERR, strideBERR, WORK, strideWORK, IWORK, strideIWORK )

Solves a real system of linear equations `A * X = B` where A is a general band matrix, with equilibration, condition estimation, and error bounds.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Int32Array = require( '@stdlib/array/int32' );
var dgbsvx = require( '@stdlib/lapack/base/dgbsvx' );

var N = 3;
var KL = 1;
var KU = 1;
var nrhs = 1;
var nRows = KL + KU + 1;
var AFB = new Float64Array( ((2 * KL) + KU + 1) * N );
var IPIV = new Int32Array( N );
var r = new Float64Array( N );
var c = new Float64Array( N );
var B = new Float64Array( [ 5, 5, 3 ] );
var X = new Float64Array( N );
var FERR = new Float64Array( nrhs );
var BERR = new Float64Array( nrhs );
var WORK = new Float64Array( 3 * N );
var IWORK = new Int32Array( N );

dgbsvx.ndarray( 'not-factored', 'no-transpose', N, KL, KU, nrhs, AB, 1, nRows, 0, AFB, 1, (2 * KL) + KU + 1, 0, IPIV, 1, 0, 'none', r, 1, 0, c, 1, 0, B, 1, N, 0, X, 1, N, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, IWORK, 1, 0 );
```

The function has the following parameters:

-   **fact**: `fact`.
-   **trans**: specifies whether the matrix should be transposed.
-   **N**: number of columns.
-   **kl**: number of subdiagonals.
-   **ku**: number of superdiagonals.
-   **nrhs**: number of right-hand sides.
-   **AB**: input array `AB`.
-   **LDAB**: leading dimension of `AB`.
-   **AFB**: input array `AFB`.
-   **LDAFB**: leading dimension of `AFB`.
-   **IPIV**: input array `IPIV`.
-   **strideIPIV**: stride length for `IPIV`.
-   **equed**: `equed`.
-   **r**: `r`.
-   **strideR**: stride length for `R`.
-   **c**: `c`.
-   **strideC**: stride length for `C`.
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

#### dgbsvx.ndarray( fact, trans, N, kl, ku, nrhs, AB, strideAB1, strideAB2, offsetAB, AFB, strideAFB1, strideAFB2, offsetAFB, IPIV, strideIPIV, offsetIPIV, equed, r, strideR, offsetR, c, strideC, offsetC, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWORK, offsetWORK, IWORK, strideIWORK, offsetIWORK )

Solves a real system of linear equations `A * X = B` where A is a general band matrix, with equilibration, condition estimation, and error bounds, using alternative indexing semantics.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Int32Array = require( '@stdlib/array/int32' );
var dgbsvx = require( '@stdlib/lapack/base/dgbsvx' );

var N = 3;
var KL = 1;
var KU = 1;
var nrhs = 1;
var nRows = KL + KU + 1;
var AFB = new Float64Array( ((2 * KL) + KU + 1) * N );
var IPIV = new Int32Array( N );
var r = new Float64Array( N );
var c = new Float64Array( N );
var B = new Float64Array( [ 5, 5, 3 ] );
var X = new Float64Array( N );
var FERR = new Float64Array( nrhs );
var BERR = new Float64Array( nrhs );
var WORK = new Float64Array( 3 * N );
var IWORK = new Int32Array( N );

dgbsvx.ndarray( 'not-factored', 'no-transpose', N, KL, KU, nrhs, AB, 1, nRows, 0, AFB, 1, (2 * KL) + KU + 1, 0, IPIV, 1, 0, 'none', r, 1, 0, c, 1, 0, B, 1, N, 0, X, 1, N, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, IWORK, 1, 0 );
```

The function has the following additional parameters:

-   **strideAB1**: stride of dimension 1 of `AB`.
-   **strideAB2**: stride of dimension 2 of `AB`.
-   **offsetAB**: starting index for `AB`.
-   **strideAFB1**: stride of dimension 1 of `AFB`.
-   **strideAFB2**: stride of dimension 2 of `AFB`.
-   **offsetAFB**: starting index for `AFB`.
-   **offsetIPIV**: starting index for `IPIV`.
-   **offsetR**: starting index for `R`.
-   **offsetC**: starting index for `C`.
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

-   `dgbsvx()` corresponds to the [LAPACK][lapack] level routine [`dgbsvx`][lapack-dgbsvx].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Int32Array = require( '@stdlib/array/int32' );
var dgbsvx = require( '@stdlib/lapack/base/dgbsvx' );

var N = 3;
var KL = 1;
var KU = 1;
var nrhs = 1;
var nRows = KL + KU + 1;
var AFB = new Float64Array( ((2 * KL) + KU + 1) * N );
var IPIV = new Int32Array( N );
var r = new Float64Array( N );
var c = new Float64Array( N );
var B = new Float64Array( [ 5, 5, 3 ] );
var X = new Float64Array( N );
var FERR = new Float64Array( nrhs );
var BERR = new Float64Array( nrhs );
var WORK = new Float64Array( 3 * N );
var IWORK = new Int32Array( N );

dgbsvx.ndarray( 'not-factored', 'no-transpose', N, KL, KU, nrhs, AB, 1, nRows, 0, AFB, 1, (2 * KL) + KU + 1, 0, IPIV, 1, 0, 'none', r, 1, 0, c, 1, 0, B, 1, N, 0, X, 1, N, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, IWORK, 1, 0 );
```

</section>

<!-- /.examples -->

<!-- fortran-docs:start (generated by bin/fortran-docs.mjs from data/lapack-3.12.0/SRC/dgbsvx.f; do not edit) -->

<section class="fortran-docs">

## Reference notes

The mathematical description from the reference LAPACK 3.12.0 source of `DGBSVX`. Indices are the 1-based Fortran indices of the source.

### Purpose

DGBSVX uses the LU factorization to compute the solution to a real system of linear equations $A \, X = B$, $A^T \, X = B$, or $A^H \, X = B$, where A is a band matrix of order N with `KL` subdiagonals and `KU` superdiagonals, and X and B are N-by-`NRHS` matrices.

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

[lapack-dgbsvx]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__dgbsvx.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->