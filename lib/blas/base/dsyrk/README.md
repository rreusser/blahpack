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

# dsyrk

> Performs one of the symmetric rank k operations C := α·A·Aᵀ + β·C, or C := α·Aᵀ·A + β·C.

<section class="usage">

## Usage

```javascript
var dsyrk = require( '@stdlib/blas/base/dsyrk' );
```

#### dsyrk( order, uplo, trans, N, K, alpha, A, LDA, beta, C, LDC )

Performs one of the symmetric rank k operations C := α·A·Aᵀ + β·C, or C := α·Aᵀ·A + β·C.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var dsyrk = require( '@stdlib/blas/base/dsyrk' );

var A = new Float64Array( [ 1.0, 2.0 ] );
var C = new Float64Array( [ 0.0 ] );

dsyrk.ndarray( 'upper', 'no-transpose', 1, 2, 1.0, A, 2, 1, 0, 0.0, C, 1, 1, 0 );
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
-   **beta**: scalar constant.
-   **C**: input array `C`.
-   **LDC**: leading dimension of `C`.

#### dsyrk.ndarray( uplo, trans, N, K, alpha, A, strideA1, strideA2, offsetA, beta, C, strideC1, strideC2, offsetC )

Performs one of the symmetric rank k operations C := α·A·Aᵀ + β·C, or C := α·Aᵀ·A + β·C, using alternative indexing semantics.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var dsyrk = require( '@stdlib/blas/base/dsyrk' );

var A = new Float64Array( [ 1.0, 2.0 ] );
var C = new Float64Array( [ 0.0 ] );

dsyrk.ndarray( 'upper', 'no-transpose', 1, 2, 1.0, A, 2, 1, 0, 0.0, C, 1, 1, 0 );
```

The function has the following additional parameters:

-   **strideA1**: stride of dimension 1 of `A`.
-   **strideA2**: stride of dimension 2 of `A`.
-   **offsetA**: starting index for `A`.
-   **strideC1**: stride of dimension 1 of `C`.
-   **strideC2**: stride of dimension 2 of `C`.
-   **offsetC**: starting index for `C`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `dsyrk()` corresponds to the [LAPACK][lapack] level routine [`dsyrk`][lapack-dsyrk].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var dsyrk = require( '@stdlib/blas/base/dsyrk' );

var A = new Float64Array( [ 1.0, 2.0 ] );
var C = new Float64Array( [ 0.0 ] );

dsyrk.ndarray( 'upper', 'no-transpose', 1, 2, 1.0, A, 2, 1, 0, 0.0, C, 1, 1, 0 );
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

[lapack-dsyrk]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__dsyrk.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->