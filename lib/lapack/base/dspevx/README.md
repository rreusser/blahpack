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

# dspevx

> Computes the eigenvalues and, optionally, the left and/or right eigenvectors.

<section class="usage">

## Usage

```javascript
var dspevx = require( '@stdlib/lapack/base/dspevx' );
```

#### dspevx( order, jobz, range, uplo, N, AP, vl, vu, il, iu, abstol, out, w, Z, LDZ, WORK, IWORK, IFAIL )

Computes the eigenvalues and, optionally, the left and/or right eigenvectors.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Int32Array = require( '@stdlib/array/int32' );
var dspevx = require( '@stdlib/lapack/base/dspevx' );

var AP = new Float64Array( [ 2.0, 1.0, 3.0, 0.0, 1.0, 4.0 ] );
var w = new Float64Array( 3 );
var Z = new Float64Array( 9 );
var WORK = new Float64Array( 24 );
var IWORK = new Int32Array( 15 );
var IFAIL = new Int32Array( 3 );

dspevx.ndarray( 'compute-vectors', 'all', 'upper', 3, AP, 1, 0, 0, 0, 0, 0, 0, out, w, 1, 0, Z, 1, 3, 0, WORK, 1, 0, IWORK, 1, 0, IFAIL, 1, 0 );
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
-   **IWORK**: input array `IWORK`.
-   **IFAIL**: input array `IFAIL`.

#### dspevx.ndarray( jobz, range, uplo, N, AP, strideAP, offsetAP, vl, vu, il, iu, abstol, out, w, strideW, offsetW, Z, strideZ1, strideZ2, offsetZ, WORK, strideWORK, offsetWORK, IWORK, strideIWORK, offsetIWORK, IFAIL, strideIFAIL, offsetIFAIL )

Computes the eigenvalues and, optionally, the left and/or right eigenvectors, using alternative indexing semantics.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Int32Array = require( '@stdlib/array/int32' );
var dspevx = require( '@stdlib/lapack/base/dspevx' );

var AP = new Float64Array( [ 2.0, 1.0, 3.0, 0.0, 1.0, 4.0 ] );
var w = new Float64Array( 3 );
var Z = new Float64Array( 9 );
var WORK = new Float64Array( 24 );
var IWORK = new Int32Array( 15 );
var IFAIL = new Int32Array( 3 );

dspevx.ndarray( 'compute-vectors', 'all', 'upper', 3, AP, 1, 0, 0, 0, 0, 0, 0, out, w, 1, 0, Z, 1, 3, 0, WORK, 1, 0, IWORK, 1, 0, IFAIL, 1, 0 );
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
-   **strideIWORK**: stride length for `IWORK`.
-   **offsetIWORK**: starting index for `IWORK`.
-   **strideIFAIL**: stride length for `IFAIL`.
-   **offsetIFAIL**: starting index for `IFAIL`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `dspevx()` corresponds to the [LAPACK][lapack] level routine [`dspevx`][lapack-dspevx].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Int32Array = require( '@stdlib/array/int32' );
var dspevx = require( '@stdlib/lapack/base/dspevx' );

var AP = new Float64Array( [ 2.0, 1.0, 3.0, 0.0, 1.0, 4.0 ] );
var w = new Float64Array( 3 );
var Z = new Float64Array( 9 );
var WORK = new Float64Array( 24 );
var IWORK = new Int32Array( 15 );
var IFAIL = new Int32Array( 3 );

dspevx.ndarray( 'compute-vectors', 'all', 'upper', 3, AP, 1, 0, 0, 0, 0, 0, 0, out, w, 1, 0, Z, 1, 3, 0, WORK, 1, 0, IWORK, 1, 0, IFAIL, 1, 0 );
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

[lapack-dspevx]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__dspevx.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->