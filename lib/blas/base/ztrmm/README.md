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

# ztrmm

> Performs one of the matrix-matrix operations B := α·op(A)·B, or B := α·B·op(A).

<section class="usage">

## Usage

```javascript
var ztrmm = require( '@stdlib/blas/base/ztrmm' );
```

#### ztrmm( order, side, uplo, transa, diag, M, N, alpha, A, LDA, B, LDB )

Performs one of the matrix-matrix operations B := α·op(A)·B, or B := α·B·op(A).

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var ztrmm = require( '@stdlib/blas/base/ztrmm' );

var A = new Float64Array( [ 2.0, 0.0, 0.0, 0.0, 3.0, 0.0, 4.0, 0.0 ] );
var B = new Float64Array( [ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0 ] );
var alpha = new Float64Array( [ 1.0, 0.0 ] );

ztrmm.ndarray( 'left', 'lower', 'no-transpose', 'non-unit', 2, 2, alpha, A, 2, 1, 0, B, 2, 1, 0 );
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **side**: specifies the side of the operation.
-   **uplo**: specifies whether the upper or lower triangular part is referenced.
-   **transa**: specifies the operation for matrix `A`.
-   **diag**: specifies whether the matrix is unit triangular.
-   **M**: number of rows.
-   **N**: number of columns.
-   **alpha**: scalar constant.
-   **A**: input array `A`.
-   **LDA**: leading dimension of `A`.
-   **B**: input array `B`.
-   **LDB**: leading dimension of `B`.

#### ztrmm.ndarray( side, uplo, transa, diag, M, N, alpha, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB )

Performs one of the matrix-matrix operations B := α·op(A)·B, or B := α·B·op(A), using alternative indexing semantics.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var ztrmm = require( '@stdlib/blas/base/ztrmm' );

var A = new Float64Array( [ 2.0, 0.0, 0.0, 0.0, 3.0, 0.0, 4.0, 0.0 ] );
var B = new Float64Array( [ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0 ] );
var alpha = new Float64Array( [ 1.0, 0.0 ] );

ztrmm.ndarray( 'left', 'lower', 'no-transpose', 'non-unit', 2, 2, alpha, A, 2, 1, 0, B, 2, 1, 0 );
```

The function has the following additional parameters:

-   **strideA1**: stride of dimension 1 of `A`.
-   **strideA2**: stride of dimension 2 of `A`.
-   **offsetA**: starting index for `A`.
-   **strideB1**: stride of dimension 1 of `B`.
-   **strideB2**: stride of dimension 2 of `B`.
-   **offsetB**: starting index for `B`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `ztrmm()` corresponds to the [LAPACK][lapack] level routine [`ztrmm`][lapack-ztrmm].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var ztrmm = require( '@stdlib/blas/base/ztrmm' );

var A = new Float64Array( [ 2.0, 0.0, 0.0, 0.0, 3.0, 0.0, 4.0, 0.0 ] );
var B = new Float64Array( [ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0 ] );
var alpha = new Float64Array( [ 1.0, 0.0 ] );

ztrmm.ndarray( 'left', 'lower', 'no-transpose', 'non-unit', 2, 2, alpha, A, 2, 1, 0, B, 2, 1, 0 );
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

[lapack-ztrmm]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__ztrmm.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->