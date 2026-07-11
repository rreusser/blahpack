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

# dgbtrs

> Solves a system of linear equations A·X = B or Aᵀ·X = B with a general band matrix A using the LU factorization computed by DGBTRF.

<section class="usage">

## Usage

```javascript
var dgbtrs = require( '@stdlib/lapack/base/dgbtrs' );
```

#### dgbtrs( order, trans, N, kl, ku, nrhs, AB, LDAB, IPIV, strideIPIV, B, LDB )

Solves a system of linear equations A·X = B or Aᵀ·X = B with a general band matrix A using the LU factorization computed by DGBTRF.

```javascript
var dgbtrs = require( '@stdlib/lapack/base/dgbtrs' );

var N = 3;
var AB = discreteUniform( N * N, -10, 10, opts );
var B = discreteUniform( N * N, -10, 10, opts );
var IPIV = discreteUniform( N, -10, 10, opts );

dgbtrs.ndarray( 'no-transpose', N, N, N, N, AB, N, 1, 0, IPIV, 1, 0, B, N, 1, 0 );
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **trans**: specifies whether the matrix should be transposed.
-   **N**: number of columns.
-   **kl**: number of subdiagonals.
-   **ku**: number of superdiagonals.
-   **nrhs**: number of right-hand sides.
-   **AB**: input array `AB`.
-   **LDAB**: leading dimension of `AB`.
-   **IPIV**: input array `IPIV`.
-   **strideIPIV**: stride length for `IPIV`.
-   **B**: input array `B`.
-   **LDB**: leading dimension of `B`.

#### dgbtrs.ndarray( trans, N, kl, ku, nrhs, AB, strideAB1, strideAB2, offsetAB, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB )

Solves a system of linear equations A·X = B or Aᵀ·X = B with a general band matrix A using the LU factorization computed by DGBTRF, using alternative indexing semantics.

```javascript
var dgbtrs = require( '@stdlib/lapack/base/dgbtrs' );

var N = 3;
var AB = discreteUniform( N * N, -10, 10, opts );
var B = discreteUniform( N * N, -10, 10, opts );
var IPIV = discreteUniform( N, -10, 10, opts );

dgbtrs.ndarray( 'no-transpose', N, N, N, N, AB, N, 1, 0, IPIV, 1, 0, B, N, 1, 0 );
```

The function has the following additional parameters:

-   **strideAB1**: stride of dimension 1 of `AB`.
-   **strideAB2**: stride of dimension 2 of `AB`.
-   **offsetAB**: starting index for `AB`.
-   **offsetIPIV**: starting index for `IPIV`.
-   **strideB1**: stride of dimension 1 of `B`.
-   **strideB2**: stride of dimension 2 of `B`.
-   **offsetB**: starting index for `B`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `dgbtrs()` corresponds to the [LAPACK][lapack] level routine [`dgbtrs`][lapack-dgbtrs].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var dgbtrs = require( '@stdlib/lapack/base/dgbtrs' );

var N = 3;
var AB = discreteUniform( N * N, -10, 10, opts );
var B = discreteUniform( N * N, -10, 10, opts );
var IPIV = discreteUniform( N, -10, 10, opts );

dgbtrs.ndarray( 'no-transpose', N, N, N, N, AB, N, 1, 0, IPIV, 1, 0, B, N, 1, 0 );
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

[lapack-dgbtrs]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__dgbtrs.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->