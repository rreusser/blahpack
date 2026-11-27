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

# dgbrfs

> @license Apache-2.0.

<section class="usage">

## Usage

```javascript
var dgbrfs = require( '@stdlib/lapack/base/dgbrfs' );
```

#### dgbrfs( trans, N, kl, ku, nrhs, AB, LDAB, AFB, LDAFB, IPIV, B, LDB, X, LDX, FERR, BERR, WORK, IWORK )

@license Apache-2.0.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Int32Array = require( '@stdlib/array/int32' );
var dgbrfs = require( '@stdlib/lapack/base/dgbrfs' );

var ab = new Float64Array( [ 3.0 ] );
var afb = new Float64Array( [ 3.0 ] );
var ipiv = new Int32Array( 1 );
var b = new Float64Array( [ 5.0 ] );
var x = new Float64Array( 1 );
var ferr = new Float64Array( 1 );
var berr = new Float64Array( 1 );
var work = new Float64Array( 3 );
var iwork = new Int32Array( 1 );

dgbrfs.ndarray( 'no-transpose', 1, 0, 0, 1, ab, 1, 1, 0, afb, 1, 1, 0, ipiv, 1, 0, b, 1, 1, 0, x, 1, 1, 0, ferr, 1, 0, berr, 1, 0, work, 1, 0, iwork, 1, 0 );
```

The function has the following parameters:

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
-   **B**: input array `B`.
-   **LDB**: leading dimension of `B`.
-   **X**: input array `X`.
-   **LDX**: leading dimension of `X`.
-   **FERR**: input array `FERR`.
-   **BERR**: input array `BERR`.
-   **WORK**: input array `WORK`.
-   **IWORK**: input array `IWORK`.

#### dgbrfs.ndarray( trans, N, kl, ku, nrhs, AB, strideAB1, strideAB2, offsetAB, AFB, strideAFB1, strideAFB2, offsetAFB, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWORK, offsetWORK, IWORK, strideIWORK, offsetIWORK )

@license Apache-2.0, using alternative indexing semantics.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Int32Array = require( '@stdlib/array/int32' );
var dgbrfs = require( '@stdlib/lapack/base/dgbrfs' );

var ab = new Float64Array( [ 3.0 ] );
var afb = new Float64Array( [ 3.0 ] );
var ipiv = new Int32Array( 1 );
var b = new Float64Array( [ 5.0 ] );
var x = new Float64Array( 1 );
var ferr = new Float64Array( 1 );
var berr = new Float64Array( 1 );
var work = new Float64Array( 3 );
var iwork = new Int32Array( 1 );

dgbrfs.ndarray( 'no-transpose', 1, 0, 0, 1, ab, 1, 1, 0, afb, 1, 1, 0, ipiv, 1, 0, b, 1, 1, 0, x, 1, 1, 0, ferr, 1, 0, berr, 1, 0, work, 1, 0, iwork, 1, 0 );
```

The function has the following additional parameters:

-   **strideAB1**: stride of dimension 1 of `AB`.
-   **strideAB2**: stride of dimension 2 of `AB`.
-   **offsetAB**: starting index for `AB`.
-   **strideAFB1**: stride of dimension 1 of `AFB`.
-   **strideAFB2**: stride of dimension 2 of `AFB`.
-   **offsetAFB**: starting index for `AFB`.
-   **strideIPIV**: stride length for `IPIV`.
-   **offsetIPIV**: starting index for `IPIV`.
-   **strideB1**: stride of dimension 1 of `B`.
-   **strideB2**: stride of dimension 2 of `B`.
-   **offsetB**: starting index for `B`.
-   **strideX1**: stride of dimension 1 of `X`.
-   **strideX2**: stride of dimension 2 of `X`.
-   **offsetX**: starting index for `X`.
-   **strideFERR**: stride length for `FERR`.
-   **offsetFERR**: starting index for `FERR`.
-   **strideBERR**: stride length for `BERR`.
-   **offsetBERR**: starting index for `BERR`.
-   **strideWORK**: stride length for `WORK`.
-   **offsetWORK**: starting index for `WORK`.
-   **strideIWORK**: stride length for `IWORK`.
-   **offsetIWORK**: starting index for `IWORK`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `dgbrfs()` corresponds to the [LAPACK][lapack] level routine [`dgbrfs`][lapack-dgbrfs].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Int32Array = require( '@stdlib/array/int32' );
var dgbrfs = require( '@stdlib/lapack/base/dgbrfs' );

var ab = new Float64Array( [ 3.0 ] );
var afb = new Float64Array( [ 3.0 ] );
var ipiv = new Int32Array( 1 );
var b = new Float64Array( [ 5.0 ] );
var x = new Float64Array( 1 );
var ferr = new Float64Array( 1 );
var berr = new Float64Array( 1 );
var work = new Float64Array( 3 );
var iwork = new Int32Array( 1 );

dgbrfs.ndarray( 'no-transpose', 1, 0, 0, 1, ab, 1, 1, 0, afb, 1, 1, 0, ipiv, 1, 0, b, 1, 1, 0, x, 1, 1, 0, ferr, 1, 0, berr, 1, 0, work, 1, 0, iwork, 1, 0 );
```

</section>

<!-- /.examples -->

<!-- fortran-docs:start (generated by bin/fortran-docs.mjs from data/lapack-3.12.0/SRC/dgbrfs.f; do not edit) -->

<section class="fortran-docs">

## Reference notes

The mathematical description from the reference LAPACK 3.12.0 source of `DGBRFS`. Indices are the 1-based Fortran indices of the source.

### Purpose

DGBRFS improves the computed solution to a system of linear equations when the coefficient matrix is banded, and provides error bounds and backward error estimates for the solution.

</section>

<!-- fortran-docs:end -->

<!-- Section for related `stdlib` packages. Do not manually edit this section, as it is automatically populated. -->

<section class="related">

</section>

<!-- /.related -->

<!-- Section for all links. Make sure to keep an empty line after the `section` element and another before the `/section` close. -->

<section class="links">

[lapack]: https://www.netlib.org/lapack/explore-html/

[lapack-dgbrfs]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__dgbrfs.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->