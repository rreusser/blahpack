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

# dlaqgb

> Equilibrates a general M-by-N band matrix A with KL sub-diagonals and KU super-diagonals using the row and column scaling factors in the vectors R and C.

<section class="usage">

## Usage

```javascript
var dlaqgb = require( '@stdlib/lapack/base/dlaqgb' );
```

#### dlaqgb( M, N, kl, ku, AB, LDAB, r, strideR, c, strideC, rowcnd, colcnd, amax )

Equilibrates a general M-by-N band matrix A with KL sub-diagonals and KU super-diagonals using the row and column scaling factors in the vectors R and C.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var dlaqgb = require( '@stdlib/lapack/base/dlaqgb' );

var r = new Float64Array( [ 0.5, 1.0, 0.8, 0.25 ] );
var c = new Float64Array( [ 0.6, 1.0, 0.7, 0.9, 0.4 ] );

dlaqgb.ndarray( 4, 5, 1, 2, AB, 1, 4, 0, r, 1, 0, c, 1, 0, 0.01, 0.01, 4.0 );
```

The function has the following parameters:

-   **M**: number of rows.
-   **N**: number of columns.
-   **kl**: number of subdiagonals.
-   **ku**: number of superdiagonals.
-   **AB**: input array `AB`.
-   **LDAB**: leading dimension of `AB`.
-   **r**: `r`.
-   **strideR**: stride length for `R`.
-   **c**: `c`.
-   **strideC**: stride length for `C`.
-   **rowcnd**: `rowcnd`.
-   **colcnd**: `colcnd`.
-   **amax**: `amax`.

#### dlaqgb.ndarray( M, N, kl, ku, AB, strideAB1, strideAB2, offsetAB, r, strideR, offsetR, c, strideC, offsetC, rowcnd, colcnd, amax )

Equilibrates a general M-by-N band matrix A with KL sub-diagonals and KU super-diagonals using the row and column scaling factors in the vectors R and C, using alternative indexing semantics.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var dlaqgb = require( '@stdlib/lapack/base/dlaqgb' );

var r = new Float64Array( [ 0.5, 1.0, 0.8, 0.25 ] );
var c = new Float64Array( [ 0.6, 1.0, 0.7, 0.9, 0.4 ] );

dlaqgb.ndarray( 4, 5, 1, 2, AB, 1, 4, 0, r, 1, 0, c, 1, 0, 0.01, 0.01, 4.0 );
```

The function has the following additional parameters:

-   **strideAB1**: stride of dimension 1 of `AB`.
-   **strideAB2**: stride of dimension 2 of `AB`.
-   **offsetAB**: starting index for `AB`.
-   **offsetR**: starting index for `R`.
-   **offsetC**: starting index for `C`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `dlaqgb()` corresponds to the [LAPACK][lapack] level routine [`dlaqgb`][lapack-dlaqgb].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var dlaqgb = require( '@stdlib/lapack/base/dlaqgb' );

var r = new Float64Array( [ 0.5, 1.0, 0.8, 0.25 ] );
var c = new Float64Array( [ 0.6, 1.0, 0.7, 0.9, 0.4 ] );

dlaqgb.ndarray( 4, 5, 1, 2, AB, 1, 4, 0, r, 1, 0, c, 1, 0, 0.01, 0.01, 4.0 );
```

</section>

<!-- /.examples -->

<!-- Section for related `stdlib` packages. Do not manually edit this section, as it is automatically populated. -->

<section class="related">

</section>

<!-- /.related -->

<!-- Section for all links. Make sure to keep an empty line after the `section` element and another before the `/section` close. -->

<section class="links">

[lapack]: https://www.netlib.org/lapack/explore-html/

[lapack-dlaqgb]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__dlaqgb.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->