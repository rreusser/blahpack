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

# dtprfs

> Provides error bounds for the solution to a system with a real triangular matrix in packed storage.

<section class="usage">

## Usage

```javascript
var dtprfs = require( '@stdlib/lapack/base/dtprfs' );
```

#### dtprfs( uplo, trans, diag, N, nrhs, AP, B, LDB, X, LDX, FERR, strideFERR, BERR, strideBERR, WORK, strideWORK, IWORK, strideIWORK )

Provides error bounds for the solution to a system with a real triangular matrix in packed storage.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Int32Array = require( '@stdlib/array/int32' );
var dtprfs = require( '@stdlib/lapack/base/dtprfs' );

var AP = new Float64Array( [ 2.0, 1.0, 4.0, 3.0, 5.0, 6.0 ] );
var B = new Float64Array( [ 13.0, 23.0, 18.0 ] );
var X = new Float64Array( [ 1.0, 2.0, 3.0 ] );
var FERR = new Float64Array( 1 );
var BERR = new Float64Array( 1 );
var WORK = new Float64Array( 9 );
var IWORK = new Int32Array( 3 );

dtprfs.ndarray( 'upper', 'no-transpose', 'non-unit', 3, 1, AP, 1, 0, B, 1, 3, 0, X, 1, 3, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, IWORK, 1, 0 );
```

The function has the following parameters:

-   **uplo**: specifies whether the upper or lower triangular part is referenced.
-   **trans**: specifies whether the matrix should be transposed.
-   **diag**: specifies whether the matrix is unit triangular.
-   **N**: number of columns.
-   **nrhs**: number of right-hand sides.
-   **AP**: input array `AP`.
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

#### dtprfs.ndarray( uplo, trans, diag, N, nrhs, AP, strideAP, offsetAP, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWORK, offsetWORK, IWORK, strideIWORK, offsetIWORK )

Provides error bounds for the solution to a system with a real triangular matrix in packed storage, using alternative indexing semantics.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Int32Array = require( '@stdlib/array/int32' );
var dtprfs = require( '@stdlib/lapack/base/dtprfs' );

var AP = new Float64Array( [ 2.0, 1.0, 4.0, 3.0, 5.0, 6.0 ] );
var B = new Float64Array( [ 13.0, 23.0, 18.0 ] );
var X = new Float64Array( [ 1.0, 2.0, 3.0 ] );
var FERR = new Float64Array( 1 );
var BERR = new Float64Array( 1 );
var WORK = new Float64Array( 9 );
var IWORK = new Int32Array( 3 );

dtprfs.ndarray( 'upper', 'no-transpose', 'non-unit', 3, 1, AP, 1, 0, B, 1, 3, 0, X, 1, 3, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, IWORK, 1, 0 );
```

The function has the following additional parameters:

-   **strideAP**: stride length for `AP`.
-   **offsetAP**: starting index for `AP`.
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

-   `dtprfs()` corresponds to the [LAPACK][lapack] level routine [`dtprfs`][lapack-dtprfs].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Int32Array = require( '@stdlib/array/int32' );
var dtprfs = require( '@stdlib/lapack/base/dtprfs' );

var AP = new Float64Array( [ 2.0, 1.0, 4.0, 3.0, 5.0, 6.0 ] );
var B = new Float64Array( [ 13.0, 23.0, 18.0 ] );
var X = new Float64Array( [ 1.0, 2.0, 3.0 ] );
var FERR = new Float64Array( 1 );
var BERR = new Float64Array( 1 );
var WORK = new Float64Array( 9 );
var IWORK = new Int32Array( 3 );

dtprfs.ndarray( 'upper', 'no-transpose', 'non-unit', 3, 1, AP, 1, 0, B, 1, 3, 0, X, 1, 3, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, IWORK, 1, 0 );
```

</section>

<!-- /.examples -->

<!-- fortran-docs:start (generated by bin/fortran-docs.mjs from data/lapack-3.12.0/SRC/dtprfs.f; do not edit) -->

<section class="fortran-docs">

## Reference notes

The mathematical description from the reference LAPACK 3.12.0 source of `DTPRFS`. Indices are the 1-based Fortran indices of the source.

### Purpose

DTPRFS provides error bounds and backward error estimates for the solution to a system of linear equations with a triangular packed coefficient matrix.

The solution matrix X must be computed by DTPTRS or some other means before entering this routine. DTPRFS does not do iterative refinement because doing so cannot improve the backward error.

</section>

<!-- fortran-docs:end -->

<!-- Section for related `stdlib` packages. Do not manually edit this section, as it is automatically populated. -->

<section class="related">

</section>

<!-- /.related -->

<!-- Section for all links. Make sure to keep an empty line after the `section` element and another before the `/section` close. -->

<section class="links">

[lapack]: https://www.netlib.org/lapack/explore-html/

[lapack-dtprfs]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__dtprfs.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->