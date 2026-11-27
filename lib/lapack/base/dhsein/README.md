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

# dhsein

> Uses inverse iteration to find right and/or left eigenvectors of a real upper Hessenberg matrix

<section class="usage">

## Usage

```javascript
var dhsein = require( '@stdlib/lapack/base/dhsein' );
```

#### dhsein( order, side, eigsrc, initv, SELECT, strideSELECT, N, H, LDH, WR, strideWR, WI, strideWI, VL, LDVL, VR, LDVR, mm, M, WORK, strideWORK, IFAILL, strideIFAILL, offsetIFAILL, IFAILR, strideIFAILR, offsetIFAILR )

Uses inverse iteration to find right and/or left eigenvectors of a real upper Hessenberg matrix

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Int32Array = require( '@stdlib/array/int32' );

var N = 3;
var H = new Float64Array( [ 1.0, 0.0, 0.0, 2.0, 4.0, 0.0, 3.0, 5.0, 6.0 ] );
var WR = new Float64Array( [ 1.0, 4.0, 6.0 ] );
var WI = new Float64Array( N );
var SELECT = new Uint8Array( [ 1, 1, 1 ] );
var VL = new Float64Array( N * N );
var VR = new Float64Array( N * N );
var WORK = new Float64Array( ( N + 2 ) * N );
var IFAILL = new Int32Array( N );
var IFAILR = new Int32Array( N );

var res = dhsein( 'column-major', 'right', 'no-source', 'no-init', SELECT, 1, N, H, N, WR, 1, WI, 1, VL, N, VR, N, N, 0, WORK, 1, IFAILL, 1, 0, IFAILR, 1, 0 );
// returns { info, m }
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **side**: specifies the operation type.
-   **eigsrc**: specifies the operation type.
-   **initv**: specifies the operation type.
-   **SELECT**: input array.
-   **strideSELECT**: stride length for `SELECT`.
-   **N**: number of columns.
-   **H**: input matrix.
-   **LDH**: leading dimension of `H`.
-   **WR**: input array.
-   **strideWR**: stride length for `WR`.
-   **WI**: input array.
-   **strideWI**: stride length for `WI`.
-   **VL**: input matrix.
-   **LDVL**: leading dimension of `VL`.
-   **VR**: input matrix.
-   **LDVR**: leading dimension of `VR`.
-   **mm**: mm.
-   **M**: number of rows.
-   **WORK**: input array.
-   **strideWORK**: stride length for `WORK`.
-   **IFAILL**: input array.
-   **strideIFAILL**: stride length for `IFAILL`.
-   **offsetIFAILL**: starting index for `IFAILL`.
-   **IFAILR**: output array.
-   **strideIFAILR**: stride length for `IFAILR`.
-   **offsetIFAILR**: starting index for `IFAILR`.

#### dhsein.ndarray( side, eigsrc, initv, SELECT, strideSELECT, offsetSELECT, N, H, strideH1, strideH2, offsetH, WR, strideWR, offsetWR, WI, strideWI, offsetWI, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR, mm, M, WORK, strideWORK, offsetWORK, IFAILL, strideIFAILL, offsetIFAILL, IFAILR, strideIFAILR, offsetIFAILR )

Uses inverse iteration to find right and/or left eigenvectors of a real upper Hessenberg matrix, using alternative indexing semantics.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Int32Array = require( '@stdlib/array/int32' );

var N = 3;
var H = new Float64Array( [ 1.0, 0.0, 0.0, 2.0, 4.0, 0.0, 3.0, 5.0, 6.0 ] );
var WR = new Float64Array( [ 1.0, 4.0, 6.0 ] );
var WI = new Float64Array( N );
var SELECT = new Uint8Array( [ 1, 1, 1 ] );
var VL = new Float64Array( N * N );
var VR = new Float64Array( N * N );
var WORK = new Float64Array( ( N + 2 ) * N );
var IFAILL = new Int32Array( N );
var IFAILR = new Int32Array( N );

var res = dhsein.ndarray( 'right', 'no-source', 'no-init', SELECT, 1, 0, N, H, 1, N, 0, WR, 1, 0, WI, 1, 0, VL, 1, N, 0, VR, 1, N, 0, N, 0, WORK, 1, 0, IFAILL, 1, 0, IFAILR, 1, 0 );
// returns { info, m }
```

The function has the following additional parameters:

-   **side**: specifies the operation type.
-   **eigsrc**: specifies the operation type.
-   **initv**: specifies the operation type.
-   **SELECT**: input array.
-   **strideSELECT**: stride length for `SELECT`.
-   **offsetSELECT**: starting index for `SELECT`.
-   **N**: number of columns.
-   **H**: input matrix.
-   **strideH1**: stride of dimension 1 of `H`.
-   **strideH2**: stride of dimension 2 of `H`.
-   **offsetH**: starting index for `H`.
-   **WR**: input array.
-   **strideWR**: stride length for `WR`.
-   **offsetWR**: starting index for `WR`.
-   **WI**: input array.
-   **strideWI**: stride length for `WI`.
-   **offsetWI**: starting index for `WI`.
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
-   **IFAILL**: input array.
-   **strideIFAILL**: stride length for `IFAILL`.
-   **offsetIFAILL**: starting index for `IFAILL`.
-   **IFAILR**: output array.
-   **strideIFAILR**: stride length for `IFAILR`.
-   **offsetIFAILR**: starting index for `IFAILR`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `SELECT` is a Uint8Array (or Array) of length `N` where `SELECT[i] !== 0` selects the eigenvector corresponding to `wr[i] + i*wi[i]`. For complex conjugate pairs, if either member is selected both are computed and `SELECT` is updated so only the first is marked.
-   The function returns an object `{ info, m }`, where `m` is the number of eigenvectors actually computed (columns of `VL`/`VR`).
-   `WORK` must be at least `(N+2)*N` doubles.

</section>

<!-- /.notes -->

<section class="examples">

## Examples

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Int32Array = require( '@stdlib/array/int32' );
var dhsein = require( '@stdlib/lapack/base/dhsein' );

var N = 3;
var H = new Float64Array( [ 1.0, 0.0, 0.0, 2.0, 4.0, 0.0, 3.0, 5.0, 6.0 ] );
var WR = new Float64Array( [ 1.0, 4.0, 6.0 ] );
var WI = new Float64Array( N );
var SELECT = new Uint8Array( [ 1, 1, 1 ] );
var VL = new Float64Array( N * N );
var VR = new Float64Array( N * N );
var WORK = new Float64Array( ( N + 2 ) * N );
var IFAILL = new Int32Array( N );
var IFAILR = new Int32Array( N );

console.log( dhsein.ndarray( 'right', 'no-source', 'no-init', SELECT, 1, 0, N, H, 1, N, 0, WR, 1, 0, WI, 1, 0, VL, 1, N, 0, VR, 1, N, 0, N, 0, WORK, 1, 0, IFAILL, 1, 0, IFAILR, 1, 0 ) );
console.log( VR );
```

</section>

<!-- /.examples -->

<!-- fortran-docs:start (generated by bin/fortran-docs.mjs from data/lapack-3.12.0/SRC/dhsein.f; do not edit) -->

<section class="fortran-docs">

## Reference documentation

From the reference LAPACK 3.12.0 source of `DHSEIN`, converted to Markdown with KaTeX math. Indices are the 1-based Fortran indices of the source.

### Purpose

DHSEIN uses inverse iteration to find specified right and/or left eigenvectors of a real upper Hessenberg matrix H.

The right eigenvector x and the left eigenvector y of the matrix H corresponding to an eigenvalue w are defined by:

$$
H \, x = w \, x, y^h \, H = w \, y^h
$$

where $y^h$ denotes the conjugate transpose of the vector y.

### Arguments

#### SIDE `[in]`

_CHARACTER\*1_

-   `= 'R'`: compute right eigenvectors only;
-   `= 'L'`: compute left eigenvectors only;
-   `= 'B'`: compute both right and left eigenvectors.

#### EIGSRC `[in]`

_CHARACTER\*1_

Specifies the source of eigenvalues supplied in (`WR`,`WI`):

-   `= 'Q'`: the eigenvalues were found using DHSEQR; thus, if H has zero subdiagonal elements, and so is block-triangular, then the j-th eigenvalue can be assumed to be an eigenvalue of the block containing the j-th row/column.  This property allows DHSEIN to perform inverse iteration on just one diagonal block.
-   `= 'N'`: no assumptions are made on the correspondence between eigenvalues and diagonal blocks.  In this case, DHSEIN must always perform inverse iteration using the whole matrix H.

#### INITV `[in]`

_CHARACTER\*1_

-   `= 'N'`: no initial vectors are supplied;
-   `= 'U'`: user-supplied initial vectors are stored in the arrays `VL` and/or `VR`.

#### SELECT `[in,out]`

_LOGICAL array, dimension (N)_

Specifies the eigenvectors to be computed. To select the real eigenvector corresponding to a real eigenvalue `WR(j)`, `SELECT(j)` must be set to .TRUE.. To select the complex eigenvector corresponding to a complex eigenvalue (`WR(j)`,`WI(j)`), with complex conjugate (`WR(j+1)`,`WI(j+1)`), either `SELECT(j)` or `SELECT(j+1)` or both must be set to .TRUE.; then on exit `SELECT(j)` is .TRUE. and `SELECT(j+1)` is .FALSE..

#### N `[in]`

_INTEGER_

The order of the matrix H. $N \ge 0$.

#### H `[in]`

_DOUBLE PRECISION array, dimension (LDH,N)_

The upper Hessenberg matrix H. If a NaN is detected in H, the routine will return with `INFO=-6`.

#### LDH `[in]`

_INTEGER_

The leading dimension of the array H. $\mathrm{LDH} \ge \max (1,N)$.

#### WR `[in,out]`

_DOUBLE PRECISION array, dimension (N)_

#### WI `[in]`

_DOUBLE PRECISION array, dimension (N)_

On entry, the real and imaginary parts of the eigenvalues of H; a complex conjugate pair of eigenvalues must be stored in consecutive elements of `WR` and `WI`. On exit, `WR` may have been altered since close eigenvalues are perturbed slightly in searching for independent eigenvectors.

#### VL `[in,out]`

_DOUBLE PRECISION array, dimension (LDVL,MM)_

On entry, if `INITV = 'U'` and `SIDE = 'L'` or 'B', `VL` must contain starting vectors for the inverse iteration for the left eigenvectors; the starting vector for each eigenvector must be in the same column(s) in which the eigenvector will be stored. On exit, if `SIDE = 'L'` or 'B', the left eigenvectors specified by `SELECT` will be stored consecutively in the columns of `VL`, in the same order as their eigenvalues. A complex eigenvector corresponding to a complex eigenvalue is stored in two consecutive columns, the first holding the real part and the second the imaginary part. If `SIDE = 'R'`, `VL` is not referenced.

#### LDVL `[in]`

_INTEGER_

The leading dimension of the array `VL`. $\mathrm{LDVL} \ge \max (1,N)$ if `SIDE = 'L'` or 'B'; $\mathrm{LDVL} \ge 1$ otherwise.

#### VR `[in,out]`

_DOUBLE PRECISION array, dimension (LDVR,MM)_

On entry, if `INITV = 'U'` and `SIDE = 'R'` or 'B', `VR` must contain starting vectors for the inverse iteration for the right eigenvectors; the starting vector for each eigenvector must be in the same column(s) in which the eigenvector will be stored. On exit, if `SIDE = 'R'` or 'B', the right eigenvectors specified by `SELECT` will be stored consecutively in the columns of `VR`, in the same order as their eigenvalues. A complex eigenvector corresponding to a complex eigenvalue is stored in two consecutive columns, the first holding the real part and the second the imaginary part. If `SIDE = 'L'`, `VR` is not referenced.

#### LDVR `[in]`

_INTEGER_

The leading dimension of the array `VR`. $\mathrm{LDVR} \ge \max (1,N)$ if `SIDE = 'R'` or 'B'; $\mathrm{LDVR} \ge 1$ otherwise.

#### MM `[in]`

_INTEGER_

The number of columns in the arrays `VL` and/or `VR`. $\mathrm{MM} \ge M$.

#### M `[out]`

_INTEGER_

The number of columns in the arrays `VL` and/or `VR` required to store the eigenvectors; each selected real eigenvector occupies one column and each selected complex eigenvector occupies two columns.

#### WORK `[out]`

_DOUBLE PRECISION array, dimension ((N+2)\*N)_

#### IFAILL `[out]`

_INTEGER array, dimension (MM)_

If `SIDE = 'L'` or 'B', $\mathrm{IFAILL}(i) = j > 0$ if the left eigenvector in the i-th column of `VL` (corresponding to the eigenvalue w(j)) failed to converge; `IFAILL(i) = 0` if the eigenvector converged satisfactorily. If the i-th and (i+1)th columns of `VL` hold a complex eigenvector, then `IFAILL(i)` and `IFAILL(i+1)` are set to the same value. If `SIDE = 'R'`, `IFAILL` is not referenced.

#### IFAILR `[out]`

_INTEGER array, dimension (MM)_

If `SIDE = 'R'` or 'B', $\mathrm{IFAILR}(i) = j > 0$ if the right eigenvector in the i-th column of `VR` (corresponding to the eigenvalue w(j)) failed to converge; `IFAILR(i) = 0` if the eigenvector converged satisfactorily. If the i-th and (i+1)th columns of `VR` hold a complex eigenvector, then `IFAILR(i)` and `IFAILR(i+1)` are set to the same value. If `SIDE = 'L'`, `IFAILR` is not referenced.

#### INFO `[out]`

_INTEGER_

-   `= 0`: successful exit
-   `< 0`: if `INFO = -i`, the i-th argument had an illegal value
-   `> 0`: if `INFO = i`, i is the number of eigenvectors which failed to converge; see `IFAILL` and `IFAILR` for further details.

### Further Details

Each eigenvector is normalized so that the element of largest magnitude has magnitude 1; here the magnitude of a complex number (x,y) is taken to be \|x\|+\|y\|.

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
