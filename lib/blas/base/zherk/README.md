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

# zherk

> Performs one of the Hermitian rank k operations C := α·A·Aᴴ + β·C, or C := α·Aᴴ·A + β·C.

<section class="usage">

## Usage

```javascript
var zherk = require( '@stdlib/blas/base/zherk' );
```

#### zherk( order, uplo, trans, N, K, alpha, A, LDA, beta, C, LDC )

Performs one of the Hermitian rank k operations C := α·A·Aᴴ + β·C, or C := α·Aᴴ·A + β·C.

```javascript
var zherk = require( '@stdlib/blas/base/zherk' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var C = discreteUniform( N * N, -10, 10, opts );

zherk.ndarray( 'upper', 'no-transpose', N, N, 1.0, A, N, 1, 0, 1.0, C, N, 1, 0 );
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

#### zherk.ndarray( uplo, trans, N, K, alpha, A, strideA1, strideA2, offsetA, beta, C, strideC1, strideC2, offsetC )

Performs one of the Hermitian rank k operations C := α·A·Aᴴ + β·C, or C := α·Aᴴ·A + β·C, using alternative indexing semantics.

```javascript
var zherk = require( '@stdlib/blas/base/zherk' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var C = discreteUniform( N * N, -10, 10, opts );

zherk.ndarray( 'upper', 'no-transpose', N, N, 1.0, A, N, 1, 0, 1.0, C, N, 1, 0 );
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

-   `zherk()` corresponds to the [LAPACK][lapack] level routine [`zherk`][lapack-zherk].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var zherk = require( '@stdlib/blas/base/zherk' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var C = discreteUniform( N * N, -10, 10, opts );

zherk.ndarray( 'upper', 'no-transpose', N, N, 1.0, A, N, 1, 0, 1.0, C, N, 1, 0 );
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

[lapack-zherk]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__zherk.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->