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

# dggsvp3

> Computes orthogonal matrices U, V, and Q that reduce a matrix pair to triangular form for the generalized SVD.

<section class="usage">

## Usage

```javascript
var dggsvp3 = require( '@stdlib/lapack/base/dggsvp3' );
```

#### dggsvp3( jobu, jobv, jobq, M, p, N, A, LDA, B, LDB, tola, tolb, K, l, U, LDU, V, LDV, Q, LDQ, IWORK, strideIWORK, TAU, strideTAU, WORK, strideWORK, lwork )

Computes orthogonal matrices U, V, and Q that reduce a matrix pair to triangular form for the generalized SVD.

```javascript
var dggsvp3 = require( '@stdlib/lapack/base/dggsvp3' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var B = discreteUniform( N * N, -10, 10, opts );
var U = discreteUniform( N * N, -10, 10, opts );
var V = discreteUniform( N * N, -10, 10, opts );
var Q = discreteUniform( N * N, -10, 10, opts );
var IWORK = discreteUniform( N, -10, 10, opts );
var TAU = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );

dggsvp3.ndarray( 'compute-U', 'compute-V', 'compute-Q', N, 1, N, A, N, 1, 0, B, N, 1, 0, 1, 1, N, 1, U, N, 1, 0, V, N, 1, 0, Q, N, 1, 0, IWORK, 1, 0, TAU, 1, 0, WORK, 1, 0, N );
```

The function has the following parameters:

-   **jobu**: `jobu`.
-   **jobv**: `jobv`.
-   **jobq**: `jobq`.
-   **M**: number of rows.
-   **p**: `p`.
-   **N**: number of columns.
-   **A**: input array `A`.
-   **LDA**: leading dimension of `A`.
-   **B**: input array `B`.
-   **LDB**: leading dimension of `B`.
-   **tola**: `tola`.
-   **tolb**: `tolb`.
-   **K**: inner dimension.
-   **l**: `l`.
-   **U**: input array `U`.
-   **LDU**: leading dimension of `U`.
-   **V**: input array `V`.
-   **LDV**: leading dimension of `V`.
-   **Q**: input array `Q`.
-   **LDQ**: leading dimension of `Q`.
-   **IWORK**: input array `IWORK`.
-   **strideIWORK**: stride length for `IWORK`.
-   **TAU**: input array `TAU`.
-   **strideTAU**: stride length for `TAU`.
-   **WORK**: input array `WORK`.
-   **strideWORK**: stride length for `WORK`.
-   **lwork**: `lwork`.

#### dggsvp3.ndarray( jobu, jobv, jobq, M, p, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, tola, tolb, K, l, U, strideU1, strideU2, offsetU, V, strideV1, strideV2, offsetV, Q, strideQ1, strideQ2, offsetQ, IWORK, strideIWORK, offsetIWORK, TAU, strideTAU, offsetTAU, WORK, strideWORK, offsetWORK, lwork )

Computes orthogonal matrices U, V, and Q that reduce a matrix pair to triangular form for the generalized SVD, using alternative indexing semantics.

```javascript
var dggsvp3 = require( '@stdlib/lapack/base/dggsvp3' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var B = discreteUniform( N * N, -10, 10, opts );
var U = discreteUniform( N * N, -10, 10, opts );
var V = discreteUniform( N * N, -10, 10, opts );
var Q = discreteUniform( N * N, -10, 10, opts );
var IWORK = discreteUniform( N, -10, 10, opts );
var TAU = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );

dggsvp3.ndarray( 'compute-U', 'compute-V', 'compute-Q', N, 1, N, A, N, 1, 0, B, N, 1, 0, 1, 1, N, 1, U, N, 1, 0, V, N, 1, 0, Q, N, 1, 0, IWORK, 1, 0, TAU, 1, 0, WORK, 1, 0, N );
```

The function has the following additional parameters:

-   **strideA1**: stride of dimension 1 of `A`.
-   **strideA2**: stride of dimension 2 of `A`.
-   **offsetA**: starting index for `A`.
-   **strideB1**: stride of dimension 1 of `B`.
-   **strideB2**: stride of dimension 2 of `B`.
-   **offsetB**: starting index for `B`.
-   **strideU1**: stride of dimension 1 of `U`.
-   **strideU2**: stride of dimension 2 of `U`.
-   **offsetU**: starting index for `U`.
-   **strideV1**: stride of dimension 1 of `V`.
-   **strideV2**: stride of dimension 2 of `V`.
-   **offsetV**: starting index for `V`.
-   **strideQ1**: stride of dimension 1 of `Q`.
-   **strideQ2**: stride of dimension 2 of `Q`.
-   **offsetQ**: starting index for `Q`.
-   **offsetIWORK**: starting index for `IWORK`.
-   **offsetTAU**: starting index for `TAU`.
-   **offsetWORK**: starting index for `WORK`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `dggsvp3()` corresponds to the [LAPACK][lapack] level routine [`dggsvp3`][lapack-dggsvp3].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var dggsvp3 = require( '@stdlib/lapack/base/dggsvp3' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var B = discreteUniform( N * N, -10, 10, opts );
var U = discreteUniform( N * N, -10, 10, opts );
var V = discreteUniform( N * N, -10, 10, opts );
var Q = discreteUniform( N * N, -10, 10, opts );
var IWORK = discreteUniform( N, -10, 10, opts );
var TAU = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );

dggsvp3.ndarray( 'compute-U', 'compute-V', 'compute-Q', N, 1, N, A, N, 1, 0, B, N, 1, 0, 1, 1, N, 1, U, N, 1, 0, V, N, 1, 0, Q, N, 1, 0, IWORK, 1, 0, TAU, 1, 0, WORK, 1, 0, N );
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

[lapack-dggsvp3]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__dggsvp3.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->