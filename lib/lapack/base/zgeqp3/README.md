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

# zgeqp3

> Computes a QR factorization with column pivoting of a matrix A: A·P = Q·R using Level 3 BLAS.

<section class="usage">

## Usage

```javascript
var zgeqp3 = require( '@stdlib/lapack/base/zgeqp3' );
```

#### zgeqp3( order, M, N, A, LDA, JPVT, strideJPVT, TAU, strideTAU, WORK, strideWORK, lwork, RWORK, strideRWORK )

Computes a QR factorization with column pivoting of a matrix A: A·P = Q·R using Level 3 BLAS.

```javascript
var zgeqp3 = require( '@stdlib/lapack/base/zgeqp3' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var JPVT = discreteUniform( N, -10, 10, opts );
var TAU = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );
var RWORK = discreteUniform( N, -10, 10, opts );

zgeqp3.ndarray( N, N, A, N, 1, 0, JPVT, 1, 0, TAU, 1, 0, WORK, 1, 0, N, RWORK, 1, 0 );
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **M**: number of rows.
-   **N**: number of columns.
-   **A**: input array `A`.
-   **LDA**: leading dimension of `A`.
-   **JPVT**: input array `JPVT`.
-   **strideJPVT**: stride length for `JPVT`.
-   **TAU**: input array `TAU`.
-   **strideTAU**: stride length for `TAU`.
-   **WORK**: input array `WORK`.
-   **strideWORK**: stride length for `WORK`.
-   **lwork**: `lwork`.
-   **RWORK**: input array `RWORK`.
-   **strideRWORK**: stride length for `RWORK`.

#### zgeqp3.ndarray( M, N, A, strideA1, strideA2, offsetA, JPVT, strideJPVT, offsetJPVT, TAU, strideTAU, offsetTAU, WORK, strideWORK, offsetWORK, lwork, RWORK, strideRWORK, offsetRWORK )

Computes a QR factorization with column pivoting of a matrix A: A·P = Q·R using Level 3 BLAS, using alternative indexing semantics.

```javascript
var zgeqp3 = require( '@stdlib/lapack/base/zgeqp3' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var JPVT = discreteUniform( N, -10, 10, opts );
var TAU = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );
var RWORK = discreteUniform( N, -10, 10, opts );

zgeqp3.ndarray( N, N, A, N, 1, 0, JPVT, 1, 0, TAU, 1, 0, WORK, 1, 0, N, RWORK, 1, 0 );
```

The function has the following additional parameters:

-   **strideA1**: stride of dimension 1 of `A`.
-   **strideA2**: stride of dimension 2 of `A`.
-   **offsetA**: starting index for `A`.
-   **offsetJPVT**: starting index for `JPVT`.
-   **offsetTAU**: starting index for `TAU`.
-   **offsetWORK**: starting index for `WORK`.
-   **offsetRWORK**: starting index for `RWORK`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `zgeqp3()` corresponds to the [LAPACK][lapack] level routine [`zgeqp3`][lapack-zgeqp3].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var zgeqp3 = require( '@stdlib/lapack/base/zgeqp3' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var JPVT = discreteUniform( N, -10, 10, opts );
var TAU = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );
var RWORK = discreteUniform( N, -10, 10, opts );

zgeqp3.ndarray( N, N, A, N, 1, 0, JPVT, 1, 0, TAU, 1, 0, WORK, 1, 0, N, RWORK, 1, 0 );
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

[lapack-zgeqp3]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__zgeqp3.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->