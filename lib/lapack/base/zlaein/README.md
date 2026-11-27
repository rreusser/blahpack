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

# zlaein

> Uses inverse iteration to find an eigenvector of a complex upper Hessenberg matrix

<section class="usage">

## Usage

```javascript
var zlaein = require( '@stdlib/lapack/base/zlaein' );
```

#### zlaein( order, rightv, noinit, N, H, LDH, w, v, strideV, B, LDB, RWORK, strideRWORK, eps3, smlnum )

Uses inverse iteration to find an eigenvector of a complex upper Hessenberg matrix

```javascript
var Complex128 = require( '@stdlib/complex/float64/ctor' );
var Complex128Array = require( '@stdlib/array/complex128' );
var Float64Array = require( '@stdlib/array/float64' );

var N = 3;
var H = new Complex128Array( N * N );
var v = new Complex128Array( N );
var B = new Complex128Array( N * N );
var rwork = new Float64Array( N );
var w = new Complex128( 3.9, -0.95 );

zlaein( 'column-major', true, true, N, H, N, w, v, 1, B, N, rwork, 1, 1.0e-4, 1.0e-292 );
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **rightv**: if `true`, compute a right eigenvector; otherwise a left eigenvector.
-   **noinit**: noinit.
-   **N**: number of columns.
-   **H**: input matrix.
-   **LDH**: leading dimension of `H`.
-   **w**: w.
-   **v**: input array.
-   **strideV**: stride length for `v`.
-   **B**: input matrix.
-   **LDB**: leading dimension of `B`.
-   **RWORK**: output array.
-   **strideRWORK**: stride length for `RWORK`.
-   **eps3**: eps3.
-   **smlnum**: smlnum.

#### zlaein.ndarray( rightv, noinit, N, H, strideH1, strideH2, offsetH, w, v, strideV, offsetV, B, strideB1, strideB2, offsetB, RWORK, strideRWORK, offsetRWORK, eps3, smlnum )

Uses inverse iteration to find an eigenvector of a complex upper Hessenberg matrix, using alternative indexing semantics.

```javascript
var Complex128 = require( '@stdlib/complex/float64/ctor' );
var Complex128Array = require( '@stdlib/array/complex128' );
var Float64Array = require( '@stdlib/array/float64' );

var N = 3;
var H = new Complex128Array( N * N );
var v = new Complex128Array( N );
var B = new Complex128Array( N * N );
var rwork = new Float64Array( N );
var w = new Complex128( 3.9, -0.95 );

zlaein.ndarray( true, true, N, H, 1, N, 0, w, v, 1, 0, B, 1, N, 0, rwork, 1, 0, 1.0e-4, 1.0e-292 );
```

The function has the following additional parameters:

-   **rightv**: rightv.
-   **noinit**: noinit.
-   **N**: number of columns.
-   **H**: input matrix.
-   **strideH1**: stride of dimension 1 of `H`.
-   **strideH2**: stride of dimension 2 of `H`.
-   **offsetH**: starting index for `H`.
-   **w**: w.
-   **v**: input array.
-   **strideV**: stride length for `v`.
-   **offsetV**: starting index for `V`.
-   **B**: input matrix.
-   **strideB1**: stride of dimension 1 of `B`.
-   **strideB2**: stride of dimension 2 of `B`.
-   **offsetB**: starting index for `B`.
-   **RWORK**: output array.
-   **strideRWORK**: stride length for `RWORK`.
-   **offsetRWORK**: starting index for `RWORK`.
-   **eps3**: eps3.
-   **smlnum**: smlnum.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   On entry, if `noinit` is `true`, the initial eigenvector is generated internally; otherwise `v` is used as the initial vector.
-   On exit, `v` contains the normalized eigenvector.
-   Returns `0` on success, `1` if inverse iteration failed to converge.

</section>

<!-- /.notes -->

<section class="examples">

## Examples

```javascript
var Complex128 = require( '@stdlib/complex/float64/ctor' );
var Complex128Array = require( '@stdlib/array/complex128' );
var Float64Array = require( '@stdlib/array/float64' );
var zlaein = require( '@stdlib/lapack/base/zlaein' );

var N = 3;
var H = new Complex128Array( N * N );
var v = new Complex128Array( N );
var B = new Complex128Array( N * N );
var rwork = new Float64Array( N );
var w = new Complex128( 3.9, -0.95 );

var info = zlaein( 'column-major', true, true, N, H, N, w, v, 1, B, N, rwork, 1, 1.0e-4, 1.0e-292 );
console.log( info );
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
