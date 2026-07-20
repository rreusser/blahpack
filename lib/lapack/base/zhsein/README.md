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

# zhsein

> Uses inverse iteration to find right and/or left eigenvectors of a complex upper Hessenberg matrix

<section class="usage">

## Usage

```javascript
var zhsein = require( '@stdlib/lapack/base/zhsein' );
```

#### zhsein( order, side, eigsrc, initv, SELECT, strideSELECT, N, H, LDH, w, strideW, VL, LDVL, VR, LDVR, mm, M, WORK, strideWORK, RWORK, strideRWORK, IFAILL, strideIFAILL, offsetIFAILL, IFAILR, strideIFAILR, offsetIFAILR )

Uses inverse iteration to find right and/or left eigenvectors of a complex upper Hessenberg matrix

```javascript
var Complex128Array = require( '@stdlib/array/complex128' );
var Float64Array = require( '@stdlib/array/float64' );
var Int32Array = require( '@stdlib/array/int32' );
var Uint8Array = require( '@stdlib/array/uint8' );

// Upper-triangular complex Hessenberg H with eigenvalues 1 and 2:
var H = new Complex128Array([ 1.0, 0.0, 0.0, 0.0, 0.5, 0.0, 2.0, 0.0 ]);
var w = new Complex128Array([ 1.0, 0.0, 2.0, 0.0 ]);
var SELECT = new Uint8Array([ 1, 1 ]);
var VL = new Complex128Array( 4 );
var VR = new Complex128Array( 4 );
var WORK = new Complex128Array( 4 );
var RWORK = new Float64Array( 2 );
var IFAILL = new Int32Array( 2 );
var IFAILR = new Int32Array( 2 );
var M = new Int32Array([ 0 ]);

// ndarray form: explicit strides/offsets, no `order` argument:
var out = zhsein( 'right', 'no', 'no', SELECT, 1, 0, 2, H, 1, 2, 0, w, 1, 0, VL, 1, 2, 0, VR, 1, 2, 0, 2, M, WORK, 1, 0, RWORK, 1, 0, IFAILL, 1, 0, IFAILR, 1, 0 );
// out => { 'info': 0, 'm': 2, ... }; VR holds the right eigenvectors
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
-   **w**: input array.
-   **strideW**: stride length for `w`.
-   **VL**: input matrix.
-   **LDVL**: leading dimension of `VL`.
-   **VR**: input matrix.
-   **LDVR**: leading dimension of `VR`.
-   **mm**: mm.
-   **M**: number of rows.
-   **WORK**: input array.
-   **strideWORK**: stride length for `WORK`.
-   **RWORK**: input array.
-   **strideRWORK**: stride length for `RWORK`.
-   **IFAILL**: input array.
-   **strideIFAILL**: stride length for `IFAILL`.
-   **offsetIFAILL**: starting index for `IFAILL`.
-   **IFAILR**: output array.
-   **strideIFAILR**: stride length for `IFAILR`.
-   **offsetIFAILR**: starting index for `IFAILR`.

#### zhsein.ndarray( side, eigsrc, initv, SELECT, strideSELECT, offsetSELECT, N, H, strideH1, strideH2, offsetH, w, strideW, offsetW, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR, mm, M, WORK, strideWORK, offsetWORK, RWORK, strideRWORK, offsetRWORK, IFAILL, strideIFAILL, offsetIFAILL, IFAILR, strideIFAILR, offsetIFAILR )

Uses inverse iteration to find right and/or left eigenvectors of a complex upper Hessenberg matrix, using alternative indexing semantics.

```javascript
var Complex128Array = require( '@stdlib/array/complex128' );
var Float64Array = require( '@stdlib/array/float64' );
var Int32Array = require( '@stdlib/array/int32' );
var Uint8Array = require( '@stdlib/array/uint8' );

var H = new Complex128Array([ 1.0, 0.0, 0.0, 0.0, 0.5, 0.0, 2.0, 0.0 ]);
var w = new Complex128Array([ 1.0, 0.0, 2.0, 0.0 ]);
var SELECT = new Uint8Array([ 1, 1 ]);
var VL = new Complex128Array( 4 );
var VR = new Complex128Array( 4 );
var WORK = new Complex128Array( 4 );
var RWORK = new Float64Array( 2 );
var IFAILL = new Int32Array( 2 );
var IFAILR = new Int32Array( 2 );
var M = new Int32Array([ 0 ]);

// ndarray form: explicit strides/offsets, no `order` argument:
var out = zhsein( 'right', 'no', 'no', SELECT, 1, 0, 2, H, 1, 2, 0, w, 1, 0, VL, 1, 2, 0, VR, 1, 2, 0, 2, M, WORK, 1, 0, RWORK, 1, 0, IFAILL, 1, 0, IFAILR, 1, 0 );
// out => { 'info': 0, 'm': 2, ... }
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
-   **w**: input array.
-   **strideW**: stride length for `w`.
-   **offsetW**: starting index for `W`.
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
-   **RWORK**: input array.
-   **strideRWORK**: stride length for `RWORK`.
-   **offsetRWORK**: starting index for `RWORK`.
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

-   `w` supplies the eigenvalues (e.g. from `zhseqr`) whose eigenvectors are wanted.
    `SELECT[j]` chooses which eigenvectors to compute; `M` returns how many.
-   `H` must be upper Hessenberg. Eigenvectors are found by inverse iteration and
    `IFAILL`/`IFAILR` flag any that failed to converge.

</section>

<!-- /.notes -->

<section class="examples">

## Examples

```javascript
var Complex128Array = require( '@stdlib/array/complex128' );
var Float64Array = require( '@stdlib/array/float64' );
var Int32Array = require( '@stdlib/array/int32' );
var Uint8Array = require( '@stdlib/array/uint8' );

// Upper-triangular complex Hessenberg H with eigenvalues 1 and 2:
var H = new Complex128Array([ 1.0, 0.0, 0.0, 0.0, 0.5, 0.0, 2.0, 0.0 ]);
var w = new Complex128Array([ 1.0, 0.0, 2.0, 0.0 ]);
var SELECT = new Uint8Array([ 1, 1 ]);
var VL = new Complex128Array( 4 );
var VR = new Complex128Array( 4 );
var WORK = new Complex128Array( 4 );
var RWORK = new Float64Array( 2 );
var IFAILL = new Int32Array( 2 );
var IFAILR = new Int32Array( 2 );
var M = new Int32Array([ 0 ]);

var out = zhsein( 'column-major', 'right', 'no', 'no', SELECT, 1, 2, H, 2, w, 1, VL, 2, VR, 2, 2, M, WORK, 1, RWORK, 1, IFAILL, 1, 0, IFAILR, 1, 0 );
// out => { 'info': 0, 'm': 2, ... }; VR holds the right eigenvectors

console.log( out.info, out.m );
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
