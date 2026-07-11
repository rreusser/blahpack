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

# ztrrfs

> Provides error bounds and backward error estimates for the solution to a system of linear equations with a triangular coefficient matrix.

<section class="usage">

## Usage

```javascript
var ztrrfs = require( '@stdlib/lapack/base/ztrrfs' );
```

#### ztrrfs( uplo, trans, diag, N, nrhs, A, LDA, B, LDB, X, LDX, FERR, strideFERR, BERR, strideBERR, WORK, strideWORK, RWORK, strideRWORK )

Provides error bounds and backward error estimates for the solution to a system of linear equations with a triangular coefficient matrix.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Complex128Array = require( '@stdlib/array/complex128' );
var ztrrfs = require( '@stdlib/lapack/base/ztrrfs' );

var A = new Complex128Array( [ 2, 1, 0, 0, 0, 0, 1, 2, 4, 1, 0, 0, 3, 1, 5, 2, 6, 1 ] );
var B = new Complex128Array( [ 6, 4, 9, 3, 6, 1 ] );
var X = new Complex128Array( [ 1, 0, 1, 0, 1, 0 ] );
var FERR = new Float64Array( 1 );
var BERR = new Float64Array( 1 );
var WORK = new Complex128Array( 6 );
var RWORK = new Float64Array( 3 );

ztrrfs.ndarray( 'upper', 'no-transpose', 'non-unit', 3, 1, A, 1, 3, 0, B, 1, 3, 0, X, 1, 3, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 );
```

The function has the following parameters:

-   **uplo**: specifies whether the upper or lower triangular part is referenced.
-   **trans**: specifies whether the matrix should be transposed.
-   **diag**: specifies whether the matrix is unit triangular.
-   **N**: number of columns.
-   **nrhs**: number of right-hand sides.
-   **A**: input array `A`.
-   **LDA**: leading dimension of `A`.
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

#### ztrrfs.ndarray( uplo, trans, diag, N, nrhs, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWORK, offsetWORK, RWORK, strideRWORK, offsetRWORK )

Provides error bounds and backward error estimates for the solution to a system of linear equations with a triangular coefficient matrix, using alternative indexing semantics.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Complex128Array = require( '@stdlib/array/complex128' );
var ztrrfs = require( '@stdlib/lapack/base/ztrrfs' );

var A = new Complex128Array( [ 2, 1, 0, 0, 0, 0, 1, 2, 4, 1, 0, 0, 3, 1, 5, 2, 6, 1 ] );
var B = new Complex128Array( [ 6, 4, 9, 3, 6, 1 ] );
var X = new Complex128Array( [ 1, 0, 1, 0, 1, 0 ] );
var FERR = new Float64Array( 1 );
var BERR = new Float64Array( 1 );
var WORK = new Complex128Array( 6 );
var RWORK = new Float64Array( 3 );

ztrrfs.ndarray( 'upper', 'no-transpose', 'non-unit', 3, 1, A, 1, 3, 0, B, 1, 3, 0, X, 1, 3, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 );
```

The function has the following additional parameters:

-   **strideA1**: stride of dimension 1 of `A`.
-   **strideA2**: stride of dimension 2 of `A`.
-   **offsetA**: starting index for `A`.
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

-   `ztrrfs()` corresponds to the [LAPACK][lapack] level routine [`ztrrfs`][lapack-ztrrfs].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Complex128Array = require( '@stdlib/array/complex128' );
var ztrrfs = require( '@stdlib/lapack/base/ztrrfs' );

var A = new Complex128Array( [ 2, 1, 0, 0, 0, 0, 1, 2, 4, 1, 0, 0, 3, 1, 5, 2, 6, 1 ] );
var B = new Complex128Array( [ 6, 4, 9, 3, 6, 1 ] );
var X = new Complex128Array( [ 1, 0, 1, 0, 1, 0 ] );
var FERR = new Float64Array( 1 );
var BERR = new Float64Array( 1 );
var WORK = new Complex128Array( 6 );
var RWORK = new Float64Array( 3 );

ztrrfs.ndarray( 'upper', 'no-transpose', 'non-unit', 3, 1, A, 1, 3, 0, B, 1, 3, 0, X, 1, 3, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 );
```

</section>

<!-- /.examples -->

<!-- Section for related `stdlib` packages. Do not manually edit this section, as it is automatically populated. -->

<section class="related">

</section>

<!-- /.related -->

<!-- Section for all links. Make sure to keep an empty line after the `section` element and another before the `/section` close. -->

<section class="links">

[lapack]: https://www.netlib.org/lapack/explore-html/

[lapack-ztrrfs]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__ztrrfs.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->