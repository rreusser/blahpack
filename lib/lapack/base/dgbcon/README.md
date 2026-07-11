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

# dgbcon

> Estimates the reciprocal of the condition number of a real general band matrix A, in either the 1-norm or the infinity-norm, using the LU factorization computed by DGBTRF.

<section class="usage">

## Usage

```javascript
var dgbcon = require( '@stdlib/lapack/base/dgbcon' );
```

#### dgbcon( norm, N, kl, ku, AB, LDAB, IPIV, strideIPIV, anorm, rcond, WORK, strideWORK, IWORK, strideIWORK )

Estimates the reciprocal of the condition number of a real general band matrix A, in either the 1-norm or the infinity-norm, using the LU factorization computed by DGBTRF.

```javascript
var dgbcon = require( '@stdlib/lapack/base/dgbcon' );

var N = 3;
var AB = discreteUniform( N * N, -10, 10, opts );
var IPIV = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );
var IWORK = discreteUniform( N, -10, 10, opts );

dgbcon.ndarray( '1', N, N, N, AB, N, 1, 0, IPIV, 1, 0, 1.0, 1.0, WORK, 1, 0, IWORK, 1, 0 );
```

The function has the following parameters:

-   **norm**: `norm`.
-   **N**: number of columns.
-   **kl**: number of subdiagonals.
-   **ku**: number of superdiagonals.
-   **AB**: input array `AB`.
-   **LDAB**: leading dimension of `AB`.
-   **IPIV**: input array `IPIV`.
-   **strideIPIV**: stride length for `IPIV`.
-   **anorm**: `anorm`.
-   **rcond**: `rcond`.
-   **WORK**: input array `WORK`.
-   **strideWORK**: stride length for `WORK`.
-   **IWORK**: input array `IWORK`.
-   **strideIWORK**: stride length for `IWORK`.

#### dgbcon.ndarray( norm, N, kl, ku, AB, strideAB1, strideAB2, offsetAB, IPIV, strideIPIV, offsetIPIV, anorm, rcond, WORK, strideWORK, offsetWORK, IWORK, strideIWORK, offsetIWORK )

Estimates the reciprocal of the condition number of a real general band matrix A, in either the 1-norm or the infinity-norm, using the LU factorization computed by DGBTRF,, using alternative indexing semantics.

```javascript
var dgbcon = require( '@stdlib/lapack/base/dgbcon' );

var N = 3;
var AB = discreteUniform( N * N, -10, 10, opts );
var IPIV = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );
var IWORK = discreteUniform( N, -10, 10, opts );

dgbcon.ndarray( '1', N, N, N, AB, N, 1, 0, IPIV, 1, 0, 1.0, 1.0, WORK, 1, 0, IWORK, 1, 0 );
```

The function has the following additional parameters:

-   **strideAB1**: stride of dimension 1 of `AB`.
-   **strideAB2**: stride of dimension 2 of `AB`.
-   **offsetAB**: starting index for `AB`.
-   **offsetIPIV**: starting index for `IPIV`.
-   **offsetWORK**: starting index for `WORK`.
-   **offsetIWORK**: starting index for `IWORK`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `dgbcon()` corresponds to the [LAPACK][lapack] level routine [`dgbcon`][lapack-dgbcon].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var dgbcon = require( '@stdlib/lapack/base/dgbcon' );

var N = 3;
var AB = discreteUniform( N * N, -10, 10, opts );
var IPIV = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );
var IWORK = discreteUniform( N, -10, 10, opts );

dgbcon.ndarray( '1', N, N, N, AB, N, 1, 0, IPIV, 1, 0, 1.0, 1.0, WORK, 1, 0, IWORK, 1, 0 );
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

[lapack-dgbcon]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__dgbcon.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->