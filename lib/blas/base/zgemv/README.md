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

# zgemv

> Performs one of the matrix-vector operations y := α·A·x + β·y, or y := α·Aᵀ·x + β·y, or y := α·Aᴴ·x + β·y.

<section class="usage">

## Usage

```javascript
var zgemv = require( '@stdlib/blas/base/zgemv' );
```

#### zgemv( order, trans, M, N, alpha, A, LDA, x, strideX, beta, y, strideY )

Performs one of the matrix-vector operations y := α·A·x + β·y, or y := α·Aᵀ·x + β·y, or y := α·Aᴴ·x + β·y.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var zgemv = require( '@stdlib/blas/base/zgemv' );

var A = new Float64Array( [ 1.0, 0.0, 2.0, 0.0, 3.0, 0.0, 4.0, 0.0 ] );
var x = new Float64Array( [ 1.0, 0.0, 1.0, 0.0 ] );
var y = new Float64Array( [ 0.0, 0.0, 0.0, 0.0 ] );
var alpha = new Float64Array( [ 1.0, 0.0 ] );
var beta = new Float64Array( [ 0.0, 0.0 ] );

zgemv.ndarray( 'no-transpose', 2, 2, alpha, A, 2, 1, 0, x, 1, 0, beta, y, 1, 0 );
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **trans**: specifies whether the matrix should be transposed.
-   **M**: number of rows.
-   **N**: number of columns.
-   **alpha**: scalar constant.
-   **A**: input array `A`.
-   **LDA**: leading dimension of `A`.
-   **x**: `x`.
-   **strideX**: stride length for `X`.
-   **beta**: scalar constant.
-   **y**: `y`.
-   **strideY**: stride length for `Y`.

#### zgemv.ndarray( trans, M, N, alpha, A, strideA1, strideA2, offsetA, x, strideX, offsetX, beta, y, strideY, offsetY )

Performs one of the matrix-vector operations y := α·A·x + β·y, or y := α·Aᵀ·x + β·y, or y := α·Aᴴ·x + β·y, using alternative indexing semantics.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var zgemv = require( '@stdlib/blas/base/zgemv' );

var A = new Float64Array( [ 1.0, 0.0, 2.0, 0.0, 3.0, 0.0, 4.0, 0.0 ] );
var x = new Float64Array( [ 1.0, 0.0, 1.0, 0.0 ] );
var y = new Float64Array( [ 0.0, 0.0, 0.0, 0.0 ] );
var alpha = new Float64Array( [ 1.0, 0.0 ] );
var beta = new Float64Array( [ 0.0, 0.0 ] );

zgemv.ndarray( 'no-transpose', 2, 2, alpha, A, 2, 1, 0, x, 1, 0, beta, y, 1, 0 );
```

The function has the following additional parameters:

-   **strideA1**: stride of dimension 1 of `A`.
-   **strideA2**: stride of dimension 2 of `A`.
-   **offsetA**: starting index for `A`.
-   **offsetX**: starting index for `X`.
-   **offsetY**: starting index for `Y`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `zgemv()` corresponds to the [LAPACK][lapack] level routine [`zgemv`][lapack-zgemv].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var zgemv = require( '@stdlib/blas/base/zgemv' );

var A = new Float64Array( [ 1.0, 0.0, 2.0, 0.0, 3.0, 0.0, 4.0, 0.0 ] );
var x = new Float64Array( [ 1.0, 0.0, 1.0, 0.0 ] );
var y = new Float64Array( [ 0.0, 0.0, 0.0, 0.0 ] );
var alpha = new Float64Array( [ 1.0, 0.0 ] );
var beta = new Float64Array( [ 0.0, 0.0 ] );

zgemv.ndarray( 'no-transpose', 2, 2, alpha, A, 2, 1, 0, x, 1, 0, beta, y, 1, 0 );
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

[lapack-zgemv]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__zgemv.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->