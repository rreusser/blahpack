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

# dlatdf

> Uses the LU factorization of the n-by-n matrix computed by sgetc2 and computes a contribution to the reciprocal Dif-estimate.

<section class="usage">

## Usage

```javascript
var dlatdf = require( '@stdlib/lapack/base/dlatdf' );
```

#### dlatdf( ijob, N, Z, LDZ, RHS, strideRHS, rdsum, rdscal, IPIV, strideIPIV, JPIV, strideJPIV )

Uses the LU factorization of the n-by-n matrix computed by sgetc2 and computes a contribution to the reciprocal Dif-estimate.

```javascript
var dlatdf = require( '@stdlib/lapack/base/dlatdf' );

var N = 3;
var Z = discreteUniform( N * N, -10, 10, opts );
var RHS = discreteUniform( N, -10, 10, opts );
var IPIV = discreteUniform( N, -10, 10, opts );
var JPIV = discreteUniform( N, -10, 10, opts );

dlatdf.ndarray( 1, N, Z, N, 1, 0, RHS, 1, 0, 1, 1, IPIV, 1, 0, JPIV, 1, 0 );
```

The function has the following parameters:

-   **ijob**: `ijob`.
-   **N**: number of columns.
-   **Z**: input array `Z`.
-   **LDZ**: leading dimension of `Z`.
-   **RHS**: input array `RHS`.
-   **strideRHS**: stride length for `RHS`.
-   **rdsum**: `rdsum`.
-   **rdscal**: `rdscal`.
-   **IPIV**: input array `IPIV`.
-   **strideIPIV**: stride length for `IPIV`.
-   **JPIV**: input array `JPIV`.
-   **strideJPIV**: stride length for `JPIV`.

#### dlatdf.ndarray( ijob, N, Z, strideZ1, strideZ2, offsetZ, RHS, strideRHS, offsetRHS, rdsum, rdscal, IPIV, strideIPIV, offsetIPIV, JPIV, strideJPIV, offsetJPIV )

Uses the LU factorization of the n-by-n matrix computed by sgetc2 and computes a contribution to the reciprocal Dif-estimate, using alternative indexing semantics.

```javascript
var dlatdf = require( '@stdlib/lapack/base/dlatdf' );

var N = 3;
var Z = discreteUniform( N * N, -10, 10, opts );
var RHS = discreteUniform( N, -10, 10, opts );
var IPIV = discreteUniform( N, -10, 10, opts );
var JPIV = discreteUniform( N, -10, 10, opts );

dlatdf.ndarray( 1, N, Z, N, 1, 0, RHS, 1, 0, 1, 1, IPIV, 1, 0, JPIV, 1, 0 );
```

The function has the following additional parameters:

-   **strideZ1**: stride of dimension 1 of `Z`.
-   **strideZ2**: stride of dimension 2 of `Z`.
-   **offsetZ**: starting index for `Z`.
-   **offsetRHS**: starting index for `RHS`.
-   **offsetIPIV**: starting index for `IPIV`.
-   **offsetJPIV**: starting index for `JPIV`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `dlatdf()` corresponds to the [LAPACK][lapack] level routine [`dlatdf`][lapack-dlatdf].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var dlatdf = require( '@stdlib/lapack/base/dlatdf' );

var N = 3;
var Z = discreteUniform( N * N, -10, 10, opts );
var RHS = discreteUniform( N, -10, 10, opts );
var IPIV = discreteUniform( N, -10, 10, opts );
var JPIV = discreteUniform( N, -10, 10, opts );

dlatdf.ndarray( 1, N, Z, N, 1, 0, RHS, 1, 0, 1, 1, IPIV, 1, 0, JPIV, 1, 0 );
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

[lapack-dlatdf]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__dlatdf.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->