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

# dtrsen

> Reorders the real Schur factorization of a real matrix A = Q·T·Qᵀ, so that a selected cluster of eigenvalues appears in the leading diagonal blocks of the upper quasi-triangular matrix T, and the leading columns of Q form an orthonormal basis of the corresponding right invariant subspace.

<section class="usage">

## Usage

```javascript
var dtrsen = require( '@stdlib/lapack/base/dtrsen' );
```

#### dtrsen( job, compq, SELECT, strideSELECT, N, T, LDT, Q, LDQ, WR, strideWR, WI, strideWI, M, s, sep, WORK, strideWORK, lwork, IWORK, strideIWORK, liwork )

Reorders the real Schur factorization of a real matrix A = Q·T·Qᵀ, so that a selected cluster of eigenvalues appears in the leading diagonal blocks of the upper quasi-triangular matrix T, and the leading columns of Q form an orthonormal basis of the corresponding right invariant subspace.

```javascript
var dtrsen = require( '@stdlib/lapack/base/dtrsen' );

var N = 3;
var T = discreteUniform( N * N, -10, 10, opts );
var Q = discreteUniform( N * N, -10, 10, opts );
var SELECT = discreteUniform( N, -10, 10, opts );
var WR = discreteUniform( N, -10, 10, opts );
var WI = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );
var IWORK = discreteUniform( N, -10, 10, opts );

dtrsen.ndarray( 'both', 'update', SELECT, 1, 0, N, T, N, 1, 0, Q, N, 1, 0, WR, 1, 0, WI, 1, 0, N, 1.0, 1, WORK, 1, 0, N, IWORK, 1, 0, 1 );
```

The function has the following parameters:

-   **job**: `job`.
-   **compq**: `compq`.
-   **SELECT**: input array `SELECT`.
-   **strideSELECT**: stride length for `SELECT`.
-   **N**: number of columns.
-   **T**: input array `T`.
-   **LDT**: leading dimension of `T`.
-   **Q**: input array `Q`.
-   **LDQ**: leading dimension of `Q`.
-   **WR**: input array `WR`.
-   **strideWR**: stride length for `WR`.
-   **WI**: input array `WI`.
-   **strideWI**: stride length for `WI`.
-   **M**: number of rows.
-   **s**: `s`.
-   **sep**: `sep`.
-   **WORK**: input array `WORK`.
-   **strideWORK**: stride length for `WORK`.
-   **lwork**: `lwork`.
-   **IWORK**: input array `IWORK`.
-   **strideIWORK**: stride length for `IWORK`.
-   **liwork**: `liwork`.

#### dtrsen.ndarray( job, compq, SELECT, strideSELECT, offsetSELECT, N, T, strideT1, strideT2, offsetT, Q, strideQ1, strideQ2, offsetQ, WR, strideWR, offsetWR, WI, strideWI, offsetWI, M, s, sep, WORK, strideWORK, offsetWORK, lwork, IWORK, strideIWORK, offsetIWORK, liwork )

Reorders the real Schur factorization of a real matrix A = Q·T·Qᵀ, so that a selected cluster of eigenvalues appears in the leading diagonal blocks of the upper quasi-triangular matrix T, and the leading columns of Q form an orthonormal basis of the corresponding right invariant subspace,, using alternative indexing semantics.

```javascript
var dtrsen = require( '@stdlib/lapack/base/dtrsen' );

var N = 3;
var T = discreteUniform( N * N, -10, 10, opts );
var Q = discreteUniform( N * N, -10, 10, opts );
var SELECT = discreteUniform( N, -10, 10, opts );
var WR = discreteUniform( N, -10, 10, opts );
var WI = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );
var IWORK = discreteUniform( N, -10, 10, opts );

dtrsen.ndarray( 'both', 'update', SELECT, 1, 0, N, T, N, 1, 0, Q, N, 1, 0, WR, 1, 0, WI, 1, 0, N, 1.0, 1, WORK, 1, 0, N, IWORK, 1, 0, 1 );
```

The function has the following additional parameters:

-   **offsetSELECT**: starting index for `SELECT`.
-   **strideT1**: stride of dimension 1 of `T`.
-   **strideT2**: stride of dimension 2 of `T`.
-   **offsetT**: starting index for `T`.
-   **strideQ1**: stride of dimension 1 of `Q`.
-   **strideQ2**: stride of dimension 2 of `Q`.
-   **offsetQ**: starting index for `Q`.
-   **offsetWR**: starting index for `WR`.
-   **offsetWI**: starting index for `WI`.
-   **offsetWORK**: starting index for `WORK`.
-   **offsetIWORK**: starting index for `IWORK`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `dtrsen()` corresponds to the [LAPACK][lapack] level routine [`dtrsen`][lapack-dtrsen].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var dtrsen = require( '@stdlib/lapack/base/dtrsen' );

var N = 3;
var T = discreteUniform( N * N, -10, 10, opts );
var Q = discreteUniform( N * N, -10, 10, opts );
var SELECT = discreteUniform( N, -10, 10, opts );
var WR = discreteUniform( N, -10, 10, opts );
var WI = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );
var IWORK = discreteUniform( N, -10, 10, opts );

dtrsen.ndarray( 'both', 'update', SELECT, 1, 0, N, T, N, 1, 0, Q, N, 1, 0, WR, 1, 0, WI, 1, 0, N, 1.0, 1, WORK, 1, 0, N, IWORK, 1, 0, 1 );
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

[lapack-dtrsen]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__dtrsen.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->