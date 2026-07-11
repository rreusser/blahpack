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

# zhgeqz

> Computes the eigenvalues of a complex matrix pair (H,T).

<section class="usage">

## Usage

```javascript
var zhgeqz = require( '@stdlib/lapack/base/zhgeqz' );
```

#### zhgeqz( order, job, compq, compz, N, ilo, ihi, H, LDH, T, LDT, ALPHA, strideALPHA, BETA, strideBETA, Q, LDQ, Z, LDZ, WORK, strideWORK, lwork, RWORK, strideRWORK )

Computes the eigenvalues of a complex matrix pair (H,T).

```javascript
var zhgeqz = require( '@stdlib/lapack/base/zhgeqz' );

var N = 3;
var H = discreteUniform( N * N, -10, 10, opts );
var T = discreteUniform( N * N, -10, 10, opts );
var Q = discreteUniform( N * N, -10, 10, opts );
var Z = discreteUniform( N * N, -10, 10, opts );
var ALPHA = discreteUniform( N, -10, 10, opts );
var BETA = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );
var RWORK = discreteUniform( N, -10, 10, opts );

zhgeqz.ndarray( 'both', 'update', 'update', N, N, N, H, N, 1, 0, T, N, 1, 0, ALPHA, 1, 0, BETA, 1, 0, Q, N, 1, 0, Z, N, 1, 0, WORK, 1, 0, N, RWORK, 1, 0 );
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **job**: `job`.
-   **compq**: `compq`.
-   **compz**: `compz`.
-   **N**: number of columns.
-   **ilo**: `ilo`.
-   **ihi**: `ihi`.
-   **H**: input array `H`.
-   **LDH**: leading dimension of `H`.
-   **T**: input array `T`.
-   **LDT**: leading dimension of `T`.
-   **ALPHA**: input array `ALPHA`.
-   **strideALPHA**: stride length for `ALPHA`.
-   **BETA**: input array `BETA`.
-   **strideBETA**: stride length for `BETA`.
-   **Q**: input array `Q`.
-   **LDQ**: leading dimension of `Q`.
-   **Z**: input array `Z`.
-   **LDZ**: leading dimension of `Z`.
-   **WORK**: input array `WORK`.
-   **strideWORK**: stride length for `WORK`.
-   **lwork**: `lwork`.
-   **RWORK**: input array `RWORK`.
-   **strideRWORK**: stride length for `RWORK`.

#### zhgeqz.ndarray( job, compq, compz, N, ilo, ihi, H, strideH1, strideH2, offsetH, T, strideT1, strideT2, offsetT, ALPHA, strideALPHA, offsetALPHA, BETA, strideBETA, offsetBETA, Q, strideQ1, strideQ2, offsetQ, Z, strideZ1, strideZ2, offsetZ, WORK, strideWORK, offsetWORK, lwork, RWORK, strideRWORK, offsetRWORK )

Computes the eigenvalues of a complex matrix pair (H,T), using alternative indexing semantics.

```javascript
var zhgeqz = require( '@stdlib/lapack/base/zhgeqz' );

var N = 3;
var H = discreteUniform( N * N, -10, 10, opts );
var T = discreteUniform( N * N, -10, 10, opts );
var Q = discreteUniform( N * N, -10, 10, opts );
var Z = discreteUniform( N * N, -10, 10, opts );
var ALPHA = discreteUniform( N, -10, 10, opts );
var BETA = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );
var RWORK = discreteUniform( N, -10, 10, opts );

zhgeqz.ndarray( 'both', 'update', 'update', N, N, N, H, N, 1, 0, T, N, 1, 0, ALPHA, 1, 0, BETA, 1, 0, Q, N, 1, 0, Z, N, 1, 0, WORK, 1, 0, N, RWORK, 1, 0 );
```

The function has the following additional parameters:

-   **strideH1**: stride of dimension 1 of `H`.
-   **strideH2**: stride of dimension 2 of `H`.
-   **offsetH**: starting index for `H`.
-   **strideT1**: stride of dimension 1 of `T`.
-   **strideT2**: stride of dimension 2 of `T`.
-   **offsetT**: starting index for `T`.
-   **offsetALPHA**: starting index for `ALPHA`.
-   **offsetBETA**: starting index for `BETA`.
-   **strideQ1**: stride of dimension 1 of `Q`.
-   **strideQ2**: stride of dimension 2 of `Q`.
-   **offsetQ**: starting index for `Q`.
-   **strideZ1**: stride of dimension 1 of `Z`.
-   **strideZ2**: stride of dimension 2 of `Z`.
-   **offsetZ**: starting index for `Z`.
-   **offsetWORK**: starting index for `WORK`.
-   **offsetRWORK**: starting index for `RWORK`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `zhgeqz()` corresponds to the [LAPACK][lapack] level routine [`zhgeqz`][lapack-zhgeqz].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var zhgeqz = require( '@stdlib/lapack/base/zhgeqz' );

var N = 3;
var H = discreteUniform( N * N, -10, 10, opts );
var T = discreteUniform( N * N, -10, 10, opts );
var Q = discreteUniform( N * N, -10, 10, opts );
var Z = discreteUniform( N * N, -10, 10, opts );
var ALPHA = discreteUniform( N, -10, 10, opts );
var BETA = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );
var RWORK = discreteUniform( N, -10, 10, opts );

zhgeqz.ndarray( 'both', 'update', 'update', N, N, N, H, N, 1, 0, T, N, 1, 0, ALPHA, 1, 0, BETA, 1, 0, Q, N, 1, 0, Z, N, 1, 0, WORK, 1, 0, N, RWORK, 1, 0 );
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

[lapack-zhgeqz]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__zhgeqz.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->