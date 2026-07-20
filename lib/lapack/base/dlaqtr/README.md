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

# dlaqtr

> Solves a real quasi-triangular system of equations, or a complex quasi-triangular system of special form, in real arithmetic

<section class="usage">

## Usage

```javascript
var dlaqtr = require( '@stdlib/lapack/base/dlaqtr' );
```

#### dlaqtr( order, ltran, lreal, N, T, LDT, b, strideB, w, scale, x, strideX, WORK, strideWORK )

Solves a real quasi-triangular system of equations, or a complex quasi-triangular system of special form, in real arithmetic

```javascript
var Float64Array = require( '@stdlib/array/float64' );

// Upper quasi-triangular T (4-by-4, column-major); leading 3-by-3 used:
var T = new Float64Array([ 2.0, 0.0, 0.0, 0.0, 1.0, 3.0, 0.0, 0.0, 3.0, -1.0, 4.0, 0.0, 0.0, 0.0, 0.0, 0.0 ]);
var b = new Float64Array( 4 );

// Right-hand side on entry; solution on exit:
var x = new Float64Array([ 10.0, 5.0, 8.0, 0.0, 0.0, 0.0, 0.0, 0.0 ]);
var WORK = new Float64Array( 8 );

var out = dlaqtr( 'column-major', false, true, 3, T, 4, b, 1, 0.0, x, 1, WORK, 1 );
// out => { 'info': 0, 'scale': 1 }; x[ 0..2 ] holds the solution
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **ltran**: ltran.
-   **lreal**: lreal.
-   **N**: number of columns.
-   **T**: input matrix.
-   **LDT**: leading dimension of `T`.
-   **b**: input array.
-   **strideB**: stride length for `b`.
-   **w**: w.
-   **scale**: scale.
-   **x**: input array.
-   **strideX**: stride length for `x`.
-   **WORK**: output array.
-   **strideWORK**: stride length for `WORK`.

#### dlaqtr.ndarray( ltran, lreal, N, T, strideT1, strideT2, offsetT, b, strideB, offsetB, w, scale, x, strideX, offsetX, WORK, strideWORK, offsetWORK )

Solves a real quasi-triangular system of equations, or a complex quasi-triangular system of special form, in real arithmetic, using alternative indexing semantics.

```javascript
var Float64Array = require( '@stdlib/array/float64' );

var T = new Float64Array([ 2.0, 0.0, 0.0, 0.0, 1.0, 3.0, 0.0, 0.0, 3.0, -1.0, 4.0, 0.0, 0.0, 0.0, 0.0, 0.0 ]);
var b = new Float64Array( 4 );
var x = new Float64Array([ 10.0, 5.0, 8.0, 0.0, 0.0, 0.0, 0.0, 0.0 ]);
var WORK = new Float64Array( 8 );

// Solve using explicit strides and offsets (no `order` argument):
var out = dlaqtr( false, true, 3, T, 1, 4, 0, b, 1, 0, 0.0, x, 1, 0, WORK, 1, 0 );
// out => { 'info': 0, 'scale': 1 }
```

The function has the following additional parameters:

-   **ltran**: ltran.
-   **lreal**: lreal.
-   **N**: number of columns.
-   **T**: input matrix.
-   **strideT1**: stride of dimension 1 of `T`.
-   **strideT2**: stride of dimension 2 of `T`.
-   **offsetT**: starting index for `T`.
-   **b**: input array.
-   **strideB**: stride length for `b`.
-   **offsetB**: starting index for `B`.
-   **w**: w.
-   **scale**: scale.
-   **x**: input array.
-   **strideX**: stride length for `x`.
-   **offsetX**: starting index for `X`.
-   **WORK**: output array.
-   **strideWORK**: stride length for `WORK`.
-   **offsetWORK**: starting index for `WORK`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   The right-hand side is supplied in `x` (real part) and `b` (imaginary part) and
    is overwritten by the solution. `scale` (0 < scale <= 1) is returned to avoid
    overflow; the computed solution solves the scaled system.
-   `dlaqtr` is an internal auxiliary of the eigenvector-condition routines (e.g. `dtrsna`).

</section>

<!-- /.notes -->

<section class="examples">

## Examples

```javascript
var Float64Array = require( '@stdlib/array/float64' );

// Upper quasi-triangular T (4-by-4, column-major); leading 3-by-3 used:
var T = new Float64Array([ 2.0, 0.0, 0.0, 0.0, 1.0, 3.0, 0.0, 0.0, 3.0, -1.0, 4.0, 0.0, 0.0, 0.0, 0.0, 0.0 ]);
var b = new Float64Array( 4 );

// Right-hand side on entry; solution on exit:
var x = new Float64Array([ 10.0, 5.0, 8.0, 0.0, 0.0, 0.0, 0.0, 0.0 ]);
var WORK = new Float64Array( 8 );

var out = dlaqtr( 'column-major', false, true, 3, T, 4, b, 1, 0.0, x, 1, WORK, 1 );
// out => { 'info': 0, 'scale': 1 }; x[ 0..2 ] holds the solution

console.log( out.info, Array.prototype.slice.call( x, 0, 3 ) );
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
