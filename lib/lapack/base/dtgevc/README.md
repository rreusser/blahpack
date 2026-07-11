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

# dtgevc

> Computes some or all of the right and/or left eigenvectors of a pair of real matrices (S,P).

<section class="usage">

## Usage

```javascript
var dtgevc = require( '@stdlib/lapack/base/dtgevc' );
```

#### dtgevc( order, side, howmny, SELECT, strideSELECT, N, S, LDS, P, LDP, VL, LDVL, VR, LDVR, mm, M, WORK, strideWORK )

Computes some or all of the right and/or left eigenvectors of a pair of real matrices (S,P).

```javascript
var Float64Array = require( '@stdlib/array/float64' );

var N = 3;
var S = new Float64Array( [ 1.0, 0.0, 0.0, 0.3, 2.0, 0.0, 0.2, 0.4, 3.0 ] );
var P = new Float64Array( [ 1.0, 0.0, 0.0, 0.1, 1.0, 0.0, 0.05, 0.1, 1.0 ] );
var VR = new Float64Array( N * N );
var VL = new Float64Array( N * N );
var SELECT = new Float64Array( N );
var WORK = new Float64Array( 6 * N );

dtgevc( 'column-major', 'both', 'all', SELECT, 1, N, S, N, P, N, VL, N, VR, N, N, 0, WORK, 1 );
// VR and VL now contain right and left eigenvectors
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **side**: specifies whether to compute right (`'right'`), left (`'left'`), or both (`'both'`) eigenvectors.
-   **howmny**: specifies which eigenvectors: `'all'`, `'selected'`, or `'backtransform'`.
-   **SELECT**: input array.
-   **strideSELECT**: stride length for `SELECT`.
-   **N**: number of columns.
-   **S**: input matrix.
-   **LDS**: leading dimension of `S`.
-   **P**: input matrix.
-   **LDP**: leading dimension of `P`.
-   **VL**: input matrix.
-   **LDVL**: leading dimension of `VL`.
-   **VR**: input matrix.
-   **LDVR**: leading dimension of `VR`.
-   **mm**: mm.
-   **M**: number of rows.
-   **WORK**: output array.
-   **strideWORK**: stride length for `WORK`.

#### dtgevc.ndarray( side, howmny, SELECT, strideSELECT, offsetSELECT, N, S, strideS1, strideS2, offsetS, P, strideP1, strideP2, offsetP, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR, mm, M, WORK, strideWORK, offsetWORK )

Computes some or all of the right and/or left eigenvectors of a pair of real matrices (S,P)., using alternative indexing semantics.

```javascript
var Float64Array = require( '@stdlib/array/float64' );

var N = 3;
var S = new Float64Array( [ 1.0, 0.0, 0.0, 0.3, 2.0, 0.0, 0.2, 0.4, 3.0 ] );
var P = new Float64Array( [ 1.0, 0.0, 0.0, 0.1, 1.0, 0.0, 0.05, 0.1, 1.0 ] );
var VR = new Float64Array( N * N );
var VL = new Float64Array( N * N );
var SELECT = new Float64Array( N );
var WORK = new Float64Array( 6 * N );

dtgevc.ndarray( 'both', 'all', SELECT, 1, 0, N, S, 1, N, 0, P, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, N, 0, WORK, 1, 0 );
// VR and VL now contain right and left eigenvectors
```

The function has the following additional parameters:

-   **side**: specifies whether to compute right (`'right'`), left (`'left'`), or both (`'both'`) eigenvectors.
-   **howmny**: specifies which eigenvectors: `'all'`, `'selected'`, or `'backtransform'`.
-   **SELECT**: input array.
-   **strideSELECT**: stride length for `SELECT`.
-   **offsetSELECT**: starting index for `SELECT`.
-   **N**: number of columns.
-   **S**: input matrix.
-   **strideS1**: stride of dimension 1 of `S`.
-   **strideS2**: stride of dimension 2 of `S`.
-   **offsetS**: starting index for `S`.
-   **P**: input matrix.
-   **strideP1**: stride of dimension 1 of `P`.
-   **strideP2**: stride of dimension 2 of `P`.
-   **offsetP**: starting index for `P`.
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

-   `dtgevc()` computes eigenvectors of a pair of real matrices `(S, P)` where `S` is upper quasi-triangular and `P` is upper triangular, as produced by the generalized Schur decomposition.
-   The workspace array `WORK` must have length at least `6*N`.
-   When `howmny` is `'backtransform'`, the input `VL`/`VR` matrices are multiplied by the computed eigenvectors.

</section>

<!-- /.notes -->

<section class="examples">

## Examples

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var dtgevc = require( '@stdlib/lapack/base/dtgevc' );

var N = 3;
var S = new Float64Array( [ 1.0, 0.0, 0.0, 0.3, 2.0, 0.0, 0.2, 0.4, 3.0 ] );
var P = new Float64Array( [ 1.0, 0.0, 0.0, 0.1, 1.0, 0.0, 0.05, 0.1, 1.0 ] );
var VR = new Float64Array( N * N );
var VL = new Float64Array( N * N );
var SELECT = new Float64Array( N );
var WORK = new Float64Array( 6 * N );

var info = dtgevc( 'column-major', 'both', 'all', SELECT, 1, N, S, N, P, N, VL, N, VR, N, N, 0, WORK, 1 );
console.log( 'info:', info );
console.log( 'VR:', VR );
console.log( 'VL:', VL );
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
