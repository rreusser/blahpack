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

# dsyr2k

> Performs one of the symmetric rank 2k operations C := α·A·Bᵀ + α·B·Aᵀ + β·C, or C := α·Aᵀ·B + α·Bᵀ·A + β·C.

<section class="usage">

## Usage

```javascript
var dsyr2k = require( '@stdlib/blas/base/dsyr2k' );
```

#### dsyr2k( order, uplo, trans, N, K, alpha, A, LDA, B, LDB, beta, C, LDC )

Performs one of the symmetric rank 2k operations C := α·A·Bᵀ + α·B·Aᵀ + β·C, or C := α·Aᵀ·B + α·Bᵀ·A + β·C.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var dsyr2k = require( '@stdlib/blas/base/dsyr2k' );

var A = new Float64Array( [ 1.0, 2.0 ] );
var B = new Float64Array( [ 3.0, 4.0 ] );
var C = new Float64Array( [ 0.0 ] );

dsyr2k.ndarray( 'upper', 'no-transpose', 1, 2, 1.0, A, 2, 1, 0, B, 2, 1, 0, 0.0, C, 1, 1, 0 );
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **uplo**: specifies whether the upper or lower triangular part is referenced.
-   **trans**: specifies whether the matrix should be transposed.
-   **N**: number of columns.
-   **K**: inner dimension.
-   **alpha**: scalar constant.
-   **A**: input array `A`.
-   **LDA**: leading dimension of `A`.
-   **B**: input array `B`.
-   **LDB**: leading dimension of `B`.
-   **beta**: scalar constant.
-   **C**: input array `C`.
-   **LDC**: leading dimension of `C`.

#### dsyr2k.ndarray( uplo, trans, N, K, alpha, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, beta, C, strideC1, strideC2, offsetC )

Performs one of the symmetric rank 2k operations C := α·A·Bᵀ + α·B·Aᵀ + β·C, or C := α·Aᵀ·B + α·Bᵀ·A + β·C, using alternative indexing semantics.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var dsyr2k = require( '@stdlib/blas/base/dsyr2k' );

var A = new Float64Array( [ 1.0, 2.0 ] );
var B = new Float64Array( [ 3.0, 4.0 ] );
var C = new Float64Array( [ 0.0 ] );

dsyr2k.ndarray( 'upper', 'no-transpose', 1, 2, 1.0, A, 2, 1, 0, B, 2, 1, 0, 0.0, C, 1, 1, 0 );
```

The function has the following additional parameters:

-   **strideA1**: stride of dimension 1 of `A`.
-   **strideA2**: stride of dimension 2 of `A`.
-   **offsetA**: starting index for `A`.
-   **strideB1**: stride of dimension 1 of `B`.
-   **strideB2**: stride of dimension 2 of `B`.
-   **offsetB**: starting index for `B`.
-   **strideC1**: stride of dimension 1 of `C`.
-   **strideC2**: stride of dimension 2 of `C`.
-   **offsetC**: starting index for `C`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `dsyr2k()` corresponds to the [LAPACK][lapack] level routine [`dsyr2k`][lapack-dsyr2k].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var dsyr2k = require( '@stdlib/blas/base/dsyr2k' );

var A = new Float64Array( [ 1.0, 2.0 ] );
var B = new Float64Array( [ 3.0, 4.0 ] );
var C = new Float64Array( [ 0.0 ] );

dsyr2k.ndarray( 'upper', 'no-transpose', 1, 2, 1.0, A, 2, 1, 0, B, 2, 1, 0, 0.0, C, 1, 1, 0 );
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

[lapack-dsyr2k]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__dsyr2k.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->