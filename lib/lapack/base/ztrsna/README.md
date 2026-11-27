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

# ztrsna

> Estimates reciprocal condition numbers for eigenvalues and eigenvectors of a complex triangular matrix

<section class="usage">

## Usage

```javascript
var ztrsna = require( '@stdlib/lapack/base/ztrsna' );
```

#### ztrsna( order, job, howmny, SELECT, strideSELECT, N, T, LDT, VL, LDVL, VR, LDVR, s, strideS, SEP, strideSEP, mm, M, WORK, LDWORK, RWORK, strideRWORK )

Estimates reciprocal condition numbers for eigenvalues and eigenvectors of a complex triangular matrix

```javascript
var Complex128Array = require( '@stdlib/array/complex128' );

var T = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.3, 0.1, 2.0, 0.0 ] );
var VL = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0 ] );
var VR = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0 ] );
var SELECT = new Uint8Array( 2 );
var S = new Float64Array( 2 );
var SEP = new Float64Array( 2 );
var M = new Int32Array( 1 );
var WORK = new Complex128Array( 2 * 3 );
var RWORK = new Float64Array( 2 );

ztrsna( 'column-major', 'both', 'all', SELECT, 1, 2, T, 2, VL, 2, VR, 2, S, 1, SEP, 1, 2, M, WORK, 2, RWORK, 1 );
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
-   **RWORK**: output array.
-   **strideRWORK**: stride length for `RWORK`.

#### ztrsna.ndarray( job, howmny, SELECT, strideSELECT, offsetSELECT, N, T, strideT1, strideT2, offsetT, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR, s, strideS, offsetS, SEP, strideSEP, offsetSEP, mm, M, WORK, strideWORK1, strideWORK2, offsetWORK, RWORK, strideRWORK, offsetRWORK )

Estimates reciprocal condition numbers for eigenvalues and eigenvectors of a complex triangular matrix, using alternative indexing semantics.

```javascript
var Complex128Array = require( '@stdlib/array/complex128' );

var T = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.3, 0.1, 2.0, 0.0 ] );
var VL = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0 ] );
var VR = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0 ] );
var SELECT = new Uint8Array( 2 );
var S = new Float64Array( 2 );
var SEP = new Float64Array( 2 );
var M = new Int32Array( 1 );
var WORK = new Complex128Array( 2 * 3 );
var RWORK = new Float64Array( 2 );

ztrsna( 'column-major', 'both', 'all', SELECT, 1, 2, T, 2, VL, 2, VR, 2, S, 1, SEP, 1, 2, M, WORK, 2, RWORK, 1 );
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
-   **RWORK**: output array.
-   **strideRWORK**: stride length for `RWORK`.
-   **offsetRWORK**: starting index for `RWORK`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `ztrsna` computes only the condition numbers; it does not compute eigenvalues or eigenvectors themselves. Inputs `VL` and `VR` are typically obtained from `ztrevc`.

</section>

<!-- /.notes -->

<section class="examples">

## Examples

```javascript
var Complex128Array = require( '@stdlib/array/complex128' );
var ztrsna = require( '@stdlib/lapack/base/ztrsna' );

var T = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.3, 0.1, 2.0, 0.0 ] );
var VL = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0 ] );
var VR = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0 ] );
var SELECT = new Uint8Array( 2 );
var S = new Float64Array( 2 );
var SEP = new Float64Array( 2 );
var M = new Int32Array( 1 );
var WORK = new Complex128Array( 6 );
var RWORK = new Float64Array( 2 );

ztrsna( 'column-major', 'both', 'all', SELECT, 1, 2, T, 2, VL, 2, VR, 2, S, 1, SEP, 1, 2, M, WORK, 2, RWORK, 1 );
console.log( S );
console.log( SEP );
```

</section>

<!-- /.examples -->

<!-- fortran-docs:start (generated by bin/fortran-docs.mjs from data/lapack-3.12.0/SRC/ztrsna.f; do not edit) -->

<section class="fortran-docs">

## Reference documentation

From the reference LAPACK 3.12.0 source of `ZTRSNA`, converted to Markdown with KaTeX math. Indices are the 1-based Fortran indices of the source.

### Purpose

ZTRSNA estimates reciprocal condition numbers for specified eigenvalues and/or right eigenvectors of a complex upper triangular matrix T (or of any matrix $Q \, T \, Q^H$ with Q unitary).

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

If `HOWMNY = 'S'`, `SELECT` specifies the eigenpairs for which condition numbers are required. To select condition numbers for the j-th eigenpair, `SELECT(j)` must be set to .TRUE.. If `HOWMNY = 'A'`, `SELECT` is not referenced.

#### N `[in]`

_INTEGER_

The order of the matrix T. $N \ge 0$.

#### T `[in]`

_COMPLEX\*16 array, dimension (LDT,N)_

The upper triangular matrix T.

#### LDT `[in]`

_INTEGER_

The leading dimension of the array T. $\mathrm{LDT} \ge \max (1,N)$.

#### VL `[in]`

_COMPLEX\*16 array, dimension (LDVL,M)_

If `JOB = 'E'` or 'B', `VL` must contain left eigenvectors of T (or of any $Q \, T \, Q^H$ with Q unitary), corresponding to the eigenpairs specified by `HOWMNY` and `SELECT`. The eigenvectors must be stored in consecutive columns of `VL`, as returned by ZHSEIN or ZTREVC. If `JOB = 'V'`, `VL` is not referenced.

#### LDVL `[in]`

_INTEGER_

The leading dimension of the array `VL`. $\mathrm{LDVL} \ge 1$; and if `JOB = 'E'` or 'B', $\mathrm{LDVL} \ge N$.

#### VR `[in]`

_COMPLEX\*16 array, dimension (LDVR,M)_

If `JOB = 'E'` or 'B', `VR` must contain right eigenvectors of T (or of any $Q \, T \, Q^H$ with Q unitary), corresponding to the eigenpairs specified by `HOWMNY` and `SELECT`. The eigenvectors must be stored in consecutive columns of `VR`, as returned by ZHSEIN or ZTREVC. If `JOB = 'V'`, `VR` is not referenced.

#### LDVR `[in]`

_INTEGER_

The leading dimension of the array `VR`. $\mathrm{LDVR} \ge 1$; and if `JOB = 'E'` or 'B', $\mathrm{LDVR} \ge N$.

#### S `[out]`

_DOUBLE PRECISION array, dimension (MM)_

If `JOB = 'E'` or 'B', the reciprocal condition numbers of the selected eigenvalues, stored in consecutive elements of the array. Thus `S(j)`, `SEP(j)`, and the j-th columns of `VL` and `VR` all correspond to the same eigenpair (but not in general the j-th eigenpair, unless all eigenpairs are selected). If `JOB = 'V'`, S is not referenced.

#### SEP `[out]`

_DOUBLE PRECISION array, dimension (MM)_

If `JOB = 'V'` or 'B', the estimated reciprocal condition numbers of the selected eigenvectors, stored in consecutive elements of the array. If `JOB = 'E'`, `SEP` is not referenced.

#### MM `[in]`

_INTEGER_

The number of elements in the arrays S (if `JOB = 'E'` or 'B') and/or `SEP` (if `JOB = 'V'` or 'B'). $\mathrm{MM} \ge M$.

#### M `[out]`

_INTEGER_

The number of elements of the arrays S and/or `SEP` actually used to store the estimated condition numbers. If `HOWMNY = 'A'`, M is set to N.

#### WORK `[out]`

_COMPLEX\*16 array, dimension (LDWORK,N+6)_

If `JOB = 'E'`, `WORK` is not referenced.

#### LDWORK `[in]`

_INTEGER_

The leading dimension of the array `WORK`. $\mathrm{LDWORK} \ge 1$; and if `JOB = 'V'` or 'B', $\mathrm{LDWORK} \ge N$.

#### RWORK `[out]`

_DOUBLE PRECISION array, dimension (N)_

If `JOB = 'E'`, `RWORK` is not referenced.

#### INFO `[out]`

_INTEGER_

-   `= 0`: successful exit
-   `< 0`: if `INFO = -i`, the i-th argument had an illegal value

### Further Details

The reciprocal of the condition number of an eigenvalue $\lambda$ is defined as

$$
S(\lambda ) = |v^H \, u| / (\operatorname{norm}(u) \, \operatorname{norm}(v))
$$

where u and v are the right and left eigenvectors of T corresponding to $\lambda$; $v^H$ denotes the conjugate transpose of v, and norm(u) denotes the Euclidean norm. These reciprocal condition numbers always lie between zero (very badly conditioned) and one (very well conditioned). If $n = 1$, `S(lambda)` is defined to be 1.

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
