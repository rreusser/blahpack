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

# dgbtf2

> Computes the LU factorization of a general band matrix using the unblocked version of the algorithm.

<section class="usage">

## Usage

```javascript
var dgbtf2 = require( '@stdlib/lapack/base/dgbtf2' );
```

#### dgbtf2( order, M, N, kl, ku, AB, LDAB, IPIV, strideIPIV )

Computes the LU factorization of a general band matrix using the unblocked version of the algorithm.

```javascript
var dgbtf2 = require( '@stdlib/lapack/base/dgbtf2' );

var N = 3;
var AB = discreteUniform( N * N, -10, 10, opts );
var IPIV = discreteUniform( N, -10, 10, opts );

dgbtf2.ndarray( N, N, N, N, AB, N, 1, 0, IPIV, 1, 0 );
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **M**: number of rows.
-   **N**: number of columns.
-   **kl**: number of subdiagonals.
-   **ku**: number of superdiagonals.
-   **AB**: input array `AB`.
-   **LDAB**: leading dimension of `AB`.
-   **IPIV**: input array `IPIV`.
-   **strideIPIV**: stride length for `IPIV`.

#### dgbtf2.ndarray( M, N, kl, ku, AB, strideAB1, strideAB2, offsetAB, IPIV, strideIPIV, offsetIPIV )

Computes the LU factorization of a general band matrix using the unblocked version of the algorithm, using alternative indexing semantics.

```javascript
var dgbtf2 = require( '@stdlib/lapack/base/dgbtf2' );

var N = 3;
var AB = discreteUniform( N * N, -10, 10, opts );
var IPIV = discreteUniform( N, -10, 10, opts );

dgbtf2.ndarray( N, N, N, N, AB, N, 1, 0, IPIV, 1, 0 );
```

The function has the following additional parameters:

-   **strideAB1**: stride of dimension 1 of `AB`.
-   **strideAB2**: stride of dimension 2 of `AB`.
-   **offsetAB**: starting index for `AB`.
-   **offsetIPIV**: starting index for `IPIV`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `dgbtf2()` corresponds to the [LAPACK][lapack] level routine [`dgbtf2`][lapack-dgbtf2].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var dgbtf2 = require( '@stdlib/lapack/base/dgbtf2' );

var N = 3;
var AB = discreteUniform( N * N, -10, 10, opts );
var IPIV = discreteUniform( N, -10, 10, opts );

dgbtf2.ndarray( N, N, N, N, AB, N, 1, 0, IPIV, 1, 0 );
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

[lapack-dgbtf2]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__dgbtf2.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->