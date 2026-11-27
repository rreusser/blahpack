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

# dlaein

> Uses inverse iteration to find a right or left eigenvector of a real upper Hessenberg matrix

<section class="usage">

## Usage

```javascript
var dlaein = require( '@stdlib/lapack/base/dlaein' );
```

#### dlaein( order, rightv, noinit, N, H, LDH, wr, wi, VR, strideVR, VI, strideVI, B, LDB, WORK, strideWORK, eps3, smlnum, bignum )

Uses inverse iteration to find a right or left eigenvector of a real upper Hessenberg matrix

```javascript
var Float64Array = require( '@stdlib/array/float64' );

// Upper-triangular 3x3 Hessenberg matrix (column-major) with eigenvalues 2, 3, 4:
var H = new Float64Array( [ 2.0, 0.0, 0.0, 1.0, 3.0, 0.0, 0.5, 1.0, 4.0 ] );
var B = new Float64Array( 16 );
var WORK = new Float64Array( 3 );
var VR = new Float64Array( 3 );
var VI = new Float64Array( 3 );

// Compute the right eigenvector for the real eigenvalue wr = 3.0:
var info = dlaein( 'column-major', true, true, 3, H, 3, 3.0, 0.0, VR, 1, VI, 1, B, 4, WORK, 1, 2.2e-13, 2.22e-305, 4.49e+304 );
// returns 0
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **rightv**: rightv.
-   **noinit**: noinit.
-   **N**: number of columns.
-   **H**: input matrix.
-   **LDH**: leading dimension of `H`.
-   **wr**: wr.
-   **wi**: wi.
-   **VR**: input array.
-   **strideVR**: stride length for `VR`.
-   **VI**: input array.
-   **strideVI**: stride length for `VI`.
-   **B**: input matrix.
-   **LDB**: leading dimension of `B`.
-   **WORK**: output array.
-   **strideWORK**: stride length for `WORK`.
-   **eps3**: eps3.
-   **smlnum**: smlnum.
-   **bignum**: bignum.

#### dlaein.ndarray( rightv, noinit, N, H, strideH1, strideH2, offsetH, wr, wi, VR, strideVR, offsetVR, VI, strideVI, offsetVI, B, strideB1, strideB2, offsetB, WORK, strideWORK, offsetWORK, eps3, smlnum, bignum )

Uses inverse iteration to find a right or left eigenvector of a real upper Hessenberg matrix, using alternative indexing semantics.

```javascript
var Float64Array = require( '@stdlib/array/float64' );

var H = new Float64Array( [ 2.0, 0.0, 0.0, 1.0, 3.0, 0.0, 0.5, 1.0, 4.0 ] );
var B = new Float64Array( 16 );
var WORK = new Float64Array( 3 );
var VR = new Float64Array( 3 );
var VI = new Float64Array( 3 );

var info = dlaein.ndarray( true, true, 3, H, 1, 3, 0, 3.0, 0.0, VR, 1, 0, VI, 1, 0, B, 1, 4, 0, WORK, 1, 0, 2.2e-13, 2.22e-305, 4.49e+304 );
// returns 0
```

The function has the following additional parameters:

-   **rightv**: rightv.
-   **noinit**: noinit.
-   **N**: number of columns.
-   **H**: input matrix.
-   **strideH1**: stride of dimension 1 of `H`.
-   **strideH2**: stride of dimension 2 of `H`.
-   **offsetH**: starting index for `H`.
-   **wr**: wr.
-   **wi**: wi.
-   **VR**: input array.
-   **strideVR**: stride length for `VR`.
-   **offsetVR**: starting index for `VR`.
-   **VI**: input array.
-   **strideVI**: stride length for `VI`.
-   **offsetVI**: starting index for `VI`.
-   **B**: input matrix.
-   **strideB1**: stride of dimension 1 of `B`.
-   **strideB2**: stride of dimension 2 of `B`.
-   **offsetB**: starting index for `B`.
-   **WORK**: output array.
-   **strideWORK**: stride length for `WORK`.
-   **offsetWORK**: starting index for `WORK`.
-   **eps3**: eps3.
-   **smlnum**: smlnum.
-   **bignum**: bignum.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `dlaein` applies one or more steps of inverse iteration on the shifted matrix `H - (wr + i*wi)*I` to refine an eigenvector for a specified eigenvalue. The workspace `B` must have leading dimension at least `N+1` (the complex case uses row `N+1` of `B` for the imaginary part).
-   If `noinit` is `true`, the initial eigenvector estimate is generated internally; otherwise `VR` (and `VI` for a complex eigenvalue) is used as a starting point.
-   The routine returns `0` on success, or `1` if inverse iteration failed to converge. The real case uses only `VR`; the complex case populates both `VR` and `VI`.

</section>

<!-- /.notes -->

<section class="examples">

## Examples

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var dlaein = require( '@stdlib/lapack/base/dlaein' );

var H = new Float64Array( [ 2.0, 0.0, 0.0, 1.0, 3.0, 0.0, 0.5, 1.0, 4.0 ] );
var B = new Float64Array( 16 );
var WORK = new Float64Array( 3 );
var VR = new Float64Array( 3 );
var VI = new Float64Array( 3 );

var info = dlaein( 'column-major', true, true, 3, H, 3, 3.0, 0.0, VR, 1, VI, 1, B, 4, WORK, 1, 2.2e-13, 2.22e-305, 4.49e+304 );
console.log( info );
console.log( VR );
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
