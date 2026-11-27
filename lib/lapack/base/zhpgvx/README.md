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

# zhpgvx

> @license Apache-2.0.

<section class="usage">

## Usage

```javascript
var zhpgvx = require( '@stdlib/lapack/base/zhpgvx' );
```

#### zhpgvx( order, itype, jobz, range, uplo, N, AP, BP, vl, vu, il, iu, abstol, out, w, Z, LDZ, WORK, RWORK, IWORK, IFAIL )

@license Apache-2.0.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Complex128Array = require( '@stdlib/array/complex128' );
var Int32Array = require( '@stdlib/array/int32' );
var zhpgvx = require( '@stdlib/lapack/base/zhpgvx' );

var AP = new Complex128Array( [ 4, 0, 1, -1, 5, 0 ] );
var BP = new Complex128Array( [ 2, 0, 0, 0, 3, 0 ] );
var W = new Float64Array( 2 );
var Z = new Complex128Array( 4 );
var WORK = new Complex128Array( 10 );
var RWORK = new Float64Array( 20 );
var IWORK = new Int32Array( 15 );
var IFAIL = new Int32Array( 2 );

zhpgvx( 'column-major', 1, 'compute-vectors', 'all', 'upper', 2, AP, BP, 0, 0, 0, 0, 0, out, W, Z, 2, WORK, RWORK, IWORK, IFAIL );
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **itype**: `itype`.
-   **jobz**: `jobz`.
-   **range**: `range`.
-   **uplo**: specifies whether the upper or lower triangular part is referenced.
-   **N**: number of columns.
-   **AP**: input array `AP`.
-   **BP**: input array `BP`.
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

#### zhpgvx.ndarray( itype, jobz, range, uplo, N, AP, strideAP, offsetAP, BP, strideBP, offsetBP, vl, vu, il, iu, abstol, out, w, strideW, offsetW, Z, strideZ1, strideZ2, offsetZ, WORK, strideWORK, offsetWORK, RWORK, strideRWORK, offsetRWORK, IWORK, strideIWORK, offsetIWORK, IFAIL, strideIFAIL, offsetIFAIL )

@license Apache-2.0, using alternative indexing semantics.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Complex128Array = require( '@stdlib/array/complex128' );
var Int32Array = require( '@stdlib/array/int32' );
var zhpgvx = require( '@stdlib/lapack/base/zhpgvx' );

var AP = new Complex128Array( [ 4, 0, 1, -1, 5, 0 ] );
var BP = new Complex128Array( [ 2, 0, 0, 0, 3, 0 ] );
var W = new Float64Array( 2 );
var Z = new Complex128Array( 4 );
var WORK = new Complex128Array( 10 );
var RWORK = new Float64Array( 20 );
var IWORK = new Int32Array( 15 );
var IFAIL = new Int32Array( 2 );

zhpgvx( 'column-major', 1, 'compute-vectors', 'all', 'upper', 2, AP, BP, 0, 0, 0, 0, 0, out, W, Z, 2, WORK, RWORK, IWORK, IFAIL );
```

The function has the following additional parameters:

-   **strideAP**: stride length for `AP`.
-   **offsetAP**: starting index for `AP`.
-   **strideBP**: stride length for `BP`.
-   **offsetBP**: starting index for `BP`.
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

-   `zhpgvx()` corresponds to the [LAPACK][lapack] level routine [`zhpgvx`][lapack-zhpgvx].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Complex128Array = require( '@stdlib/array/complex128' );
var Int32Array = require( '@stdlib/array/int32' );
var zhpgvx = require( '@stdlib/lapack/base/zhpgvx' );

var AP = new Complex128Array( [ 4, 0, 1, -1, 5, 0 ] );
var BP = new Complex128Array( [ 2, 0, 0, 0, 3, 0 ] );
var W = new Float64Array( 2 );
var Z = new Complex128Array( 4 );
var WORK = new Complex128Array( 10 );
var RWORK = new Float64Array( 20 );
var IWORK = new Int32Array( 15 );
var IFAIL = new Int32Array( 2 );

zhpgvx( 'column-major', 1, 'compute-vectors', 'all', 'upper', 2, AP, BP, 0, 0, 0, 0, 0, out, W, Z, 2, WORK, RWORK, IWORK, IFAIL );
```

</section>

<!-- /.examples -->

<!-- fortran-docs:start (generated by bin/fortran-docs.mjs from data/lapack-3.12.0/SRC/zhpgvx.f; do not edit) -->

<section class="fortran-docs">

## Reference notes

The mathematical description from the reference LAPACK 3.12.0 source of `ZHPGVX`. Indices are the 1-based Fortran indices of the source.

### Purpose

ZHPGVX computes selected eigenvalues and, optionally, eigenvectors of a complex generalized Hermitian-definite eigenproblem, of the form $A \, x=(\lambda ) \, B \, x$, $A \, \mathrm{Bx}=(\lambda ) \, x$, or $B \, A \, x=(\lambda ) \, x$. Here A and B are assumed to be Hermitian, stored in packed format, and B is also positive definite. Eigenvalues and eigenvectors can be selected by specifying either a range of values or a range of indices for the desired eigenvalues.

</section>

<!-- fortran-docs:end -->

<!-- Section for related `stdlib` packages. Do not manually edit this section, as it is automatically populated. -->

<section class="related">

</section>

<!-- /.related -->

<!-- Section for all links. Make sure to keep an empty line after the `section` element and another before the `/section` close. -->

<section class="links">

[lapack]: https://www.netlib.org/lapack/explore-html/

[lapack-zhpgvx]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__zhpgvx.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->