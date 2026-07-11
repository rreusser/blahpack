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

# zhemv

> Performs the matrix-vector operation y := α·A·x + β·y.

<section class="usage">

## Usage

```javascript
var zhemv = require( '@stdlib/blas/base/zhemv' );
```

#### zhemv( order, uplo, N, alpha, A, LDA, x, strideX, beta, y, strideY )

Performs the matrix-vector operation y := α·A·x + β·y.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var zhemv = require( '@stdlib/blas/base/zhemv' );

var A = new Float64Array( [ 1.0, 0.0, 2.0, 0.0, 2.0, 0.0, 3.0, 0.0 ] );
var x = new Float64Array( [ 1.0, 0.0, 1.0, 0.0 ] );
var y = new Float64Array( [ 0.0, 0.0, 0.0, 0.0 ] );
var alpha = new Float64Array( [ 1.0, 0.0 ] );
var beta = new Float64Array( [ 0.0, 0.0 ] );

zhemv.ndarray( 'upper', 2, alpha, A, 2, 1, 0, x, 1, 0, beta, y, 1, 0 );
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **uplo**: specifies whether the upper or lower triangular part is referenced.
-   **N**: number of columns.
-   **alpha**: scalar constant.
-   **A**: input array `A`.
-   **LDA**: leading dimension of `A`.
-   **x**: `x`.
-   **strideX**: stride length for `X`.
-   **beta**: scalar constant.
-   **y**: `y`.
-   **strideY**: stride length for `Y`.

#### zhemv.ndarray( uplo, N, alpha, A, strideA1, strideA2, offsetA, x, strideX, offsetX, beta, y, strideY, offsetY )

Performs the matrix-vector operation y := α·A·x + β·y, using alternative indexing semantics.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var zhemv = require( '@stdlib/blas/base/zhemv' );

var A = new Float64Array( [ 1.0, 0.0, 2.0, 0.0, 2.0, 0.0, 3.0, 0.0 ] );
var x = new Float64Array( [ 1.0, 0.0, 1.0, 0.0 ] );
var y = new Float64Array( [ 0.0, 0.0, 0.0, 0.0 ] );
var alpha = new Float64Array( [ 1.0, 0.0 ] );
var beta = new Float64Array( [ 0.0, 0.0 ] );

zhemv.ndarray( 'upper', 2, alpha, A, 2, 1, 0, x, 1, 0, beta, y, 1, 0 );
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

-   `zhemv()` corresponds to the [LAPACK][lapack] level routine [`zhemv`][lapack-zhemv].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var zhemv = require( '@stdlib/blas/base/zhemv' );

var A = new Float64Array( [ 1.0, 0.0, 2.0, 0.0, 2.0, 0.0, 3.0, 0.0 ] );
var x = new Float64Array( [ 1.0, 0.0, 1.0, 0.0 ] );
var y = new Float64Array( [ 0.0, 0.0, 0.0, 0.0 ] );
var alpha = new Float64Array( [ 1.0, 0.0 ] );
var beta = new Float64Array( [ 0.0, 0.0 ] );

zhemv.ndarray( 'upper', 2, alpha, A, 2, 1, 0, x, 1, 0, beta, y, 1, 0 );
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

[lapack-zhemv]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__zhemv.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->