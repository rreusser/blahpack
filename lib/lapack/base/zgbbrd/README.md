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

# zgbbrd

> Reduces a complex general band matrix to real upper bidiagonal form

<section class="usage">

## Usage

```javascript
var zgbbrd = require( '@stdlib/lapack/base/zgbbrd' );
```

#### zgbbrd( order, vect, M, N, ncc, kl, ku, AB, LDAB, d, strideD, e, strideE, Q, LDQ, PT, LDPT, C, LDC, WORK, strideWORK, RWORK, strideRWORK )

Reduces a complex general band matrix to real upper bidiagonal form

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Complex128Array = require( '@stdlib/array/complex128' );
var zgbbrd = require( '@stdlib/lapack/base/zgbbrd' );

var N = 3;
var KL = 1;
var KU = 1;
var LDAB = KL + KU + 1;
var AB = new Complex128Array( LDAB * N );
var d = new Float64Array( N );
var e = new Float64Array( N - 1 );
var Q = new Complex128Array( N * N );
var PT = new Complex128Array( N * N );
var C = new Complex128Array( 1 );
var WORK = new Complex128Array( 2 * N );
var RWORK = new Float64Array( 2 * N );

zgbbrd( 'column-major', 'both', N, N, 0, KL, KU, AB, LDAB, d, 1, e, 1, Q, N, PT, N, C, 1, WORK, 1, RWORK, 1 );
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **vect**: specifies the operation type.
-   **M**: number of rows.
-   **N**: number of columns.
-   **ncc**: ncc.
-   **kl**: kl.
-   **ku**: ku.
-   **AB**: input matrix.
-   **LDAB**: leading dimension of `AB`.
-   **d**: input array.
-   **strideD**: stride length for `d`.
-   **e**: input array.
-   **strideE**: stride length for `e`.
-   **Q**: input matrix.
-   **LDQ**: leading dimension of `Q`.
-   **PT**: input matrix.
-   **LDPT**: leading dimension of `PT`.
-   **C**: input matrix.
-   **LDC**: leading dimension of `C`.
-   **WORK**: input array.
-   **strideWORK**: stride length for `WORK`.
-   **RWORK**: output array.
-   **strideRWORK**: stride length for `RWORK`.

#### zgbbrd.ndarray( vect, M, N, ncc, kl, ku, AB, strideAB1, strideAB2, offsetAB, d, strideD, offsetD, e, strideE, offsetE, Q, strideQ1, strideQ2, offsetQ, PT, stridePT1, stridePT2, offsetPT, C, strideC1, strideC2, offsetC, WORK, strideWORK, offsetWORK, RWORK, strideRWORK, offsetRWORK )

Reduces a complex general band matrix to real upper bidiagonal form, using alternative indexing semantics.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Complex128Array = require( '@stdlib/array/complex128' );
var zgbbrd = require( '@stdlib/lapack/base/zgbbrd' );

var N = 3;
var KL = 1;
var KU = 1;
var LDAB = KL + KU + 1;
var AB = new Complex128Array( LDAB * N );
var d = new Float64Array( N );
var e = new Float64Array( N - 1 );
var Q = new Complex128Array( N * N );
var PT = new Complex128Array( N * N );
var C = new Complex128Array( 1 );
var WORK = new Complex128Array( 2 * N );
var RWORK = new Float64Array( 2 * N );

zgbbrd( 'column-major', 'both', N, N, 0, KL, KU, AB, LDAB, d, 1, e, 1, Q, N, PT, N, C, 1, WORK, 1, RWORK, 1 );
```

The function has the following additional parameters:

-   **vect**: specifies the operation type.
-   **M**: number of rows.
-   **N**: number of columns.
-   **ncc**: ncc.
-   **kl**: kl.
-   **ku**: ku.
-   **AB**: input matrix.
-   **strideAB1**: stride of dimension 1 of `AB`.
-   **strideAB2**: stride of dimension 2 of `AB`.
-   **offsetAB**: starting index for `AB`.
-   **d**: input array.
-   **strideD**: stride length for `d`.
-   **offsetD**: starting index for `D`.
-   **e**: input array.
-   **strideE**: stride length for `e`.
-   **offsetE**: starting index for `E`.
-   **Q**: input matrix.
-   **strideQ1**: stride of dimension 1 of `Q`.
-   **strideQ2**: stride of dimension 2 of `Q`.
-   **offsetQ**: starting index for `Q`.
-   **PT**: input matrix.
-   **stridePT1**: stride of dimension 1 of `PT`.
-   **stridePT2**: stride of dimension 2 of `PT`.
-   **offsetPT**: starting index for `PT`.
-   **C**: input matrix.
-   **strideC1**: stride of dimension 1 of `C`.
-   **strideC2**: stride of dimension 2 of `C`.
-   **offsetC**: starting index for `C`.
-   **WORK**: input array.
-   **strideWORK**: stride length for `WORK`.
-   **offsetWORK**: starting index for `WORK`.
-   **RWORK**: output array.
-   **strideRWORK**: stride length for `RWORK`.
-   **offsetRWORK**: starting index for `RWORK`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   See LAPACK reference documentation for full algorithmic details.
</section>

<!-- /.notes -->

<section class="examples">

## Examples

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Complex128Array = require( '@stdlib/array/complex128' );
var zgbbrd = require( '@stdlib/lapack/base/zgbbrd' );

var N = 3;
var KL = 1;
var KU = 1;
var LDAB = KL + KU + 1;
var AB = new Complex128Array( LDAB * N );
var d = new Float64Array( N );
var e = new Float64Array( N - 1 );
var Q = new Complex128Array( N * N );
var PT = new Complex128Array( N * N );
var C = new Complex128Array( 1 );
var WORK = new Complex128Array( 2 * N );
var RWORK = new Float64Array( 2 * N );

zgbbrd( 'column-major', 'both', N, N, 0, KL, KU, AB, LDAB, d, 1, e, 1, Q, N, PT, N, C, 1, WORK, 1, RWORK, 1 );
```

</section>

<!-- /.examples -->

<!-- fortran-docs:start (generated by bin/fortran-docs.mjs from data/lapack-3.12.0/SRC/zgbbrd.f; do not edit) -->

<section class="fortran-docs">

## Reference notes

The mathematical description from the reference LAPACK 3.12.0 source of `ZGBBRD`. Indices are the 1-based Fortran indices of the source.

### Purpose

ZGBBRD reduces a complex general m-by-n band matrix A to real upper bidiagonal form B by a unitary transformation: $Q^H \, A \, P = B$.

The routine computes B, and optionally forms Q or $P^H$, or computes $Q^H \, C$ for a given matrix C.

</section>

<!-- fortran-docs:end -->

<!-- Section for related `stdlib` packages. Do not manually edit this section, as it is automatically populated. -->

<section class="related">

</section>

<!-- /.related -->

<!-- Section for all links. Make sure to keep an empty line after the `section` element and another before the `/section` close. -->

<section class="links">

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array
[mdn-float32array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float32Array
[mdn-int32array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Int32Array
[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->
