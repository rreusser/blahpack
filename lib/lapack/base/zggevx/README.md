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

# zggevx

> Computes the eigenvalues and, optionally, the left and/or right eigenvectors for general matrices.

<section class="usage">

## Usage

```javascript
var zggevx = require( '@stdlib/lapack/base/zggevx' );
```

#### zggevx( order, balanc, jobvl, jobvr, sense, N, A, LDA, B, LDB, ALPHA, strideALPHA, BETA, strideBETA, VL, LDVL, VR, LDVR, LSCALE, strideLSCALE, RSCALE, strideRSCALE, RCONDE, strideRCONDE, RCONDV, strideRCONDV )

Computes the generalized eigenvalues and, optionally, the left and/or right generalized eigenvectors of a complex matrix pair `(A, B)`, with optional balancing.

```javascript
var Complex128Array = require( '@stdlib/array/complex128' );
var Float64Array = require( '@stdlib/array/float64' );

var A = new Complex128Array( [ 2.0, 1.0, 1.0, -1.0, 1.0, 0.5, 3.0, 0.0 ] );
var B = new Complex128Array( [ 3.0, 0.0, 0.5, -0.5, 1.0, 0.5, 2.0, 1.0 ] );
var ALPHA = new Complex128Array( 2 );
var BETA = new Complex128Array( 2 );
var VL = new Complex128Array( 4 );
var VR = new Complex128Array( 4 );
var LSCALE = new Float64Array( 2 );
var RSCALE = new Float64Array( 2 );
var RCONDE = new Float64Array( 2 );
var RCONDV = new Float64Array( 2 );

var r = zggevx( 'column-major', 'none', 'compute-vectors', 'compute-vectors', 'none', 2, A, 2, B, 2, ALPHA, 1, BETA, 1, VL, 2, VR, 2, LSCALE, 1, RSCALE, 1, RCONDE, 1, RCONDV, 1 );
// returns { info, ilo, ihi, abnrm, bbnrm }
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **balanc**: balancing option (`'none'`, `'permute'`, `'scale'`, or `'both'`).
-   **jobvl**: left eigenvector option (`'no-vectors'` or `'compute-vectors'`).
-   **jobvr**: right eigenvector option (`'no-vectors'` or `'compute-vectors'`).
-   **sense**: condition number option (`'none'`, `'eigenvalues'`, `'right-vectors'`, or `'both'`). Only `'none'` is currently implemented; other values return `info = -4` (ztgsna not yet available).
-   **N**: order of matrices A and B.
-   **A**: input matrix A ([`Complex128Array`][@stdlib/array/complex128]).
-   **LDA**: leading dimension of `A`.
-   **B**: input matrix B ([`Complex128Array`][@stdlib/array/complex128]).
-   **LDB**: leading dimension of `B`.
-   **ALPHA**: output eigenvalue numerators ([`Complex128Array`][@stdlib/array/complex128]).
-   **strideALPHA**: stride length for `ALPHA`.
-   **BETA**: output eigenvalue denominators ([`Complex128Array`][@stdlib/array/complex128]).
-   **strideBETA**: stride length for `BETA`.
-   **VL**: left eigenvector matrix ([`Complex128Array`][@stdlib/array/complex128]).
-   **LDVL**: leading dimension of `VL`.
-   **VR**: right eigenvector matrix ([`Complex128Array`][@stdlib/array/complex128]).
-   **LDVR**: leading dimension of `VR`.
-   **LSCALE**: output: details of left permutations/scaling ([`Float64Array`][mdn-float64array]).
-   **strideLSCALE**: stride length for `LSCALE`.
-   **RSCALE**: output: details of right permutations/scaling ([`Float64Array`][mdn-float64array]).
-   **strideRSCALE**: stride length for `RSCALE`.
-   **RCONDE**: output: reciprocal condition numbers for eigenvalues ([`Float64Array`][mdn-float64array]); unused when `sense='none'`.
-   **strideRCONDE**: stride length for `RCONDE`.
-   **RCONDV**: output: reciprocal condition numbers for right eigenvectors ([`Float64Array`][mdn-float64array]); unused when `sense='none'`.
-   **strideRCONDV**: stride length for `RCONDV`.

The function returns an object `{ info, ilo, ihi, abnrm, bbnrm }` where `info` is the LAPACK status code (0 on success), `ilo`/`ihi` are the 1-based active block bounds produced by balancing, and `abnrm`/`bbnrm` are the 1-norms of the balanced A and B.

#### zggevx.ndarray( balanc, jobvl, jobvr, sense, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, ALPHA, strideALPHA, offsetALPHA, BETA, strideBETA, offsetBETA, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR, LSCALE, strideLSCALE, offsetLSCALE, RSCALE, strideRSCALE, offsetRSCALE, RCONDE, strideRCONDE, offsetRCONDE, RCONDV, strideRCONDV, offsetRCONDV )

Same as `zggevx`, but with `ndarray`-style stride/offset arguments.

```javascript
var Complex128Array = require( '@stdlib/array/complex128' );
var Float64Array = require( '@stdlib/array/float64' );

var A = new Complex128Array( [ 2.0, 1.0, 1.0, -1.0, 1.0, 0.5, 3.0, 0.0 ] );
var B = new Complex128Array( [ 3.0, 0.0, 0.5, -0.5, 1.0, 0.5, 2.0, 1.0 ] );
var ALPHA = new Complex128Array( 2 );
var BETA = new Complex128Array( 2 );
var VL = new Complex128Array( 4 );
var VR = new Complex128Array( 4 );
var LSCALE = new Float64Array( 2 );
var RSCALE = new Float64Array( 2 );
var RCONDE = new Float64Array( 2 );
var RCONDV = new Float64Array( 2 );

var r = zggevx.ndarray( 'none', 'compute-vectors', 'compute-vectors', 'none', 2, A, 1, 2, 0, B, 1, 2, 0, ALPHA, 1, 0, BETA, 1, 0, VL, 1, 2, 0, VR, 1, 2, 0, LSCALE, 1, 0, RSCALE, 1, 0, RCONDE, 1, 0, RCONDV, 1, 0 );
// returns { info, ilo, ihi, abnrm, bbnrm }
```

The `ndarray` method supports independent strides and offsets for all arrays, expressed in complex elements for `Complex128Array`s and in Float64 elements for `Float64Array`s.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   On exit, `A` is overwritten by the generalized Schur form and `B` by the corresponding upper-triangular matrix.
-   Strides and offsets for `A`, `B`, `ALPHA`, `BETA`, `VL`, `VR` are in complex elements.
-   The `sense` parameter is accepted but only the value `'none'` is currently implemented. Other values return `info = -4` because the supporting routine `ztgsna` is not yet available.

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var Complex128Array = require( '@stdlib/array/complex128' );
var Float64Array = require( '@stdlib/array/float64' );
var zggevx = require( '@stdlib/lapack/base/zggevx' );

var N = 2;

// Column-major A, B: diagonal pair so that eigenvalues are 4/2 = 2 and 6/3 = 2.
var A = new Complex128Array( [ 4.0, 0.0, 0.0, 0.0, 0.0, 0.0, 6.0, 0.0 ] );
var B = new Complex128Array( [ 2.0, 0.0, 0.0, 0.0, 0.0, 0.0, 3.0, 0.0 ] );
var ALPHA = new Complex128Array( N );
var BETA = new Complex128Array( N );
var VL = new Complex128Array( N * N );
var VR = new Complex128Array( N * N );
var LSCALE = new Float64Array( N );
var RSCALE = new Float64Array( N );
var RCONDE = new Float64Array( N );
var RCONDV = new Float64Array( N );

var r = zggevx( 'column-major', 'both', 'compute-vectors', 'compute-vectors', 'none', N, A, N, B, N, ALPHA, 1, BETA, 1, VL, N, VR, N, LSCALE, 1, RSCALE, 1, RCONDE, 1, RCONDV, 1 );
console.log( r );
```

</section>

<!-- /.examples -->

<!-- Section for related `stdlib` packages. Do not manually edit this section, as it is automatically populated. -->

<section class="related">

</section>

<!-- /.related -->

<!-- Section for all links. Make sure to keep an empty line after the `section` element and another before the `/section` close. -->

<section class="links">

[@stdlib/array/complex128]: https://github.com/stdlib-js/stdlib
[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

</section>

<!-- /.links -->
