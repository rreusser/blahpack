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

# zhseqr

> Computes the eigenvalues of a Hessenberg matrix H and, optionally, the matrices T and Z from the Schur decomposition H = Z T Zᴴ.

<section class="usage">

## Usage

```javascript
var zhseqr = require( '@stdlib/lapack/base/zhseqr' );
```

#### zhseqr( job, compz, N, ilo, ihi, H, LDH, w, strideW, Z, LDZ, WORK, strideWORK, lwork )

Computes the eigenvalues of a Hessenberg matrix H and, optionally, the matrices T and Z from the Schur decomposition H = Z T Zᴴ.

```javascript
var zhseqr = require( '@stdlib/lapack/base/zhseqr' );

var N = 3;
var H = discreteUniform( N * N, -10, 10, opts );
var Z = discreteUniform( N * N, -10, 10, opts );
var w = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );

zhseqr.ndarray( 'both', 'update', N, N, N, H, N, 1, 0, w, 1, 0, Z, N, 1, 0, WORK, 1, 0, N );
```

The function has the following parameters:

-   **job**: `job`.
-   **compz**: `compz`.
-   **N**: number of columns.
-   **ilo**: `ilo`.
-   **ihi**: `ihi`.
-   **H**: input array `H`.
-   **LDH**: leading dimension of `H`.
-   **w**: `w`.
-   **strideW**: stride length for `W`.
-   **Z**: input array `Z`.
-   **LDZ**: leading dimension of `Z`.
-   **WORK**: input array `WORK`.
-   **strideWORK**: stride length for `WORK`.
-   **lwork**: `lwork`.

#### zhseqr.ndarray( job, compz, N, ilo, ihi, H, strideH1, strideH2, offsetH, w, strideW, offsetW, Z, strideZ1, strideZ2, offsetZ, WORK, strideWORK, offsetWORK, lwork )

Computes the eigenvalues of a Hessenberg matrix H and, optionally, the matrices T and Z from the Schur decomposition H = Z T Zᴴ, using alternative indexing semantics.

```javascript
var zhseqr = require( '@stdlib/lapack/base/zhseqr' );

var N = 3;
var H = discreteUniform( N * N, -10, 10, opts );
var Z = discreteUniform( N * N, -10, 10, opts );
var w = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );

zhseqr.ndarray( 'both', 'update', N, N, N, H, N, 1, 0, w, 1, 0, Z, N, 1, 0, WORK, 1, 0, N );
```

The function has the following additional parameters:

-   **strideH1**: stride of dimension 1 of `H`.
-   **strideH2**: stride of dimension 2 of `H`.
-   **offsetH**: starting index for `H`.
-   **offsetW**: starting index for `W`.
-   **strideZ1**: stride of dimension 1 of `Z`.
-   **strideZ2**: stride of dimension 2 of `Z`.
-   **offsetZ**: starting index for `Z`.
-   **offsetWORK**: starting index for `WORK`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `zhseqr()` corresponds to the [LAPACK][lapack] level routine [`zhseqr`][lapack-zhseqr].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var zhseqr = require( '@stdlib/lapack/base/zhseqr' );

var N = 3;
var H = discreteUniform( N * N, -10, 10, opts );
var Z = discreteUniform( N * N, -10, 10, opts );
var w = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );

zhseqr.ndarray( 'both', 'update', N, N, N, H, N, 1, 0, w, 1, 0, Z, N, 1, 0, WORK, 1, 0, N );
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

[lapack-zhseqr]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__zhseqr.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->