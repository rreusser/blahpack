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

# zher2

> Performs the Hermitian rank 2 operation A := α·x·yᴴ + conj(α)·y·xᴴ + A.

<section class="usage">

## Usage

```javascript
var zher2 = require( '@stdlib/blas/base/zher2' );
```

#### zher2( order, uplo, N, alpha, x, strideX, y, strideY, A, LDA )

Performs the Hermitian rank 2 operation A := α·x·yᴴ + conj(α)·y·xᴴ + A.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var zher2 = require( '@stdlib/blas/base/zher2' );

var x = new Float64Array( [ 1.0, 0.0, 0.0, 1.0 ] );
var y = new Float64Array( [ 1.0, 0.0, 0.0, 1.0 ] );
var A = new Float64Array( [ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0 ] );
var alpha = new Float64Array( [ 1.0, 0.0 ] );

zher2.ndarray( 'upper', 2, alpha, x, 1, 0, y, 1, 0, A, 2, 1, 0 );
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **uplo**: specifies whether the upper or lower triangular part is referenced.
-   **N**: number of columns.
-   **alpha**: scalar constant.
-   **x**: `x`.
-   **strideX**: stride length for `X`.
-   **y**: `y`.
-   **strideY**: stride length for `Y`.
-   **A**: input array `A`.
-   **LDA**: leading dimension of `A`.

#### zher2.ndarray( uplo, N, alpha, x, strideX, offsetX, y, strideY, offsetY, A, strideA1, strideA2, offsetA )

Performs the Hermitian rank 2 operation A := α·x·yᴴ + conj(α)·y·xᴴ + A, using alternative indexing semantics.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var zher2 = require( '@stdlib/blas/base/zher2' );

var x = new Float64Array( [ 1.0, 0.0, 0.0, 1.0 ] );
var y = new Float64Array( [ 1.0, 0.0, 0.0, 1.0 ] );
var A = new Float64Array( [ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0 ] );
var alpha = new Float64Array( [ 1.0, 0.0 ] );

zher2.ndarray( 'upper', 2, alpha, x, 1, 0, y, 1, 0, A, 2, 1, 0 );
```

The function has the following additional parameters:

-   **offsetX**: starting index for `X`.
-   **offsetY**: starting index for `Y`.
-   **strideA1**: stride of dimension 1 of `A`.
-   **strideA2**: stride of dimension 2 of `A`.
-   **offsetA**: starting index for `A`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `zher2()` corresponds to the [LAPACK][lapack] level routine [`zher2`][lapack-zher2].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var zher2 = require( '@stdlib/blas/base/zher2' );

var x = new Float64Array( [ 1.0, 0.0, 0.0, 1.0 ] );
var y = new Float64Array( [ 1.0, 0.0, 0.0, 1.0 ] );
var A = new Float64Array( [ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0 ] );
var alpha = new Float64Array( [ 1.0, 0.0 ] );

zher2.ndarray( 'upper', 2, alpha, x, 1, 0, y, 1, 0, A, 2, 1, 0 );
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

[lapack-zher2]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__zher2.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->