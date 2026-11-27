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

# dla_gbrcond

> Estimates the Skeel condition number for a general banded matrix

<section class="usage">

## Usage

```javascript
var dla_gbrcond = require( '@stdlib/lapack/base/dla_gbrcond' );
```

#### dla_gbrcond( order, trans, N, kl, ku, AB, LDAB, AFB, LDAFB, IPIV, strideIPIV, offsetIPIV, cmode, c, strideC, WORK, strideWORK, IWORK, strideIWORK, offsetIWORK )

Estimates the Skeel condition number for a general banded matrix

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Int32Array = require( '@stdlib/array/int32' );
var dgbtrf = require( '@stdlib/lapack/base/dgbtrf' );
var dla_gbrcond = require( '@stdlib/lapack/base/dla_gbrcond' );

// 3x3 tridiagonal (KL=1, KU=1) banded matrix in column-major band storage:
var AB = new Float64Array( [ 0.0, 2.0, 1.0, 3.0, 5.0, 4.0, 6.0, 8.0, 0.0 ] );
var AFB = new Float64Array( [ 0.0, 0.0, 2.0, 1.0, 0.0, 3.0, 5.0, 4.0, 0.0, 6.0, 8.0, 0.0 ] );
var IPIV = new Int32Array( 3 );
var c = new Float64Array( [ 1.0, 2.0, 3.0 ] );
var WORK = new Float64Array( 15 );
var IWORK = new Int32Array( 3 );

dgbtrf( 'column-major', 3, 3, 1, 1, AFB, 4, IPIV );
var result = dla_gbrcond( 'column-major', 'no-transpose', 3, 1, 1, AB, 3, AFB, 4, IPIV, 1, 0, 1, c, 1, WORK, 1, IWORK, 1, 0 );
// result => ~0.00571
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **trans**: transpose operation (`'no-transpose'` or `'transpose'`).
-   **N**: order of the matrix.
-   **kl**: number of subdiagonals.
-   **ku**: number of superdiagonals.
-   **AB**: original banded matrix in band storage, `(KL+KU+1)` by `N`.
-   **LDAB**: leading dimension of `AB`.
-   **AFB**: LU factored banded matrix from `dgbtrf`, `(2*KL+KU+1)` by `N`.
-   **LDAFB**: leading dimension of `AFB`.
-   **IPIV**: pivot indices from `dgbtrf` (0-based).
-   **strideIPIV**: stride length for `IPIV`.
-   **offsetIPIV**: starting index for `IPIV`.
-   **cmode**: scaling mode (1, 0, or -1).
-   **c**: scaling vector of length `N`.
-   **strideC**: stride length for `c`.
-   **WORK**: workspace array of length at least `5*N`.
-   **strideWORK**: stride length for `WORK`.
-   **IWORK**: workspace array of length at least `N`.
-   **strideIWORK**: stride length for `IWORK`.
-   **offsetIWORK**: starting index for `IWORK`.

#### dla_gbrcond.ndarray( trans, N, kl, ku, AB, strideAB1, strideAB2, offsetAB, AFB, strideAFB1, strideAFB2, offsetAFB, IPIV, strideIPIV, offsetIPIV, cmode, c, strideC, offsetC, WORK, strideWORK, offsetWORK, IWORK, strideIWORK, offsetIWORK )

Estimates the Skeel condition number for a general banded matrix, using alternative indexing semantics.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Int32Array = require( '@stdlib/array/int32' );
var dgbtrf = require( '@stdlib/lapack/base/dgbtrf' );
var dla_gbrcond = require( '@stdlib/lapack/base/dla_gbrcond' );

var AB = new Float64Array( [ 0.0, 2.0, 1.0, 3.0, 5.0, 4.0, 6.0, 8.0, 0.0 ] );
var AFB = new Float64Array( [ 0.0, 0.0, 2.0, 1.0, 0.0, 3.0, 5.0, 4.0, 0.0, 6.0, 8.0, 0.0 ] );
var IPIV = new Int32Array( 3 );
var c = new Float64Array( [ 1.0, 2.0, 3.0 ] );
var WORK = new Float64Array( 15 );
var IWORK = new Int32Array( 3 );

dgbtrf.ndarray( 3, 3, 1, 1, AFB, 1, 4, 0, IPIV, 1, 0 );
var result = dla_gbrcond.ndarray( 'no-transpose', 3, 1, 1, AB, 1, 3, 0, AFB, 1, 4, 0, IPIV, 1, 0, 1, c, 1, 0, WORK, 1, 0, IWORK, 1, 0 );
// result => ~0.00571
```

The function has the following additional parameters:

-   **trans**: specifies the operation type.
-   **N**: number of columns.
-   **kl**: kl.
-   **ku**: ku.
-   **AB**: input matrix.
-   **strideAB1**: stride of dimension 1 of `AB`.
-   **strideAB2**: stride of dimension 2 of `AB`.
-   **offsetAB**: starting index for `AB`.
-   **AFB**: input matrix.
-   **strideAFB1**: stride of dimension 1 of `AFB`.
-   **strideAFB2**: stride of dimension 2 of `AFB`.
-   **offsetAFB**: starting index for `AFB`.
-   **IPIV**: input array.
-   **strideIPIV**: stride length for `IPIV`.
-   **offsetIPIV**: starting index for `IPIV`.
-   **cmode**: cmode.
-   **c**: input array.
-   **strideC**: stride length for `c`.
-   **offsetC**: starting index for `C`.
-   **WORK**: input array.
-   **strideWORK**: stride length for `WORK`.
-   **offsetWORK**: starting index for `WORK`.
-   **IWORK**: output array.
-   **strideIWORK**: stride length for `IWORK`.
-   **offsetIWORK**: starting index for `IWORK`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   The routine requires a pre-factored matrix from `dgbtrf`. Both the original band matrix `AB` and the factored matrix `AFB` with pivot indices `IPIV` must be provided.
-   `cmode` controls how the scaling vector `c` is applied: `1` for column scaling, `0` for no scaling, `-1` for inverse scaling.
-   `WORK` must have at least `5*N` elements. `IWORK` must have at least `N` elements.

</section>

<!-- /.notes -->

<section class="examples">

## Examples

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Int32Array = require( '@stdlib/array/int32' );
var dgbtrf = require( '@stdlib/lapack/base/dgbtrf' );
var dla_gbrcond = require( '@stdlib/lapack/base/dla_gbrcond' );

// 3x3 tridiagonal matrix (KL=1, KU=1):
// [ 2  3  0 ]
// [ 1  5  6 ]
// [ 0  4  8 ]
var AB = new Float64Array( [ 0.0, 2.0, 1.0, 3.0, 5.0, 4.0, 6.0, 8.0, 0.0 ] );
var AFB = new Float64Array( [ 0.0, 0.0, 2.0, 1.0, 0.0, 3.0, 5.0, 4.0, 0.0, 6.0, 8.0, 0.0 ] );
var IPIV = new Int32Array( 3 );
var c = new Float64Array( [ 1.0, 2.0, 3.0 ] );
var WORK = new Float64Array( 15 );
var IWORK = new Int32Array( 3 );

dgbtrf.ndarray( 3, 3, 1, 1, AFB, 1, 4, 0, IPIV, 1, 0 );

var result = dla_gbrcond.ndarray(
    'no-transpose', 3, 1, 1,
    AB, 1, 3, 0,
    AFB, 1, 4, 0,
    IPIV, 1, 0,
    1, c, 1, 0,
    WORK, 1, 0,
    IWORK, 1, 0
);
console.log( result );
// => ~0.00571
```

</section>

<!-- /.examples -->

<!-- fortran-docs:start (generated by bin/fortran-docs.mjs from data/lapack-3.12.0/SRC/dla_gbrcond.f; do not edit) -->

<section class="fortran-docs">

## Reference notes

The mathematical description from the reference LAPACK 3.12.0 source of `DLA_GBRCOND`. Indices are the 1-based Fortran indices of the source.

### Purpose

DLA\_GBRCOND Estimates the Skeel condition number of op(A) \* op2(C) where op2 is determined by `CMODE` as follows

| `CMODE =  1` | op2(C) = C |
| --- | --- |
| `CMODE =  0` | op2(C) = I |
| `CMODE = -1` | op2(C) = inv(C) |

The Skeel condition number cond(A) = norminf( \|inv(A)\|\|A\| ) is computed by computing scaling factors R such that $\operatorname{diag}(R) \, A$\*op2(C) is row equilibrated and computing the standard infinity-norm condition number.

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
