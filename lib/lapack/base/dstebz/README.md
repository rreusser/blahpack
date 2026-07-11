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

# dstebz

> Computes the eigenvalues of a symmetric tridiagonal matrix T.

<section class="usage">

## Usage

```javascript
var dstebz = require( '@stdlib/lapack/base/dstebz' );
```

#### dstebz( range, order, N, vl, vu, il, iu, abstol, d, strideD, e, strideE, M, nsplit, w, strideW, IBLOCK, strideIBLOCK, ISPLIT, strideISPLIT, WORK, strideWORK, IWORK, strideIWORK )

Computes the eigenvalues of a symmetric tridiagonal matrix T.

```javascript
var dstebz = require( '@stdlib/lapack/base/dstebz' );

var N = 3;
var d = discreteUniform( N, -10, 10, opts );
var e = discreteUniform( N, -10, 10, opts );
var w = discreteUniform( N, -10, 10, opts );
var IBLOCK = discreteUniform( N, -10, 10, opts );
var ISPLIT = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );
var IWORK = discreteUniform( N, -10, 10, opts );

dstebz.ndarray( 'all', 'row-major', N, 1.0, 1.0, N, N, 1.0, d, 1, 0, e, 1, 0, N, 1, w, 1, 0, IBLOCK, 1, 0, ISPLIT, 1, 0, WORK, 1, 0, IWORK, 1, 0 );
```

The function has the following parameters:

-   **range**: `range`.
-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **N**: number of columns.
-   **vl**: `vl`.
-   **vu**: `vu`.
-   **il**: `il`.
-   **iu**: `iu`.
-   **abstol**: `abstol`.
-   **d**: `d`.
-   **strideD**: stride length for `D`.
-   **e**: `e`.
-   **strideE**: stride length for `E`.
-   **M**: number of rows.
-   **nsplit**: `nsplit`.
-   **w**: `w`.
-   **strideW**: stride length for `W`.
-   **IBLOCK**: input array `IBLOCK`.
-   **strideIBLOCK**: stride length for `IBLOCK`.
-   **ISPLIT**: input array `ISPLIT`.
-   **strideISPLIT**: stride length for `ISPLIT`.
-   **WORK**: input array `WORK`.
-   **strideWORK**: stride length for `WORK`.
-   **IWORK**: input array `IWORK`.
-   **strideIWORK**: stride length for `IWORK`.

#### dstebz.ndarray( range, order, N, vl, vu, il, iu, abstol, d, strideD, offsetD, e, strideE, offsetE, M, nsplit, w, strideW, offsetW, IBLOCK, strideIBLOCK, offsetIBLOCK, ISPLIT, strideISPLIT, offsetISPLIT, WORK, strideWORK, offsetWORK, IWORK, strideIWORK, offsetIWORK )

Computes the eigenvalues of a symmetric tridiagonal matrix T, using alternative indexing semantics.

```javascript
var dstebz = require( '@stdlib/lapack/base/dstebz' );

var N = 3;
var d = discreteUniform( N, -10, 10, opts );
var e = discreteUniform( N, -10, 10, opts );
var w = discreteUniform( N, -10, 10, opts );
var IBLOCK = discreteUniform( N, -10, 10, opts );
var ISPLIT = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );
var IWORK = discreteUniform( N, -10, 10, opts );

dstebz.ndarray( 'all', 'row-major', N, 1.0, 1.0, N, N, 1.0, d, 1, 0, e, 1, 0, N, 1, w, 1, 0, IBLOCK, 1, 0, ISPLIT, 1, 0, WORK, 1, 0, IWORK, 1, 0 );
```

The function has the following additional parameters:

-   **offsetD**: starting index for `D`.
-   **offsetE**: starting index for `E`.
-   **offsetW**: starting index for `W`.
-   **offsetIBLOCK**: starting index for `IBLOCK`.
-   **offsetISPLIT**: starting index for `ISPLIT`.
-   **offsetWORK**: starting index for `WORK`.
-   **offsetIWORK**: starting index for `IWORK`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `dstebz()` corresponds to the [LAPACK][lapack] level routine [`dstebz`][lapack-dstebz].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var dstebz = require( '@stdlib/lapack/base/dstebz' );

var N = 3;
var d = discreteUniform( N, -10, 10, opts );
var e = discreteUniform( N, -10, 10, opts );
var w = discreteUniform( N, -10, 10, opts );
var IBLOCK = discreteUniform( N, -10, 10, opts );
var ISPLIT = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );
var IWORK = discreteUniform( N, -10, 10, opts );

dstebz.ndarray( 'all', 'row-major', N, 1.0, 1.0, N, N, 1.0, d, 1, 0, e, 1, 0, N, 1, w, 1, 0, IBLOCK, 1, 0, ISPLIT, 1, 0, WORK, 1, 0, IWORK, 1, 0 );
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

[lapack-dstebz]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__dstebz.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->