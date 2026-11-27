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

# zlasyf_aa

> factorize a panel of a complex symmetric matrix using Aasen's algorithm

<section class="usage">

## Usage

```javascript
var zlasyf_aa = require( '@stdlib/lapack/base/zlasyf_aa' );
```

#### zlasyf_aa( order, uplo, j1, M, nb, A, LDA, IPIV, strideIPIV, offsetIPIV, H, LDH, WORK, strideWORK )

factorize a panel of a complex symmetric matrix using Aasen's algorithm

```javascript
var Complex128Array = require( '@stdlib/array/complex128' );
var Int32Array = require( '@stdlib/array/int32' );

var A = new Complex128Array( 9 );
var H = new Complex128Array( 9 );
var WORK = new Complex128Array( 3 );
var IPIV = new Int32Array( 3 );

zlasyf_aa( 'column-major', 'lower', 1, 3, 3, A, 3, IPIV, 1, 0, H, 3, WORK, 1 );
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **uplo**: specifies whether the upper or lower triangular part of `A` is referenced (`'upper'` or `'lower'`).
-   **j1**: location (1 or 2) of the first row/column of the panel within the enclosing submatrix.
-   **M**: submatrix dimension.
-   **nb**: panel width.
-   **A**: input/output complex matrix.
-   **LDA**: leading dimension of `A`.
-   **IPIV**: output pivot vector (0-based).
-   **strideIPIV**: stride length for `IPIV`.
-   **offsetIPIV**: starting index for `IPIV`.
-   **H**: complex workspace matrix.
-   **LDH**: leading dimension of `H`.
-   **WORK**: complex scratch workspace, length at least `M`.
-   **strideWORK**: stride length for `WORK`.

#### zlasyf_aa.ndarray( uplo, j1, M, nb, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV, H, strideH1, strideH2, offsetH, WORK, strideWORK, offsetWORK )

factorize a panel of a complex symmetric matrix using Aasen's algorithm, using alternative indexing semantics.

```javascript
var Complex128Array = require( '@stdlib/array/complex128' );
var Int32Array = require( '@stdlib/array/int32' );

var A = new Complex128Array( 9 );
var H = new Complex128Array( 9 );
var WORK = new Complex128Array( 3 );
var IPIV = new Int32Array( 3 );

zlasyf_aa.ndarray( 'lower', 1, 3, 3, A, 1, 3, 0, IPIV, 1, 0, H, 1, 3, 0, WORK, 1, 0 );
```

The function has the following additional parameters:

-   **uplo**: specifies whether the upper or lower triangular part of `A` is referenced (`'upper'` or `'lower'`).
-   **j1**: location (1 or 2) of the first row/column of the panel within the enclosing submatrix.
-   **M**: submatrix dimension.
-   **nb**: panel width.
-   **A**: input/output complex matrix.
-   **strideA1**: stride of dimension 1 of `A` (in complex elements).
-   **strideA2**: stride of dimension 2 of `A` (in complex elements).
-   **offsetA**: starting index for `A` (in complex elements).
-   **IPIV**: output pivot vector (0-based).
-   **strideIPIV**: stride length for `IPIV`.
-   **offsetIPIV**: starting index for `IPIV`.
-   **H**: complex workspace matrix.
-   **strideH1**: stride of dimension 1 of `H` (in complex elements).
-   **strideH2**: stride of dimension 2 of `H` (in complex elements).
-   **offsetH**: starting index for `H` (in complex elements).
-   **WORK**: complex scratch workspace.
-   **strideWORK**: stride length for `WORK` (in complex elements).
-   **offsetWORK**: starting index for `WORK` (in complex elements).

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   Implements LAPACK's [`ZLASYF_AA`][lapack-zlasyf_aa]: factorizes a panel of `M` rows or columns of a complex symmetric matrix `A` using Aasen's algorithm.
-   The panel kernel is intended to be invoked by the higher-level `zsytrf_aa` driver, which is responsible for initializing the first column of the workspace `H` to the corresponding column (or row, for `'upper'`) of `A`.
-   `IPIV` entries are stored as 0-based row/column indices.
-   Unlike Hermitian variants (`zhetrf_aa`), all arithmetic is fully complex with no conjugation at mirror reads or real-only-diagonal forcing.

</section>

<!-- /.notes -->

<section class="examples">

## Examples

```javascript
var Complex128Array = require( '@stdlib/array/complex128' );
var Int32Array = require( '@stdlib/array/int32' );
var zlasyf_aa = require( '@stdlib/lapack/base/zlasyf_aa' );

var A = new Complex128Array( [
    4.0, 0.5, 1.0, -0.3, 2.0, 0.2,
    0.0, 0.0, 5.0, 0.3, 1.5, -0.4,
    0.0, 0.0, 0.0, 0.0, 6.0, -0.2
] );
var H = new Complex128Array( 9 );
var WORK = new Complex128Array( 3 );
var IPIV = new Int32Array( 3 );

zlasyf_aa( 'column-major', 'lower', 1, 3, 3, A, 3, IPIV, 1, 0, H, 3, WORK, 1 );
console.log( A );
console.log( IPIV );
```

[lapack-zlasyf_aa]: https://www.netlib.org/lapack/explore-html/d8/d6c/group__hetrf__aa_ga17a92a73c4dc5cdf6ddf80ea3b2ac1f0.html

</section>

<!-- /.examples -->

<!-- fortran-docs:start (generated by bin/fortran-docs.mjs from data/lapack-3.12.0/SRC/zlasyf_aa.f; do not edit) -->

<section class="fortran-docs">

## Reference notes

The mathematical description from the reference LAPACK 3.12.0 source of `ZLASYF_AA`. Indices are the 1-based Fortran indices of the source.

### Purpose

DLATRF\_AA factorizes a panel of a complex symmetric matrix A using the Aasen's algorithm. The panel consists of a set of `NB` rows of A when `UPLO` is U, or a set of `NB` columns when `UPLO` is L.

In order to factorize the panel, the Aasen's algorithm requires the last row, or column, of the previous panel. The first row, or column, of A is set to be the first row, or column, of an identity matrix, which is used to factorize the first panel.

The resulting J-th row of U, or J-th column of L, is stored in the (J-1)-th row, or column, of A (without the unit diagonals), while the diagonal and subdiagonal of A are overwritten by those of T.

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
