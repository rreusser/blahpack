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

# ztrevc

> Computes some or all of the right and/or left eigenvectors of a complex upper triangular matrix T.

<section class="usage">

## Usage

```javascript
var ztrevc = require( '@stdlib/lapack/base/ztrevc' );
```

#### ztrevc( order, side, howmny, SELECT, strideSELECT, N, T, LDT, VL, LDVL, VR, LDVR, mm, M, WORK, strideWORK, RWORK, strideRWORK )

Computes some or all of the right and/or left eigenvectors of a complex upper triangular matrix T.

```javascript
var Complex128Array = require( '@stdlib/array/complex128' );

var T = new Complex128Array( [ 2, 1, 0, 0, 0, 0, 1, 0.5, 3, -1, 0, 0, 0.5, -0.5, 1, 1, 4, 0.5 ] );
var VR = new Complex128Array( 9 );
var VL = new Complex128Array( 9 );
var WORK = new Complex128Array( 6 );
var RWORK = new Float64Array( 3 );

var info = ztrevc( 'column-major', 'both', 'all', new Uint8Array( 3 ), 1, 3, T, 3, VL, 3, VR, 3, 3, 0, WORK, 1, RWORK, 1 );
// info => 0
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **side**: `'right'`, `'left'`, or `'both'`.
-   **howmny**: `'all'`, `'backtransform'`, or `'selected'`.
-   **SELECT**: input array.
-   **strideSELECT**: stride length for `SELECT`.
-   **N**: number of columns.
-   **T**: input matrix.
-   **LDT**: leading dimension of `T`.
-   **VL**: input matrix.
-   **LDVL**: leading dimension of `VL`.
-   **VR**: input matrix.
-   **LDVR**: leading dimension of `VR`.
-   **mm**: mm.
-   **M**: number of rows.
-   **WORK**: input array.
-   **strideWORK**: stride length for `WORK`.
-   **RWORK**: output array.
-   **strideRWORK**: stride length for `RWORK`.

#### ztrevc.ndarray( side, howmny, SELECT, strideSELECT, offsetSELECT, N, T, strideT1, strideT2, offsetT, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR, mm, M, WORK, strideWORK, offsetWORK, RWORK, strideRWORK, offsetRWORK )

Computes some or all of the right and/or left eigenvectors of a complex upper triangular matrix T., using alternative indexing semantics.

```javascript
var Complex128Array = require( '@stdlib/array/complex128' );

var T = new Complex128Array( [ 2, 1, 0, 0, 0, 0, 1, 0.5, 3, -1, 0, 0, 0.5, -0.5, 1, 1, 4, 0.5 ] );
var VR = new Complex128Array( 9 );
var VL = new Complex128Array( 9 );
var WORK = new Complex128Array( 6 );
var RWORK = new Float64Array( 3 );

var info = ztrevc.ndarray( 'both', 'all', new Uint8Array( 3 ), 1, 0, 3, T, 1, 3, 0, VL, 1, 3, 0, VR, 1, 3, 0, 3, 0, WORK, 1, 0, RWORK, 1, 0 );
// info => 0
```

The function has the following additional parameters:

-   **side**: `'right'`, `'left'`, or `'both'`.
-   **howmny**: `'all'`, `'backtransform'`, or `'selected'`.
-   **SELECT**: input array.
-   **strideSELECT**: stride length for `SELECT`.
-   **offsetSELECT**: starting index for `SELECT`.
-   **N**: number of columns.
-   **T**: input matrix.
-   **strideT1**: stride of dimension 1 of `T`.
-   **strideT2**: stride of dimension 2 of `T`.
-   **offsetT**: starting index for `T`.
-   **VL**: input matrix.
-   **strideVL1**: stride of dimension 1 of `VL`.
-   **strideVL2**: stride of dimension 2 of `VL`.
-   **offsetVL**: starting index for `VL`.
-   **VR**: input matrix.
-   **strideVR1**: stride of dimension 1 of `VR`.
-   **strideVR2**: stride of dimension 2 of `VR`.
-   **offsetVR**: starting index for `VR`.
-   **mm**: mm.
-   **M**: number of rows.
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

-   The routine computes eigenvectors of a complex upper triangular matrix T obtained from the Schur decomposition. It can compute right eigenvectors, left eigenvectors, or both.
-   When `howmny` is `'backtransform'`, VL/VR should contain the Schur vectors on entry, and the routine back-transforms them to eigenvectors of the original matrix.

</section>

<!-- /.notes -->

<section class="examples">

## Examples

```javascript
var Complex128Array = require( '@stdlib/array/complex128' );
var reinterpret = require( '@stdlib/strided/base/reinterpret-complex128' );
var ztrevc = require( '@stdlib/lapack/base/ztrevc' );

// 3x3 upper triangular matrix (column-major):
var T = new Complex128Array( [ 2, 1, 0, 0, 0, 0, 1, 0.5, 3, -1, 0, 0, 0.5, -0.5, 1, 1, 4, 0.5 ] );
var VR = new Complex128Array( 9 );
var VL = new Complex128Array( 9 );
var WORK = new Complex128Array( 6 );
var RWORK = new Float64Array( 3 );

var info = ztrevc( 'column-major', 'both', 'all', new Uint8Array( 3 ), 1, 3, T, 3, VL, 3, VR, 3, 3, 0, WORK, 1, RWORK, 1 );
// info => 0

console.log( Array.from( reinterpret( VR, 0 ) ) );
```

</section>

<!-- /.examples -->

<!-- fortran-docs:start (generated by bin/fortran-docs.mjs from data/lapack-3.12.0/SRC/ztrevc.f; do not edit) -->

<section class="fortran-docs">

## Reference documentation

From the reference LAPACK 3.12.0 source of `ZTREVC`, converted to Markdown with KaTeX math. Indices are the 1-based Fortran indices of the source.

### Purpose

ZTREVC computes some or all of the right and/or left eigenvectors of a complex upper triangular matrix T. Matrices of this type are produced by the Schur factorization of a complex general matrix: $A = Q \, T \, Q^H$, as computed by ZHSEQR.

The right eigenvector x and the left eigenvector y of T corresponding to an eigenvalue w are defined by:

$$
T \, x = w \, x, (y^H) \, T = w \, (y^H)
$$

where $y^H$ denotes the conjugate transpose of the vector y. The eigenvalues are not input to this routine, but are read directly from the diagonal of T.

This routine returns the matrices X and/or Y of right and left eigenvectors of T, or the products $Q \, X$ and/or $Q \, Y$, where Q is an input matrix. If Q is the unitary factor that reduces a matrix A to Schur form T, then $Q \, X$ and $Q \, Y$ are the matrices of right and left eigenvectors of A.

### Arguments

#### SIDE `[in]`

_CHARACTER\*1_

-   `= 'R'`: compute right eigenvectors only;
-   `= 'L'`: compute left eigenvectors only;
-   `= 'B'`: compute both right and left eigenvectors.

#### HOWMNY `[in]`

_CHARACTER\*1_

-   `= 'A'`: compute all right and/or left eigenvectors;
-   `= 'B'`: compute all right and/or left eigenvectors, backtransformed using the matrices supplied in `VR` and/or `VL`;
-   `= 'S'`: compute selected right and/or left eigenvectors, as indicated by the logical array `SELECT`.

#### SELECT `[in]`

_LOGICAL array, dimension (N)_

If `HOWMNY = 'S'`, `SELECT` specifies the eigenvectors to be computed. The eigenvector corresponding to the j-th eigenvalue is computed if `SELECT(j)` = .TRUE.. Not referenced if `HOWMNY = 'A'` or 'B'.

#### N `[in]`

_INTEGER_

The order of the matrix T. $N \ge 0$.

#### T `[in,out]`

_COMPLEX\*16 array, dimension (LDT,N)_

The upper triangular matrix T. T is modified, but restored on exit.

#### LDT `[in]`

_INTEGER_

The leading dimension of the array T. $\mathrm{LDT} \ge \max (1,N)$.

#### VL `[in,out]`

_COMPLEX\*16 array, dimension (LDVL,MM)_

On entry, if `SIDE = 'L'` or 'B' and `HOWMNY = 'B'`, `VL` must contain an N-by-N matrix Q (usually the unitary matrix Q of Schur vectors returned by ZHSEQR). On exit, if `SIDE = 'L'` or 'B', `VL` contains: if `HOWMNY = 'A'`, the matrix Y of left eigenvectors of T; if `HOWMNY = 'B'`, the matrix $Q \, Y$; if `HOWMNY = 'S'`, the left eigenvectors of T specified by

-   `SELECT`, stored consecutively in the columns
-   of `VL`, in the same order as their
-   eigenvalues.

Not referenced if `SIDE = 'R'`.

#### LDVL `[in]`

_INTEGER_

The leading dimension of the array `VL`. $\mathrm{LDVL} \ge 1$, and if `SIDE = 'L'` or 'B', $\mathrm{LDVL} \ge N$.

#### VR `[in,out]`

_COMPLEX\*16 array, dimension (LDVR,MM)_

On entry, if `SIDE = 'R'` or 'B' and `HOWMNY = 'B'`, `VR` must contain an N-by-N matrix Q (usually the unitary matrix Q of Schur vectors returned by ZHSEQR). On exit, if `SIDE = 'R'` or 'B', `VR` contains: if `HOWMNY = 'A'`, the matrix X of right eigenvectors of T; if `HOWMNY = 'B'`, the matrix $Q \, X$; if `HOWMNY = 'S'`, the right eigenvectors of T specified by

-   `SELECT`, stored consecutively in the columns
-   of `VR`, in the same order as their
-   eigenvalues.

Not referenced if `SIDE = 'L'`.

#### LDVR `[in]`

_INTEGER_

The leading dimension of the array `VR`. $\mathrm{LDVR} \ge 1$, and if `SIDE = 'R'` or 'B'; $\mathrm{LDVR} \ge N$.

#### MM `[in]`

_INTEGER_

The number of columns in the arrays `VL` and/or `VR`. $\mathrm{MM} \ge M$.

#### M `[out]`

_INTEGER_

The number of columns in the arrays `VL` and/or `VR` actually used to store the eigenvectors. If `HOWMNY = 'A'` or 'B', M is set to N. Each selected eigenvector occupies one column.

#### WORK `[out]`

_COMPLEX\*16 array, dimension (2\*N)_

#### RWORK `[out]`

_DOUBLE PRECISION array, dimension (N)_

#### INFO `[out]`

_INTEGER_

-   `= 0`: successful exit
-   `< 0`: if `INFO = -i`, the i-th argument had an illegal value

### Further Details

The algorithm used in this program is basically backward (forward) substitution, with scaling to make the the code robust against possible overflow.

Each eigenvector is normalized so that the element of largest magnitude has magnitude 1; here the magnitude of a complex number (x,y) is taken to be \|x\| + \|y\|.

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
