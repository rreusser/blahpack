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
