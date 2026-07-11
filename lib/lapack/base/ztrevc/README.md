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
