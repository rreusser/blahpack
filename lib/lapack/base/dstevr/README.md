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

# dstevr

> Computes the eigenvalues and, optionally, the left and/or right eigenvectors.

<section class="usage">

## Usage

```javascript
var dstevr = require( '@stdlib/lapack/base/dstevr' );
```

#### dstevr( jobz, range, N, d, strideD, e, strideE, vl, vu, il, iu, abstol, out, w, strideW, Z, LDZ, ISUPPZ, strideISUPPZ, WORK, strideWORK, lwork, IWORK, strideIWORK, liwork )

Computes the eigenvalues and, optionally, the left and/or right eigenvectors.

```javascript
var dstevr = require( '@stdlib/lapack/base/dstevr' );

var N = 3;
var Z = discreteUniform( N * N, -10, 10, opts );
var d = discreteUniform( N, -10, 10, opts );
var e = discreteUniform( N, -10, 10, opts );
var w = discreteUniform( N, -10, 10, opts );
var ISUPPZ = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );
var IWORK = discreteUniform( N, -10, 10, opts );

dstevr.ndarray( 'compute-vectors', 'all', N, d, 1, 0, e, 1, 0, 1.0, 1.0, N, N, 1.0, 1, w, 1, 0, Z, N, 1, 0, ISUPPZ, 1, 0, WORK, 1, 0, N, IWORK, 1, 0, 1 );
```

The function has the following parameters:

-   **jobz**: `jobz`.
-   **range**: `range`.
-   **N**: number of columns.
-   **d**: `d`.
-   **strideD**: stride length for `D`.
-   **e**: `e`.
-   **strideE**: stride length for `E`.
-   **vl**: `vl`.
-   **vu**: `vu`.
-   **il**: `il`.
-   **iu**: `iu`.
-   **abstol**: `abstol`.
-   **out**: `out`.
-   **w**: `w`.
-   **strideW**: stride length for `W`.
-   **Z**: input array `Z`.
-   **LDZ**: leading dimension of `Z`.
-   **ISUPPZ**: input array `ISUPPZ`.
-   **strideISUPPZ**: stride length for `ISUPPZ`.
-   **WORK**: input array `WORK`.
-   **strideWORK**: stride length for `WORK`.
-   **lwork**: `lwork`.
-   **IWORK**: input array `IWORK`.
-   **strideIWORK**: stride length for `IWORK`.
-   **liwork**: `liwork`.

#### dstevr.ndarray( jobz, range, N, d, strideD, offsetD, e, strideE, offsetE, vl, vu, il, iu, abstol, out, w, strideW, offsetW, Z, strideZ1, strideZ2, offsetZ, ISUPPZ, strideISUPPZ, offsetISUPPZ, WORK, strideWORK, offsetWORK, lwork, IWORK, strideIWORK, offsetIWORK, liwork )

Computes the eigenvalues and, optionally, the left and/or right eigenvectors, using alternative indexing semantics.

```javascript
var dstevr = require( '@stdlib/lapack/base/dstevr' );

var N = 3;
var Z = discreteUniform( N * N, -10, 10, opts );
var d = discreteUniform( N, -10, 10, opts );
var e = discreteUniform( N, -10, 10, opts );
var w = discreteUniform( N, -10, 10, opts );
var ISUPPZ = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );
var IWORK = discreteUniform( N, -10, 10, opts );

dstevr.ndarray( 'compute-vectors', 'all', N, d, 1, 0, e, 1, 0, 1.0, 1.0, N, N, 1.0, 1, w, 1, 0, Z, N, 1, 0, ISUPPZ, 1, 0, WORK, 1, 0, N, IWORK, 1, 0, 1 );
```

The function has the following additional parameters:

-   **offsetD**: starting index for `D`.
-   **offsetE**: starting index for `E`.
-   **offsetW**: starting index for `W`.
-   **strideZ1**: stride of dimension 1 of `Z`.
-   **strideZ2**: stride of dimension 2 of `Z`.
-   **offsetZ**: starting index for `Z`.
-   **offsetISUPPZ**: starting index for `ISUPPZ`.
-   **offsetWORK**: starting index for `WORK`.
-   **offsetIWORK**: starting index for `IWORK`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `dstevr()` corresponds to the [LAPACK][lapack] level routine [`dstevr`][lapack-dstevr].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var dstevr = require( '@stdlib/lapack/base/dstevr' );

var N = 3;
var Z = discreteUniform( N * N, -10, 10, opts );
var d = discreteUniform( N, -10, 10, opts );
var e = discreteUniform( N, -10, 10, opts );
var w = discreteUniform( N, -10, 10, opts );
var ISUPPZ = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );
var IWORK = discreteUniform( N, -10, 10, opts );

dstevr.ndarray( 'compute-vectors', 'all', N, d, 1, 0, e, 1, 0, 1.0, 1.0, N, N, 1.0, 1, w, 1, 0, Z, N, 1, 0, ISUPPZ, 1, 0, WORK, 1, 0, N, IWORK, 1, 0, 1 );
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

[lapack-dstevr]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__dstevr.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->