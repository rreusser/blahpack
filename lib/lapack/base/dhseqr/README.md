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

# dhseqr

> Computes the eigenvalues of a Hessenberg matrix H and, optionally, the matrices T and Z from the Schur decomposition H = Z T Zᵀ.

<section class="usage">

## Usage

```javascript
var dhseqr = require( '@stdlib/lapack/base/dhseqr' );
```

#### dhseqr( job, compz, N, ilo, ihi, H, LDH, WR, strideWR, WI, strideWI, Z, LDZ )

Computes the eigenvalues of a Hessenberg matrix H and, optionally, the matrices T and Z from the Schur decomposition H = Z T Zᵀ.

```javascript
var dhseqr = require( '@stdlib/lapack/base/dhseqr' );

var N = 3;
var H = discreteUniform( N * N, -10, 10, opts );
var Z = discreteUniform( N * N, -10, 10, opts );
var WR = discreteUniform( N, -10, 10, opts );
var WI = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );

dhseqr.ndarray( 'both', 'update', N, N, N, H, N, 1, 0, WR, 1, 0, WI, 1, 0, Z, N, 1, 0, WORK, 1, 0, N );
```

The function has the following parameters:

-   **job**: `job`.
-   **compz**: `compz`.
-   **N**: number of columns.
-   **ilo**: `ilo`.
-   **ihi**: `ihi`.
-   **H**: input array `H`.
-   **LDH**: leading dimension of `H`.
-   **WR**: input array `WR`.
-   **strideWR**: stride length for `WR`.
-   **WI**: input array `WI`.
-   **strideWI**: stride length for `WI`.
-   **Z**: input array `Z`.
-   **LDZ**: leading dimension of `Z`.

#### dhseqr.ndarray( job, compz, N, ilo, ihi, H, strideH1, strideH2, offsetH, WR, strideWR, offsetWR, WI, strideWI, offsetWI, Z, strideZ1, strideZ2, offsetZ, WORK, strideWORK, offsetWORK, lwork )

Computes the eigenvalues of a Hessenberg matrix H and, optionally, the matrices T and Z from the Schur decomposition H = Z T Zᵀ, using alternative indexing semantics.

```javascript
var dhseqr = require( '@stdlib/lapack/base/dhseqr' );

var N = 3;
var H = discreteUniform( N * N, -10, 10, opts );
var Z = discreteUniform( N * N, -10, 10, opts );
var WR = discreteUniform( N, -10, 10, opts );
var WI = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );

dhseqr.ndarray( 'both', 'update', N, N, N, H, N, 1, 0, WR, 1, 0, WI, 1, 0, Z, N, 1, 0, WORK, 1, 0, N );
```

The function has the following additional parameters:

-   **strideH1**: stride of dimension 1 of `H`.
-   **strideH2**: stride of dimension 2 of `H`.
-   **offsetH**: starting index for `H`.
-   **offsetWR**: starting index for `WR`.
-   **offsetWI**: starting index for `WI`.
-   **strideZ1**: stride of dimension 1 of `Z`.
-   **strideZ2**: stride of dimension 2 of `Z`.
-   **offsetZ**: starting index for `Z`.
-   **WORK**: input array `WORK`.
-   **strideWORK**: stride length for `WORK`.
-   **offsetWORK**: starting index for `WORK`.
-   **lwork**: `lwork`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `dhseqr()` corresponds to the [LAPACK][lapack] level routine [`dhseqr`][lapack-dhseqr].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var dhseqr = require( '@stdlib/lapack/base/dhseqr' );

var N = 3;
var H = discreteUniform( N * N, -10, 10, opts );
var Z = discreteUniform( N * N, -10, 10, opts );
var WR = discreteUniform( N, -10, 10, opts );
var WI = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );

dhseqr.ndarray( 'both', 'update', N, N, N, H, N, 1, 0, WR, 1, 0, WI, 1, 0, Z, N, 1, 0, WORK, 1, 0, N );
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

[lapack-dhseqr]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__dhseqr.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->