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

# dtrevc

> Computes some or all of the right and/or left eigenvectors of a real upper quasi-triangular matrix T.

<section class="usage">

## Usage

```javascript
var dtrevc = require( '@stdlib/lapack/base/dtrevc' );
```

#### dtrevc( order, side, howmny, SELECT, strideSELECT, N, T, LDT, VL, LDVL, VR, LDVR, mm, M, WORK, strideWORK )

Computes some or all of the right and/or left eigenvectors of a real upper quasi-triangular matrix T.

```javascript
var Float64Array = require( '@stdlib/array/float64' );

var T = new Float64Array( [ 1.0, 0.0, 0.5, 2.0 ] ); // 2x2 column-major
var VR = new Float64Array( 4 );
var VL = new Float64Array( 4 );
var SELECT = new Uint8Array( 2 );
var WORK = new Float64Array( 6 );

var info = dtrevc( 'column-major', 'right', 'all', SELECT, 1, 2, T, 2, VL, 2, VR, 2, 2, 0, WORK, 1 );
// info => 0
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **side**: `'right'`, `'left'`, or `'both'`.
-   **howmny**: `'all'`, `'backtransform'`, or `'selected'`.
-   **SELECT**: boolean selection array (used only if howmny is `'selected'`).
-   **strideSELECT**: stride length for `SELECT`.
-   **N**: order of matrix T.
-   **T**: quasi-triangular Schur matrix.
-   **LDT**: leading dimension of `T`.
-   **VL**: left eigenvector matrix.
-   **LDVL**: leading dimension of `VL`.
-   **VR**: right eigenvector matrix.
-   **LDVR**: leading dimension of `VR`.
-   **mm**: number of columns available in VL/VR.
-   **M**: unused (set internally).
-   **WORK**: workspace array of length at least 3\*N.
-   **strideWORK**: stride length for `WORK`.

#### dtrevc.ndarray( side, howmny, SELECT, strideSELECT, offsetSELECT, N, T, strideT1, strideT2, offsetT, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR, mm, M, WORK, strideWORK, offsetWORK )

Computes eigenvectors of a real upper quasi-triangular matrix, using alternative indexing semantics.

```javascript
var Float64Array = require( '@stdlib/array/float64' );

var T = new Float64Array( [ 1.0, 0.0, 0.5, 2.0 ] ); // 2x2 column-major
var VR = new Float64Array( 4 );
var VL = new Float64Array( 4 );
var SELECT = new Uint8Array( 2 );
var WORK = new Float64Array( 6 );

var info = dtrevc.ndarray( 'right', 'all', SELECT, 1, 0, 2, T, 1, 2, 0, VL, 1, 2, 0, VR, 1, 2, 0, 2, 0, WORK, 1, 0 );
// info => 0
```

The function has the following additional parameters:

-   **side**: specifies the operation type.
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
-   **mm**: mm.
-   **M**: number of rows.
-   **WORK**: output array.
-   **strideWORK**: stride length for `WORK`.
-   **offsetWORK**: starting index for `WORK`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   Workspace `WORK` must have length at least `3*N`.
-   The matrix `T` must be in real upper quasi-triangular (Schur) form.
-   For complex eigenvalues, eigenvectors are stored as consecutive column pairs (real part, imaginary part).

</section>

<!-- /.notes -->

<section class="examples">

## Examples

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var dtrevc = require( '@stdlib/lapack/base/dtrevc' );

// 4x4 quasi-triangular matrix (column-major):
var T = new Float64Array([
    1.0, 0.0, 0.0, 0.0,
    0.5, 2.0, 0.0, 0.0,
    0.2, 0.3, 3.0, 0.8,
    0.1, 0.15, -0.5, 3.0
]);

var VR = new Float64Array( 16 );
var SELECT = new Uint8Array( 4 );
var WORK = new Float64Array( 12 );

var info = dtrevc.ndarray( 'right', 'all', SELECT, 1, 0, 4, T, 1, 4, 0, new Float64Array(16), 1, 4, 0, VR, 1, 4, 0, 4, 0, WORK, 1, 0 );
// info => 0
```

</section>

<!-- /.examples -->

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
