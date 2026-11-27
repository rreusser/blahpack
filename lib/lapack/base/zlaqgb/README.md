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

# zlaqgb

> Equilibrates a complex general band matrix using row and column scaling factors.

<section class="usage">

## Usage

```javascript
var zlaqgb = require( '@stdlib/lapack/base/zlaqgb' );
```

#### zlaqgb( M, N, kl, ku, AB, LDAB, r, strideR, c, strideC, rowcnd, colcnd, amax )

Equilibrates a complex general band matrix using row and column scaling factors.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Complex128Array = require( '@stdlib/array/complex128' );
var zlaqgb = require( '@stdlib/lapack/base/zlaqgb' );

var AB = new Complex128Array( [ 1.0, 0.5, 2.0, -1.0, 3.0, 1.0, 4.0, 2.0 ] );
var r = new Float64Array( [ 0.5, 2.0 ] );
var c = new Float64Array( [ 1.0, 1.0 ] );

zlaqgb.ndarray( 2, 2, 1, 0, AB, 1, 2, 0, r, 1, 0, c, 1, 0, 0.01, 1.0, 5.0 );
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

#### zlaqgb.ndarray( M, N, kl, ku, AB, strideAB1, strideAB2, offsetAB, r, strideR, offsetR, c, strideC, offsetC, rowcnd, colcnd, amax )

Equilibrates a complex general band matrix using row and column scaling factors, using alternative indexing semantics.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Complex128Array = require( '@stdlib/array/complex128' );
var zlaqgb = require( '@stdlib/lapack/base/zlaqgb' );

var AB = new Complex128Array( [ 1.0, 0.5, 2.0, -1.0, 3.0, 1.0, 4.0, 2.0 ] );
var r = new Float64Array( [ 0.5, 2.0 ] );
var c = new Float64Array( [ 1.0, 1.0 ] );

zlaqgb.ndarray( 2, 2, 1, 0, AB, 1, 2, 0, r, 1, 0, c, 1, 0, 0.01, 1.0, 5.0 );
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

-   `zlaqgb()` corresponds to the [LAPACK][lapack] level routine [`zlaqgb`][lapack-zlaqgb].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Complex128Array = require( '@stdlib/array/complex128' );
var zlaqgb = require( '@stdlib/lapack/base/zlaqgb' );

var AB = new Complex128Array( [ 1.0, 0.5, 2.0, -1.0, 3.0, 1.0, 4.0, 2.0 ] );
var r = new Float64Array( [ 0.5, 2.0 ] );
var c = new Float64Array( [ 1.0, 1.0 ] );

zlaqgb.ndarray( 2, 2, 1, 0, AB, 1, 2, 0, r, 1, 0, c, 1, 0, 0.01, 1.0, 5.0 );
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

[lapack-zlaqgb]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__zlaqgb.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->