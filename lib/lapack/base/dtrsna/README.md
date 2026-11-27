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

# dtrsna

> Estimates reciprocal condition numbers of eigenvalues and/or eigenvectors of a real upper quasi-triangular matrix

<section class="usage">

## Usage

```javascript
var dtrsna = require( '@stdlib/lapack/base/dtrsna' );
```

#### dtrsna( order, job, howmny, SELECT, strideSELECT, N, T, LDT, VL, LDVL, VR, LDVR, s, strideS, SEP, strideSEP, mm, M, WORK, LDWORK, IWORK, strideIWORK, offsetIWORK )

Estimates reciprocal condition numbers of eigenvalues and/or eigenvectors of a real upper quasi-triangular matrix

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Int32Array = require( '@stdlib/array/int32' );
var Uint8Array = require( '@stdlib/array/uint8' );

// Schur factor T = diag( 1, 2, 3 ) with identity eigenvectors:
var T = new Float64Array([ 1.0, 0.0, 0.0, 0.0, 2.0, 0.0, 0.0, 0.0, 3.0 ]);
var VL = new Float64Array([ 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0 ]);
var VR = new Float64Array([ 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0 ]);
var SELECT = new Uint8Array( 3 );
var s = new Float64Array( 3 );
var SEP = new Float64Array( 3 );
var WORK = new Float64Array( 3 * 9 );
var IWORK = new Int32Array( 6 );

var out = dtrsna( 'column-major', 'eigenvalues', 'all', SELECT, 1, 3, T, 3, VL, 3, VR, 3, s, 1, SEP, 1, 3, WORK, 3, IWORK, 1, 0 );
// out => { 'info': 0, 'm': 3 }; s => reciprocal eigenvalue condition numbers
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **job**: specifies the operation type.
-   **howmny**: specifies the operation type.
-   **SELECT**: input array.
-   **strideSELECT**: stride length for `SELECT`.
-   **N**: number of columns.
-   **T**: input matrix.
-   **LDT**: leading dimension of `T`.
-   **VL**: input matrix.
-   **LDVL**: leading dimension of `VL`.
-   **VR**: input matrix.
-   **LDVR**: leading dimension of `VR`.
-   **s**: input array.
-   **strideS**: stride length for `s`.
-   **SEP**: input array.
-   **strideSEP**: stride length for `SEP`.
-   **mm**: mm.
-   **M**: number of rows.
-   **WORK**: input matrix.
-   **LDWORK**: leading dimension of `WORK`.
-   **IWORK**: output array.
-   **strideIWORK**: stride length for `IWORK`.
-   **offsetIWORK**: starting index for `IWORK`.

#### dtrsna.ndarray( job, howmny, SELECT, strideSELECT, offsetSELECT, N, T, strideT1, strideT2, offsetT, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR, s, strideS, offsetS, SEP, strideSEP, offsetSEP, mm, M, WORK, strideWORK1, strideWORK2, offsetWORK, IWORK, strideIWORK, offsetIWORK )

Estimates reciprocal condition numbers of eigenvalues and/or eigenvectors of a real upper quasi-triangular matrix, using alternative indexing semantics.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Int32Array = require( '@stdlib/array/int32' );
var Uint8Array = require( '@stdlib/array/uint8' );

// Schur factor T = diag( 1, 2, 3 ) with identity eigenvectors:
var T = new Float64Array([ 1.0, 0.0, 0.0, 0.0, 2.0, 0.0, 0.0, 0.0, 3.0 ]);
var VL = new Float64Array([ 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0 ]);
var VR = new Float64Array([ 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0 ]);
var SELECT = new Uint8Array( 3 );
var s = new Float64Array( 3 );
var SEP = new Float64Array( 3 );
var WORK = new Float64Array( 3 * 9 );
var IWORK = new Int32Array( 6 );

// ndarray form: explicit strides/offsets, no `order` argument:
var out = dtrsna( 'eigenvalues', 'all', SELECT, 1, 0, 3, T, 1, 3, 0, VL, 1, 3, 0, VR, 1, 3, 0, s, 1, 0, SEP, 1, 0, 3, WORK, 1, 3, 0, IWORK, 1, 0 );
// out => { 'info': 0, 'm': 3 }; s => reciprocal eigenvalue condition numbers
```

The function has the following additional parameters:

-   **job**: specifies the operation type.
-   **howmny**: specifies the operation type.
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
-   **s**: input array.
-   **strideS**: stride length for `s`.
-   **offsetS**: starting index for `S`.
-   **SEP**: input array.
-   **strideSEP**: stride length for `SEP`.
-   **offsetSEP**: starting index for `SEP`.
-   **mm**: mm.
-   **M**: number of rows.
-   **WORK**: input matrix.
-   **strideWORK1**: stride of dimension 1 of `WORK`.
-   **strideWORK2**: stride of dimension 2 of `WORK`.
-   **offsetWORK**: starting index for `WORK`.
-   **IWORK**: output array.
-   **strideIWORK**: stride length for `IWORK`.
-   **offsetIWORK**: starting index for `IWORK`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `s` receives reciprocal condition numbers of the selected eigenvalues (when
    `job` is `'eigenvalues'` or `'both'`); `SEP` receives reciprocal condition
    numbers of the eigenvectors (when `job` is `'eigenvectors'` or `'both'`).
-   `T` must be in real Schur form (upper quasi-triangular). `dtrsna` is an
    internal auxiliary used by the eigensolver condition-estimation path.

</section>

<!-- /.notes -->

<section class="examples">

## Examples

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Int32Array = require( '@stdlib/array/int32' );
var Uint8Array = require( '@stdlib/array/uint8' );

// Schur factor T = diag( 1, 2, 3 ) with identity eigenvectors:
var T = new Float64Array([ 1.0, 0.0, 0.0, 0.0, 2.0, 0.0, 0.0, 0.0, 3.0 ]);
var VL = new Float64Array([ 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0 ]);
var VR = new Float64Array([ 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0 ]);
var SELECT = new Uint8Array( 3 );
var s = new Float64Array( 3 );
var SEP = new Float64Array( 3 );
var WORK = new Float64Array( 3 * 9 );
var IWORK = new Int32Array( 6 );

var out = dtrsna( 'column-major', 'eigenvalues', 'all', SELECT, 1, 3, T, 3, VL, 3, VR, 3, s, 1, SEP, 1, 3, WORK, 3, IWORK, 1, 0 );
// out => { 'info': 0, 'm': 3 }; s => reciprocal eigenvalue condition numbers

console.log( out.info, Array.prototype.slice.call( s, 0, 3 ) );
```

</section>

<!-- /.examples -->

<!-- fortran-docs:start (generated by bin/fortran-docs.mjs from data/lapack-3.12.0/SRC/dtrsna.f; do not edit) -->

<section class="fortran-docs">

## Reference documentation

From the reference LAPACK 3.12.0 source of `DTRSNA`, converted to Markdown with KaTeX math. Indices are the 1-based Fortran indices of the source.

### Purpose

DTRSNA estimates reciprocal condition numbers for specified eigenvalues and/or right eigenvectors of a real upper quasi-triangular matrix T (or of any matrix $Q \, T \, Q^T$ with Q orthogonal).

T must be in Schur canonical form (as returned by DHSEQR), that is, block upper triangular with 1-by-1 and 2-by-2 diagonal blocks; each 2-by-2 diagonal block has its diagonal elements equal and its off-diagonal elements of opposite sign.

### Arguments

#### JOB `[in]`

_CHARACTER\*1_

Specifies whether condition numbers are required for eigenvalues (S) or eigenvectors (`SEP`):

-   `= 'E'`: for eigenvalues only (S);
-   `= 'V'`: for eigenvectors only (`SEP`);
-   `= 'B'`: for both eigenvalues and eigenvectors (S and `SEP`).

#### HOWMNY `[in]`

_CHARACTER\*1_

-   `= 'A'`: compute condition numbers for all eigenpairs;
-   `= 'S'`: compute condition numbers for selected eigenpairs specified by the array `SELECT`.

#### SELECT `[in]`

_LOGICAL array, dimension (N)_

If `HOWMNY = 'S'`, `SELECT` specifies the eigenpairs for which condition numbers are required. To select condition numbers for the eigenpair corresponding to a real eigenvalue w(j), `SELECT(j)` must be set to .TRUE.. To select condition numbers corresponding to a complex conjugate pair of eigenvalues w(j) and w(j+1), either `SELECT(j)` or `SELECT(j+1)` or both, must be set to .TRUE.. If `HOWMNY = 'A'`, `SELECT` is not referenced.

#### N `[in]`

_INTEGER_

The order of the matrix T. $N \ge 0$.

#### T `[in]`

_DOUBLE PRECISION array, dimension (LDT,N)_

The upper quasi-triangular matrix T, in Schur canonical form.

#### LDT `[in]`

_INTEGER_

The leading dimension of the array T. $\mathrm{LDT} \ge \max (1,N)$.

#### VL `[in]`

_DOUBLE PRECISION array, dimension (LDVL,M)_

If `JOB = 'E'` or 'B', `VL` must contain left eigenvectors of T (or of any $Q \, T \, Q^T$ with Q orthogonal), corresponding to the eigenpairs specified by `HOWMNY` and `SELECT`. The eigenvectors must be stored in consecutive columns of `VL`, as returned by DHSEIN or DTREVC. If `JOB = 'V'`, `VL` is not referenced.

#### LDVL `[in]`

_INTEGER_

The leading dimension of the array `VL`. $\mathrm{LDVL} \ge 1$; and if `JOB = 'E'` or 'B', $\mathrm{LDVL} \ge N$.

#### VR `[in]`

_DOUBLE PRECISION array, dimension (LDVR,M)_

If `JOB = 'E'` or 'B', `VR` must contain right eigenvectors of T (or of any $Q \, T \, Q^T$ with Q orthogonal), corresponding to the eigenpairs specified by `HOWMNY` and `SELECT`. The eigenvectors must be stored in consecutive columns of `VR`, as returned by DHSEIN or DTREVC. If `JOB = 'V'`, `VR` is not referenced.

#### LDVR `[in]`

_INTEGER_

The leading dimension of the array `VR`. $\mathrm{LDVR} \ge 1$; and if `JOB = 'E'` or 'B', $\mathrm{LDVR} \ge N$.

#### S `[out]`

_DOUBLE PRECISION array, dimension (MM)_

If `JOB = 'E'` or 'B', the reciprocal condition numbers of the selected eigenvalues, stored in consecutive elements of the array. For a complex conjugate pair of eigenvalues two consecutive elements of S are set to the same value. Thus `S(j)`, `SEP(j)`, and the j-th columns of `VL` and `VR` all correspond to the same eigenpair (but not in general the j-th eigenpair, unless all eigenpairs are selected). If `JOB = 'V'`, S is not referenced.

#### SEP `[out]`

_DOUBLE PRECISION array, dimension (MM)_

If `JOB = 'V'` or 'B', the estimated reciprocal condition numbers of the selected eigenvectors, stored in consecutive elements of the array. For a complex eigenvector two consecutive elements of `SEP` are set to the same value. If the eigenvalues cannot be reordered to compute `SEP(j)`, `SEP(j)` is set to 0; this can only occur when the true value would be very small anyway. If `JOB = 'E'`, `SEP` is not referenced.

#### MM `[in]`

_INTEGER_

The number of elements in the arrays S (if `JOB = 'E'` or 'B') and/or `SEP` (if `JOB = 'V'` or 'B'). $\mathrm{MM} \ge M$.

#### M `[out]`

_INTEGER_

The number of elements of the arrays S and/or `SEP` actually used to store the estimated condition numbers. If `HOWMNY = 'A'`, M is set to N.

#### WORK `[out]`

_DOUBLE PRECISION array, dimension (LDWORK,N+6)_

If `JOB = 'E'`, `WORK` is not referenced.

#### LDWORK `[in]`

_INTEGER_

The leading dimension of the array `WORK`. $\mathrm{LDWORK} \ge 1$; and if `JOB = 'V'` or 'B', $\mathrm{LDWORK} \ge N$.

#### IWORK `[out]`

_INTEGER array, dimension (2\*(N-1))_

If `JOB = 'E'`, `IWORK` is not referenced.

#### INFO `[out]`

_INTEGER_

-   `= 0`: successful exit
-   `< 0`: if `INFO = -i`, the i-th argument had an illegal value

### Further Details

The reciprocal of the condition number of an eigenvalue $\lambda$ is defined as

$$
S(\lambda ) = |v^T \, u| / (\operatorname{norm}(u) \, \operatorname{norm}(v))
$$

where u and v are the right and left eigenvectors of T corresponding to $\lambda$; $v^T$ denotes the transpose of v, and norm(u) denotes the Euclidean norm. These reciprocal condition numbers always lie between zero (very badly conditioned) and one (very well conditioned). If $n = 1$, `S(lambda)` is defined to be 1.

An approximate error bound for a computed eigenvalue W(i) is given by

$$
\mathrm{EPS} \, \operatorname{norm}(T) / S(i)
$$

where EPS is the machine precision.

The reciprocal of the condition number of the right eigenvector u corresponding to $\lambda$ is defined as follows. Suppose

$$
T = \begin{pmatrix} \lambda & c \\ 0 & T_{22} \end{pmatrix}
$$

Then the reciprocal condition number is

$$
\mathrm{SEP}( \lambda , T_{22} ) = \sigma -\min ( T_{22} - \lambda \, I )
$$

where $\sigma$-min denotes the smallest singular value. We approximate the smallest singular value by the reciprocal of an estimate of the one-norm of the inverse of $T_{22} - \lambda \, I$. If $n = 1$, `SEP(1)` is defined to be abs(`T(1,1)`).

An approximate error bound for a computed right eigenvector `VR(i)` is given by

$$
\mathrm{EPS} \, \operatorname{norm}(T) / \mathrm{SEP}(i)
$$

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
