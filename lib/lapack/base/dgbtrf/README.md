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

# dgbtrf

> Computes an LU factorization of a real m-by-n band matrix A using partial pivoting with row interchanges.

<section class="usage">

## Usage

```javascript
var dgbtrf = require( '@stdlib/lapack/base/dgbtrf' );
```

#### dgbtrf( order, M, N, kl, ku, AB, LDAB, IPIV, strideIPIV )

Computes an LU factorization of a real m-by-n band matrix A using partial pivoting with row interchanges.

```javascript
var dgbtrf = require( '@stdlib/lapack/base/dgbtrf' );

var N = 3;
var AB = discreteUniform( N * N, -10, 10, opts );
var IPIV = discreteUniform( N, -10, 10, opts );

dgbtrf.ndarray( N, N, N, N, AB, N, 1, 0, IPIV, 1, 0 );
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

#### dgbtrf.ndarray( M, N, kl, ku, AB, strideAB1, strideAB2, offsetAB, IPIV, strideIPIV, offsetIPIV )

Computes an LU factorization of a real m-by-n band matrix A using partial pivoting with row interchanges, using alternative indexing semantics.

```javascript
var dgbtrf = require( '@stdlib/lapack/base/dgbtrf' );

var N = 3;
var AB = discreteUniform( N * N, -10, 10, opts );
var IPIV = discreteUniform( N, -10, 10, opts );

dgbtrf.ndarray( N, N, N, N, AB, N, 1, 0, IPIV, 1, 0 );
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

-   `dgbtrf()` corresponds to the [LAPACK][lapack] level routine [`dgbtrf`][lapack-dgbtrf].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var dgbtrf = require( '@stdlib/lapack/base/dgbtrf' );

var N = 3;
var AB = discreteUniform( N * N, -10, 10, opts );
var IPIV = discreteUniform( N, -10, 10, opts );

dgbtrf.ndarray( N, N, N, N, AB, N, 1, 0, IPIV, 1, 0 );
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

[lapack-dgbtrf]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__dgbtrf.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->