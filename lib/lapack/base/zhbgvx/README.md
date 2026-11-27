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

# zhbgvx

> @license Apache-2.0.

<section class="usage">

## Usage

```javascript
var zhbgvx = require( '@stdlib/lapack/base/zhbgvx' );
```

#### zhbgvx( jobz, range, uplo, N, ka, kb, AB, LDAB, BB, LDBB, Q, LDQ, vl, vu, il, iu, abstol, out, w, strideW, Z, LDZ, WORK, strideWORK, RWORK, strideRWORK, IWORK, strideIWORK, IFAIL, strideIFAIL )

@license Apache-2.0.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Complex128Array = require( '@stdlib/array/complex128' );
var Int32Array = require( '@stdlib/array/int32' );
var zhbgvx = require( '@stdlib/lapack/base/zhbgvx' );

var Q = new Complex128Array( 25 );
var W = new Float64Array( 5 );
var Z = new Complex128Array( 25 );
var WORK = new Complex128Array( 10 );
var RWORK = new Float64Array( 50 );
var IWORK = new Int32Array( 30 );
var IFAIL = new Int32Array( 5 );

zhbgvx.ndarray( 'compute-vectors', 'all', 'upper', 5, 2, 1, AB, 1, 3, 0, BB, 1, 2, 0, Q, 1, 5, 0, 0, 0, 0, 0, 0, out, W, 1, 0, Z, 1, 5, 0, WORK, 1, 0, RWORK, 1, 0, IWORK, 1, 0, IFAIL, 1, 0 );
```

The function has the following parameters:

-   **jobz**: `jobz`.
-   **range**: `range`.
-   **uplo**: specifies whether the upper or lower triangular part is referenced.
-   **N**: number of columns.
-   **ka**: `ka`.
-   **kb**: `kb`.
-   **AB**: input array `AB`.
-   **LDAB**: leading dimension of `AB`.
-   **BB**: input array `BB`.
-   **LDBB**: leading dimension of `BB`.
-   **Q**: input array `Q`.
-   **LDQ**: leading dimension of `Q`.
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
-   **WORK**: input array `WORK`.
-   **strideWORK**: stride length for `WORK`.
-   **RWORK**: input array `RWORK`.
-   **strideRWORK**: stride length for `RWORK`.
-   **IWORK**: input array `IWORK`.
-   **strideIWORK**: stride length for `IWORK`.
-   **IFAIL**: input array `IFAIL`.
-   **strideIFAIL**: stride length for `IFAIL`.

#### zhbgvx.ndarray( jobz, range, uplo, N, ka, kb, AB, strideAB1, strideAB2, offsetAB, BB, strideBB1, strideBB2, offsetBB, Q, strideQ1, strideQ2, offsetQ, vl, vu, il, iu, abstol, out, w, strideW, offsetW, Z, strideZ1, strideZ2, offsetZ, WORK, strideWORK, offsetWORK, RWORK, strideRWORK, offsetRWORK, IWORK, strideIWORK, offsetIWORK, IFAIL, strideIFAIL, offsetIFAIL )

@license Apache-2.0, using alternative indexing semantics.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Complex128Array = require( '@stdlib/array/complex128' );
var Int32Array = require( '@stdlib/array/int32' );
var zhbgvx = require( '@stdlib/lapack/base/zhbgvx' );

var Q = new Complex128Array( 25 );
var W = new Float64Array( 5 );
var Z = new Complex128Array( 25 );
var WORK = new Complex128Array( 10 );
var RWORK = new Float64Array( 50 );
var IWORK = new Int32Array( 30 );
var IFAIL = new Int32Array( 5 );

zhbgvx.ndarray( 'compute-vectors', 'all', 'upper', 5, 2, 1, AB, 1, 3, 0, BB, 1, 2, 0, Q, 1, 5, 0, 0, 0, 0, 0, 0, out, W, 1, 0, Z, 1, 5, 0, WORK, 1, 0, RWORK, 1, 0, IWORK, 1, 0, IFAIL, 1, 0 );
```

The function has the following additional parameters:

-   **strideAB1**: stride of dimension 1 of `AB`.
-   **strideAB2**: stride of dimension 2 of `AB`.
-   **offsetAB**: starting index for `AB`.
-   **strideBB1**: stride of dimension 1 of `BB`.
-   **strideBB2**: stride of dimension 2 of `BB`.
-   **offsetBB**: starting index for `BB`.
-   **strideQ1**: stride of dimension 1 of `Q`.
-   **strideQ2**: stride of dimension 2 of `Q`.
-   **offsetQ**: starting index for `Q`.
-   **offsetW**: starting index for `W`.
-   **strideZ1**: stride of dimension 1 of `Z`.
-   **strideZ2**: stride of dimension 2 of `Z`.
-   **offsetZ**: starting index for `Z`.
-   **offsetWORK**: starting index for `WORK`.
-   **offsetRWORK**: starting index for `RWORK`.
-   **offsetIWORK**: starting index for `IWORK`.
-   **offsetIFAIL**: starting index for `IFAIL`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `zhbgvx()` corresponds to the [LAPACK][lapack] level routine [`zhbgvx`][lapack-zhbgvx].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Complex128Array = require( '@stdlib/array/complex128' );
var Int32Array = require( '@stdlib/array/int32' );
var zhbgvx = require( '@stdlib/lapack/base/zhbgvx' );

var Q = new Complex128Array( 25 );
var W = new Float64Array( 5 );
var Z = new Complex128Array( 25 );
var WORK = new Complex128Array( 10 );
var RWORK = new Float64Array( 50 );
var IWORK = new Int32Array( 30 );
var IFAIL = new Int32Array( 5 );

zhbgvx.ndarray( 'compute-vectors', 'all', 'upper', 5, 2, 1, AB, 1, 3, 0, BB, 1, 2, 0, Q, 1, 5, 0, 0, 0, 0, 0, 0, out, W, 1, 0, Z, 1, 5, 0, WORK, 1, 0, RWORK, 1, 0, IWORK, 1, 0, IFAIL, 1, 0 );
```

</section>

<!-- /.examples -->

<!-- fortran-docs:start (generated by bin/fortran-docs.mjs from data/lapack-3.12.0/SRC/zhbgvx.f; do not edit) -->

<section class="fortran-docs">

## Reference notes

The mathematical description from the reference LAPACK 3.12.0 source of `ZHBGVX`. Indices are the 1-based Fortran indices of the source.

### Purpose

ZHBGVX computes all the eigenvalues, and optionally, the eigenvectors of a complex generalized Hermitian-definite banded eigenproblem, of the form $A \, x=(\lambda ) \, B \, x$. Here A and B are assumed to be Hermitian and banded, and B is also positive definite. Eigenvalues and eigenvectors can be selected by specifying either all eigenvalues, a range of values or a range of indices for the desired eigenvalues.

</section>

<!-- fortran-docs:end -->

<!-- Section for related `stdlib` packages. Do not manually edit this section, as it is automatically populated. -->

<section class="related">

</section>

<!-- /.related -->

<!-- Section for all links. Make sure to keep an empty line after the `section` element and another before the `/section` close. -->

<section class="links">

[lapack]: https://www.netlib.org/lapack/explore-html/

[lapack-zhbgvx]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__zhbgvx.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->