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

# ztrtrs

> Solves a triangular system of the form A·X = B, Aᵀ·X = B, or Aᴴ·X = B.

<section class="usage">

## Usage

```javascript
var ztrtrs = require( '@stdlib/lapack/base/ztrtrs' );
```

#### ztrtrs( order, uplo, trans, diag, N, nrhs, A, LDA, B, LDB )

Solves a triangular system of the form A·X = B, Aᵀ·X = B, or Aᴴ·X = B.

```javascript
var ztrtrs = require( '@stdlib/lapack/base/ztrtrs' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var B = discreteUniform( N * N, -10, 10, opts );

ztrtrs.ndarray( 'upper', 'no-transpose', 'non-unit', N, N, A, N, 1, 0, B, N, 1, 0 );
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **uplo**: specifies whether the upper or lower triangular part is referenced.
-   **trans**: specifies whether the matrix should be transposed.
-   **diag**: specifies whether the matrix is unit triangular.
-   **N**: number of columns.
-   **nrhs**: number of right-hand sides.
-   **A**: input array `A`.
-   **LDA**: leading dimension of `A`.
-   **B**: input array `B`.
-   **LDB**: leading dimension of `B`.

#### ztrtrs.ndarray( uplo, trans, diag, N, nrhs, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB )

Solves a triangular system of the form A·X = B, Aᵀ·X = B, or Aᴴ·X = B, using alternative indexing semantics.

```javascript
var ztrtrs = require( '@stdlib/lapack/base/ztrtrs' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var B = discreteUniform( N * N, -10, 10, opts );

ztrtrs.ndarray( 'upper', 'no-transpose', 'non-unit', N, N, A, N, 1, 0, B, N, 1, 0 );
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

-   `ztrtrs()` corresponds to the [LAPACK][lapack] level routine [`ztrtrs`][lapack-ztrtrs].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var ztrtrs = require( '@stdlib/lapack/base/ztrtrs' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var B = discreteUniform( N * N, -10, 10, opts );

ztrtrs.ndarray( 'upper', 'no-transpose', 'non-unit', N, N, A, N, 1, 0, B, N, 1, 0 );
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

[lapack-ztrtrs]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__ztrtrs.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->