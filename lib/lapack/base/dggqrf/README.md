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

# dggqrf

> Computes a generalized QR factorization of an N-by-M matrix A and an N-by-P matrix B: A = Q·R, B = Q·T·Z.

<section class="usage">

## Usage

```javascript
var dggqrf = require( '@stdlib/lapack/base/dggqrf' );
```

#### dggqrf( N, M, p, A, LDA, TAUA, strideTAUA, B, LDB, TAUB, strideTAUB, WORK, strideWORK, lwork )

Computes a generalized QR factorization of an N-by-M matrix A and an N-by-P matrix B: A = Q·R, B = Q·T·Z.

```javascript
var dggqrf = require( '@stdlib/lapack/base/dggqrf' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var B = discreteUniform( N * N, -10, 10, opts );
var TAUA = discreteUniform( N, -10, 10, opts );
var TAUB = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );

dggqrf.ndarray( N, N, 1, A, N, 1, 0, TAUA, 1, 0, B, N, 1, 0, TAUB, 1, 0, WORK, 1, 0, N );
```

The function has the following parameters:

-   **N**: number of columns.
-   **M**: number of rows.
-   **p**: `p`.
-   **A**: input array `A`.
-   **LDA**: leading dimension of `A`.
-   **TAUA**: input array `TAUA`.
-   **strideTAUA**: stride length for `TAUA`.
-   **B**: input array `B`.
-   **LDB**: leading dimension of `B`.
-   **TAUB**: input array `TAUB`.
-   **strideTAUB**: stride length for `TAUB`.
-   **WORK**: input array `WORK`.
-   **strideWORK**: stride length for `WORK`.
-   **lwork**: `lwork`.

#### dggqrf.ndarray( N, M, p, A, strideA1, strideA2, offsetA, TAUA, strideTAUA, offsetTAUA, B, strideB1, strideB2, offsetB, TAUB, strideTAUB, offsetTAUB, WORK, strideWORK, offsetWORK, lwork )

Computes a generalized QR factorization of an N-by-M matrix A and an N-by-P matrix B: A = Q·R, B = Q·T·Z, using alternative indexing semantics.

```javascript
var dggqrf = require( '@stdlib/lapack/base/dggqrf' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var B = discreteUniform( N * N, -10, 10, opts );
var TAUA = discreteUniform( N, -10, 10, opts );
var TAUB = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );

dggqrf.ndarray( N, N, 1, A, N, 1, 0, TAUA, 1, 0, B, N, 1, 0, TAUB, 1, 0, WORK, 1, 0, N );
```

The function has the following additional parameters:

-   **strideA1**: stride of dimension 1 of `A`.
-   **strideA2**: stride of dimension 2 of `A`.
-   **offsetA**: starting index for `A`.
-   **offsetTAUA**: starting index for `TAUA`.
-   **strideB1**: stride of dimension 1 of `B`.
-   **strideB2**: stride of dimension 2 of `B`.
-   **offsetB**: starting index for `B`.
-   **offsetTAUB**: starting index for `TAUB`.
-   **offsetWORK**: starting index for `WORK`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `dggqrf()` corresponds to the [LAPACK][lapack] level routine [`dggqrf`][lapack-dggqrf].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var dggqrf = require( '@stdlib/lapack/base/dggqrf' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var B = discreteUniform( N * N, -10, 10, opts );
var TAUA = discreteUniform( N, -10, 10, opts );
var TAUB = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );

dggqrf.ndarray( N, N, 1, A, N, 1, 0, TAUA, 1, 0, B, N, 1, 0, TAUB, 1, 0, WORK, 1, 0, N );
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

[lapack-dggqrf]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__dggqrf.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->