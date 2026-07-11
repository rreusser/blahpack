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

// TODO: Add usage example
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

// TODO: Add usage example
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

-   TODO: Add notes.

</section>

<!-- /.notes -->

<section class="examples">

## Examples

```javascript
// TODO: Add examples
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
