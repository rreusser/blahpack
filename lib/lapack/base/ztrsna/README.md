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

## Reference notes

The mathematical description from the reference LAPACK 3.12.0 source of `ZTRSNA`. Indices are the 1-based Fortran indices of the source.

### Purpose

ZTRSNA estimates reciprocal condition numbers for specified eigenvalues and/or right eigenvectors of a complex upper triangular matrix T (or of any matrix $Q \, T \, Q^H$ with Q unitary).

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
