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

# ztrsen

> Reorders the Schur factorization of a complex matrix A = Q·T·Qᴴ, so that a selected cluster of eigenvalues appears in the leading positions on the diagonal of the upper triangular matrix T, and the leading columns of Q form an orthonormal basis of the corresponding right invariant subspace.

<section class="usage">

## Usage

```javascript
var ztrsen = require( '@stdlib/lapack/base/ztrsen' );
```

#### ztrsen( job, compq, SELECT, strideSELECT, N, T, LDT, Q, LDQ, W, strideW, M, s, sep, WORK, strideWORK, lwork )

Reorders the Schur factorization of a complex matrix A = Q·T·Qᴴ, so that a selected cluster of eigenvalues appears in the leading positions on the diagonal of the upper triangular matrix T, and the leading columns of Q form an orthonormal basis of the corresponding right invariant subspace.

```javascript
var ztrsen = require( '@stdlib/lapack/base/ztrsen' );

var N = 3;
var T = discreteUniform( N * N, -10, 10, opts );
var Q = discreteUniform( N * N, -10, 10, opts );
var SELECT = discreteUniform( N, -10, 10, opts );
var W = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );

ztrsen.ndarray( 'both', 'update', SELECT, 1, 0, N, T, N, 1, 0, Q, N, 1, 0, W, 1, 0, N, 1.0, 1, WORK, 1, 0, N );
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
-   **W**: input array `W`.
-   **strideW**: stride length for `W`.
-   **M**: number of rows.
-   **s**: `s`.
-   **sep**: `sep`.
-   **WORK**: input array `WORK`.
-   **strideWORK**: stride length for `WORK`.
-   **lwork**: `lwork`.

#### ztrsen.ndarray( job, compq, SELECT, strideSELECT, offsetSELECT, N, T, strideT1, strideT2, offsetT, Q, strideQ1, strideQ2, offsetQ, W, strideW, offsetW, M, s, sep, WORK, strideWORK, offsetWORK, lwork )

Reorders the Schur factorization of a complex matrix A = Q·T·Qᴴ, so that a selected cluster of eigenvalues appears in the leading positions on the diagonal of the upper triangular matrix T, and the leading columns of Q form an orthonormal basis of the corresponding right invariant subspace, using alternative indexing semantics.

```javascript
var ztrsen = require( '@stdlib/lapack/base/ztrsen' );

var N = 3;
var T = discreteUniform( N * N, -10, 10, opts );
var Q = discreteUniform( N * N, -10, 10, opts );
var SELECT = discreteUniform( N, -10, 10, opts );
var W = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );

ztrsen.ndarray( 'both', 'update', SELECT, 1, 0, N, T, N, 1, 0, Q, N, 1, 0, W, 1, 0, N, 1.0, 1, WORK, 1, 0, N );
```

The function has the following additional parameters:

-   **offsetSELECT**: starting index for `SELECT`.
-   **strideT1**: stride of dimension 1 of `T`.
-   **strideT2**: stride of dimension 2 of `T`.
-   **offsetT**: starting index for `T`.
-   **strideQ1**: stride of dimension 1 of `Q`.
-   **strideQ2**: stride of dimension 2 of `Q`.
-   **offsetQ**: starting index for `Q`.
-   **offsetW**: starting index for `W`.
-   **offsetWORK**: starting index for `WORK`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `ztrsen()` corresponds to the [LAPACK][lapack] level routine [`ztrsen`][lapack-ztrsen].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var ztrsen = require( '@stdlib/lapack/base/ztrsen' );

var N = 3;
var T = discreteUniform( N * N, -10, 10, opts );
var Q = discreteUniform( N * N, -10, 10, opts );
var SELECT = discreteUniform( N, -10, 10, opts );
var W = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );

ztrsen.ndarray( 'both', 'update', SELECT, 1, 0, N, T, N, 1, 0, Q, N, 1, 0, W, 1, 0, N, 1.0, 1, WORK, 1, 0, N );
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

[lapack-ztrsen]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__ztrsen.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->