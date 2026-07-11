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

# zgetrs

> Solves a system of linear equations A·X = B, Aᵀ·X = B, or Aᴴ·X = B with a general N-by-N matrix A using the LU factorization computed by ZGETRF.

<section class="usage">

## Usage

```javascript
var zgetrs = require( '@stdlib/lapack/base/zgetrs' );
```

#### zgetrs( order, trans, N, nrhs, A, LDA, IPIV, strideIPIV, B, LDB )

Solves a system of linear equations A·X = B, Aᵀ·X = B, or Aᴴ·X = B with a general N-by-N matrix A using the LU factorization computed by ZGETRF.

```javascript
var zgetrs = require( '@stdlib/lapack/base/zgetrs' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var B = discreteUniform( N * N, -10, 10, opts );
var IPIV = discreteUniform( N, -10, 10, opts );

zgetrs.ndarray( 'no-transpose', N, N, A, N, 1, 0, IPIV, 1, 0, B, N, 1, 0 );
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **trans**: specifies whether the matrix should be transposed.
-   **N**: number of columns.
-   **nrhs**: number of right-hand sides.
-   **A**: input array `A`.
-   **LDA**: leading dimension of `A`.
-   **IPIV**: input array `IPIV`.
-   **strideIPIV**: stride length for `IPIV`.
-   **B**: input array `B`.
-   **LDB**: leading dimension of `B`.

#### zgetrs.ndarray( trans, N, nrhs, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB )

Solves a system of linear equations A·X = B, Aᵀ·X = B, or Aᴴ·X = B with a general N-by-N matrix A using the LU factorization computed by ZGETRF, using alternative indexing semantics.

```javascript
var zgetrs = require( '@stdlib/lapack/base/zgetrs' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var B = discreteUniform( N * N, -10, 10, opts );
var IPIV = discreteUniform( N, -10, 10, opts );

zgetrs.ndarray( 'no-transpose', N, N, A, N, 1, 0, IPIV, 1, 0, B, N, 1, 0 );
```

The function has the following additional parameters:

-   **strideA1**: stride of dimension 1 of `A`.
-   **strideA2**: stride of dimension 2 of `A`.
-   **offsetA**: starting index for `A`.
-   **offsetIPIV**: starting index for `IPIV`.
-   **strideB1**: stride of dimension 1 of `B`.
-   **strideB2**: stride of dimension 2 of `B`.
-   **offsetB**: starting index for `B`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `zgetrs()` corresponds to the [LAPACK][lapack] level routine [`zgetrs`][lapack-zgetrs].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var zgetrs = require( '@stdlib/lapack/base/zgetrs' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var B = discreteUniform( N * N, -10, 10, opts );
var IPIV = discreteUniform( N, -10, 10, opts );

zgetrs.ndarray( 'no-transpose', N, N, A, N, 1, 0, IPIV, 1, 0, B, N, 1, 0 );
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

[lapack-zgetrs]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__zgetrs.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->