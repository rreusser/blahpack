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

# zhpevx

> Computes selected eigenvalues and optionally eigenvectors of a complex Hermitian matrix in packed storage.

<section class="usage">

## Usage

```javascript
var zhpevx = require( '@stdlib/lapack/base/zhpevx' );
```

#### zhpevx( order, jobz, range, uplo, N, AP, vl, vu, il, iu, abstol, out, w, Z, LDZ, WORK, RWORK, IWORK, IFAIL )

Computes selected eigenvalues and optionally eigenvectors of a complex Hermitian matrix in packed storage.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Complex128Array = require( '@stdlib/array/complex128' );
var Int32Array = require( '@stdlib/array/int32' );
var zhpevx = require( '@stdlib/lapack/base/zhpevx' );

var N = 3;
var w = new Float64Array( N );
var Z = new Complex128Array( N * N );
var WORK = new Complex128Array( 2 * N );
var RWORK = new Float64Array( 7 * N );
var IWORK = new Int32Array( 5 * N );
var IFAIL = new Int32Array( N );

zhpevx.ndarray( 'compute-vectors', 'all', 'upper', N, AP, 1, 0, 0, 0, 0, 0, 0, out, w, 1, 0, Z, 1, N, 0, WORK, 1, 0, RWORK, 1, 0, IWORK, 1, 0, IFAIL, 1, 0 );
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **jobz**: `jobz`.
-   **range**: `range`.
-   **uplo**: specifies whether the upper or lower triangular part is referenced.
-   **N**: number of columns.
-   **AP**: input array `AP`.
-   **vl**: `vl`.
-   **vu**: `vu`.
-   **il**: `il`.
-   **iu**: `iu`.
-   **abstol**: `abstol`.
-   **out**: `out`.
-   **w**: `w`.
-   **Z**: input array `Z`.
-   **LDZ**: leading dimension of `Z`.
-   **WORK**: input array `WORK`.
-   **RWORK**: input array `RWORK`.
-   **IWORK**: input array `IWORK`.
-   **IFAIL**: input array `IFAIL`.

#### zhpevx.ndarray( jobz, range, uplo, N, AP, strideAP, offsetAP, vl, vu, il, iu, abstol, out, w, strideW, offsetW, Z, strideZ1, strideZ2, offsetZ, WORK, strideWORK, offsetWORK, RWORK, strideRWORK, offsetRWORK, IWORK, strideIWORK, offsetIWORK, IFAIL, strideIFAIL, offsetIFAIL )

Computes selected eigenvalues and optionally eigenvectors of a complex Hermitian matrix in packed storage, using alternative indexing semantics.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Complex128Array = require( '@stdlib/array/complex128' );
var Int32Array = require( '@stdlib/array/int32' );
var zhpevx = require( '@stdlib/lapack/base/zhpevx' );

var N = 3;
var w = new Float64Array( N );
var Z = new Complex128Array( N * N );
var WORK = new Complex128Array( 2 * N );
var RWORK = new Float64Array( 7 * N );
var IWORK = new Int32Array( 5 * N );
var IFAIL = new Int32Array( N );

zhpevx.ndarray( 'compute-vectors', 'all', 'upper', N, AP, 1, 0, 0, 0, 0, 0, 0, out, w, 1, 0, Z, 1, N, 0, WORK, 1, 0, RWORK, 1, 0, IWORK, 1, 0, IFAIL, 1, 0 );
```

The function has the following additional parameters:

-   **strideAP**: stride length for `AP`.
-   **offsetAP**: starting index for `AP`.
-   **strideW**: stride length for `W`.
-   **offsetW**: starting index for `W`.
-   **strideZ1**: stride of dimension 1 of `Z`.
-   **strideZ2**: stride of dimension 2 of `Z`.
-   **offsetZ**: starting index for `Z`.
-   **strideWORK**: stride length for `WORK`.
-   **offsetWORK**: starting index for `WORK`.
-   **strideRWORK**: stride length for `RWORK`.
-   **offsetRWORK**: starting index for `RWORK`.
-   **strideIWORK**: stride length for `IWORK`.
-   **offsetIWORK**: starting index for `IWORK`.
-   **strideIFAIL**: stride length for `IFAIL`.
-   **offsetIFAIL**: starting index for `IFAIL`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `zhpevx()` corresponds to the [LAPACK][lapack] level routine [`zhpevx`][lapack-zhpevx].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Complex128Array = require( '@stdlib/array/complex128' );
var Int32Array = require( '@stdlib/array/int32' );
var zhpevx = require( '@stdlib/lapack/base/zhpevx' );

var N = 3;
var w = new Float64Array( N );
var Z = new Complex128Array( N * N );
var WORK = new Complex128Array( 2 * N );
var RWORK = new Float64Array( 7 * N );
var IWORK = new Int32Array( 5 * N );
var IFAIL = new Int32Array( N );

zhpevx.ndarray( 'compute-vectors', 'all', 'upper', N, AP, 1, 0, 0, 0, 0, 0, 0, out, w, 1, 0, Z, 1, N, 0, WORK, 1, 0, RWORK, 1, 0, IWORK, 1, 0, IFAIL, 1, 0 );
```

</section>

<!-- /.examples -->

<!-- fortran-docs:start (generated by bin/fortran-docs.mjs from data/lapack-3.12.0/SRC/zhpevx.f; do not edit) -->

<section class="fortran-docs">

## Reference notes

The mathematical description from the reference LAPACK 3.12.0 source of `ZHPEVX`. Indices are the 1-based Fortran indices of the source.

### Purpose

ZHPEVX computes selected eigenvalues and, optionally, eigenvectors of a complex Hermitian matrix A in packed storage. Eigenvalues/vectors can be selected by specifying either a range of values or a range of indices for the desired eigenvalues.

</section>

<!-- fortran-docs:end -->

<!-- Section for related `stdlib` packages. Do not manually edit this section, as it is automatically populated. -->

<section class="related">

</section>

<!-- /.related -->

<!-- Section for all links. Make sure to keep an empty line after the `section` element and another before the `/section` close. -->

<section class="links">

[lapack]: https://www.netlib.org/lapack/explore-html/

[lapack-zhpevx]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__zhpevx.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->