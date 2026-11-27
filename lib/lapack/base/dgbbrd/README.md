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

# dgbbrd

> Reduces a real general band matrix to upper bidiagonal form

<section class="usage">

## Usage

```javascript
var dgbbrd = require( '@stdlib/lapack/base/dgbbrd' );
```

#### dgbbrd( order, vect, M, N, ncc, kl, ku, AB, LDAB, d, strideD, e, strideE, Q, LDQ, PT, LDPT, C, LDC, WORK, strideWORK )

Reduces a real general band matrix to upper bidiagonal form

```javascript
var Float64Array = require( '@stdlib/array/float64' );

var AB = new Float64Array([
    0.0, 4.0, -1.0,
    -1.0, 4.0, -1.0,
    -1.0, 4.0, -1.0,
    -1.0, 4.0, -1.0,
    -1.0, 4.0, 0.0
]);
var d = new Float64Array( 5 );
var e = new Float64Array( 4 );
var Q = new Float64Array( 1 );
var PT = new Float64Array( 1 );
var C = new Float64Array( 1 );
var WORK = new Float64Array( 10 );

dgbbrd( 'column-major', 'no-vectors', 5, 5, 0, 1, 1, AB, 3, d, 1, e, 1, Q, 1, PT, 1, C, 1, WORK, 1 );
// d => <Float64Array>[ ... ]
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **vect**: one of `'no-vectors'`, `'q-only'`, `'p-only'`, or `'both'`.
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
-   **WORK**: output array.
-   **strideWORK**: stride length for `WORK`.

#### dgbbrd.ndarray( vect, M, N, ncc, kl, ku, AB, strideAB1, strideAB2, offsetAB, d, strideD, offsetD, e, strideE, offsetE, Q, strideQ1, strideQ2, offsetQ, PT, stridePT1, stridePT2, offsetPT, C, strideC1, strideC2, offsetC, WORK, strideWORK, offsetWORK )

Reduces a real general band matrix to upper bidiagonal form, using alternative indexing semantics.

```javascript
var Float64Array = require( '@stdlib/array/float64' );

var AB = new Float64Array([
    0.0, 4.0, -1.0,
    -1.0, 4.0, -1.0,
    -1.0, 4.0, -1.0,
    -1.0, 4.0, -1.0,
    -1.0, 4.0, 0.0
]);
var d = new Float64Array( 5 );
var e = new Float64Array( 4 );
var Q = new Float64Array( 1 );
var PT = new Float64Array( 1 );
var C = new Float64Array( 1 );
var WORK = new Float64Array( 10 );

dgbbrd.ndarray( 'no-vectors', 5, 5, 0, 1, 1, AB, 1, 3, 0, d, 1, 0, e, 1, 0, Q, 1, 1, 0, PT, 1, 1, 0, C, 1, 1, 0, WORK, 1, 0 );
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
-   **WORK**: output array.
-   **strideWORK**: stride length for `WORK`.
-   **offsetWORK**: starting index for `WORK`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `vect` must be one of `'no-vectors'`, `'q-only'`, `'p-only'`, or `'both'` to control whether `Q` and/or `P**T` are accumulated.
-   Band storage follows LAPACK convention: `AB(ku+1+i-j, j) = A(i,j)`, so the matrix is stored with `KL+KU+1` rows.
-   `WORK` must have length at least `2 * max(M, N)`.

</section>

<!-- /.notes -->

<section class="examples">

## Examples

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var dgbbrd = require( '@stdlib/lapack/base/dgbbrd' );

var AB = new Float64Array([
    0.0, 4.0, -1.0,
    -1.0, 4.0, -1.0,
    -1.0, 4.0, -1.0,
    -1.0, 4.0, -1.0,
    -1.0, 4.0, 0.0
]);
var d = new Float64Array( 5 );
var e = new Float64Array( 4 );
var Q = new Float64Array( 1 );
var PT = new Float64Array( 1 );
var C = new Float64Array( 1 );
var WORK = new Float64Array( 10 );

dgbbrd( 'column-major', 'no-vectors', 5, 5, 0, 1, 1, AB, 3, d, 1, e, 1, Q, 1, PT, 1, C, 1, WORK, 1 );

console.log( d );
console.log( e );
```

</section>

<!-- /.examples -->

<!-- fortran-docs:start (generated by bin/fortran-docs.mjs from data/lapack-3.12.0/SRC/dgbbrd.f; do not edit) -->

<section class="fortran-docs">

## Reference notes

The mathematical description from the reference LAPACK 3.12.0 source of `DGBBRD`. Indices are the 1-based Fortran indices of the source.

### Purpose

DGBBRD reduces a real general m-by-n band matrix A to upper bidiagonal form B by an orthogonal transformation: $Q^T \, A \, P = B$.

The routine computes B, and optionally forms Q or $P^T$, or computes $Q^T \, C$ for a given matrix C.

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
