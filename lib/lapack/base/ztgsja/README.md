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

# ztgsja

> Computes the generalized singular value decomposition (GSVD) of two complex upper triangular (or trapezoidal) matrices A and B.

<section class="usage">

## Usage

```javascript
var ztgsja = require( '@stdlib/lapack/base/ztgsja' );
```

#### ztgsja( jobu, jobv, jobq, M, p, N, K, l, A, LDA, B, LDB, tola, tolb, ALPHA, BETA, U, LDU, V, LDV, Q, LDQ, WORK, ncycle )

Computes the generalized singular value decomposition (GSVD) of two complex upper triangular (or trapezoidal) matrices A and B.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Complex128Array = require( '@stdlib/array/complex128' );
var Int32Array = require( '@stdlib/array/int32' );
var ztgsja = require( '@stdlib/lapack/base/ztgsja' );

var M = 2;
var P = 2;
var N = 2;
var K = 0;
var L = 2;
var A = new Complex128Array( M * N );
var B = new Complex128Array( P * N );
var ALPHA = new Float64Array( N );
var BETA = new Float64Array( N );
var U = new Complex128Array( M * M );
var V = new Complex128Array( P * P );
var Q = new Complex128Array( N * N );
var WORK = new Complex128Array( 2 * N );
var ncycle = new Int32Array( 1 );

ztgsja.ndarray( 'initialize', 'initialize', 'initialize', M, P, N, K, L, A, 1, M, 0, B, 1, P, 0, 1e-14, 1e-14, ALPHA, 1, 0, BETA, 1, 0, U, 1, M, 0, V, 1, P, 0, Q, 1, N, 0, WORK, 1, 0, ncycle );
```

The function has the following parameters:

-   **jobu**: `jobu`.
-   **jobv**: `jobv`.
-   **jobq**: `jobq`.
-   **M**: number of rows.
-   **p**: `p`.
-   **N**: number of columns.
-   **K**: inner dimension.
-   **l**: `l`.
-   **A**: input array `A`.
-   **LDA**: leading dimension of `A`.
-   **B**: input array `B`.
-   **LDB**: leading dimension of `B`.
-   **tola**: `tola`.
-   **tolb**: `tolb`.
-   **ALPHA**: input array `ALPHA`.
-   **BETA**: input array `BETA`.
-   **U**: input array `U`.
-   **LDU**: leading dimension of `U`.
-   **V**: input array `V`.
-   **LDV**: leading dimension of `V`.
-   **Q**: input array `Q`.
-   **LDQ**: leading dimension of `Q`.
-   **WORK**: input array `WORK`.
-   **ncycle**: `ncycle`.

#### ztgsja.ndarray( jobu, jobv, jobq, M, p, N, K, l, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, tola, tolb, ALPHA, strideALPHA, offsetALPHA, BETA, strideBETA, offsetBETA, U, strideU1, strideU2, offsetU, V, strideV1, strideV2, offsetV, Q, strideQ1, strideQ2, offsetQ, WORK, strideWORK, offsetWORK, ncycle )

Computes the generalized singular value decomposition (GSVD) of two complex upper triangular (or trapezoidal) matrices A and B, using alternative indexing semantics.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Complex128Array = require( '@stdlib/array/complex128' );
var Int32Array = require( '@stdlib/array/int32' );
var ztgsja = require( '@stdlib/lapack/base/ztgsja' );

var M = 2;
var P = 2;
var N = 2;
var K = 0;
var L = 2;
var A = new Complex128Array( M * N );
var B = new Complex128Array( P * N );
var ALPHA = new Float64Array( N );
var BETA = new Float64Array( N );
var U = new Complex128Array( M * M );
var V = new Complex128Array( P * P );
var Q = new Complex128Array( N * N );
var WORK = new Complex128Array( 2 * N );
var ncycle = new Int32Array( 1 );

ztgsja.ndarray( 'initialize', 'initialize', 'initialize', M, P, N, K, L, A, 1, M, 0, B, 1, P, 0, 1e-14, 1e-14, ALPHA, 1, 0, BETA, 1, 0, U, 1, M, 0, V, 1, P, 0, Q, 1, N, 0, WORK, 1, 0, ncycle );
```

The function has the following additional parameters:

-   **strideA1**: stride of dimension 1 of `A`.
-   **strideA2**: stride of dimension 2 of `A`.
-   **offsetA**: starting index for `A`.
-   **strideB1**: stride of dimension 1 of `B`.
-   **strideB2**: stride of dimension 2 of `B`.
-   **offsetB**: starting index for `B`.
-   **strideALPHA**: stride length for `ALPHA`.
-   **offsetALPHA**: starting index for `ALPHA`.
-   **strideBETA**: stride length for `BETA`.
-   **offsetBETA**: starting index for `BETA`.
-   **strideU1**: stride of dimension 1 of `U`.
-   **strideU2**: stride of dimension 2 of `U`.
-   **offsetU**: starting index for `U`.
-   **strideV1**: stride of dimension 1 of `V`.
-   **strideV2**: stride of dimension 2 of `V`.
-   **offsetV**: starting index for `V`.
-   **strideQ1**: stride of dimension 1 of `Q`.
-   **strideQ2**: stride of dimension 2 of `Q`.
-   **offsetQ**: starting index for `Q`.
-   **strideWORK**: stride length for `WORK`.
-   **offsetWORK**: starting index for `WORK`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `ztgsja()` corresponds to the [LAPACK][lapack] level routine [`ztgsja`][lapack-ztgsja].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Complex128Array = require( '@stdlib/array/complex128' );
var Int32Array = require( '@stdlib/array/int32' );
var ztgsja = require( '@stdlib/lapack/base/ztgsja' );

var M = 2;
var P = 2;
var N = 2;
var K = 0;
var L = 2;
var A = new Complex128Array( M * N );
var B = new Complex128Array( P * N );
var ALPHA = new Float64Array( N );
var BETA = new Float64Array( N );
var U = new Complex128Array( M * M );
var V = new Complex128Array( P * P );
var Q = new Complex128Array( N * N );
var WORK = new Complex128Array( 2 * N );
var ncycle = new Int32Array( 1 );

ztgsja.ndarray( 'initialize', 'initialize', 'initialize', M, P, N, K, L, A, 1, M, 0, B, 1, P, 0, 1e-14, 1e-14, ALPHA, 1, 0, BETA, 1, 0, U, 1, M, 0, V, 1, P, 0, Q, 1, N, 0, WORK, 1, 0, ncycle );
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

[lapack-ztgsja]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__ztgsja.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->