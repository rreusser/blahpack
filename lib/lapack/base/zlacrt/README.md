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

# zlacrt

> Performs a linear transformation of a pair of complex vectors.

<section class="usage">

## Usage

```javascript
var zlacrt = require( '@stdlib/lapack/base/zlacrt' );
```

#### zlacrt( N, cx, strideX, cy, strideY, c, s )

Performs a linear transformation of a pair of complex vectors.

```javascript
var Complex128Array = require( '@stdlib/array/complex128' );
var zlacrt = require( '@stdlib/lapack/base/zlacrt' );

var cx = new Complex128Array( [ 1.0, 2.0, 3.0, 4.0, 5.0, 6.0 ] );
var cy = new Complex128Array( [ 7.0, 8.0, 9.0, 10.0, 11.0, 12.0 ] );
var c = new Complex128( 0.6, 0.1 );
var s = new Complex128( 0.8, 0.2 );

zlacrt.ndarray( 3, cx, 1, 0, cy, 1, 0, c, s );
```

The function has the following parameters:

-   **N**: number of columns.
-   **cx**: `cx`.
-   **strideX**: stride length for `X`.
-   **cy**: `cy`.
-   **strideY**: stride length for `Y`.
-   **c**: `c`.
-   **s**: `s`.

#### zlacrt.ndarray( N, cx, strideX, offsetX, cy, strideY, offsetY, c, s )

Performs a linear transformation of a pair of complex vectors, using alternative indexing semantics.

```javascript
var Complex128Array = require( '@stdlib/array/complex128' );
var zlacrt = require( '@stdlib/lapack/base/zlacrt' );

var cx = new Complex128Array( [ 1.0, 2.0, 3.0, 4.0, 5.0, 6.0 ] );
var cy = new Complex128Array( [ 7.0, 8.0, 9.0, 10.0, 11.0, 12.0 ] );
var c = new Complex128( 0.6, 0.1 );
var s = new Complex128( 0.8, 0.2 );

zlacrt.ndarray( 3, cx, 1, 0, cy, 1, 0, c, s );
```

The function has the following additional parameters:

-   **offsetX**: starting index for `X`.
-   **offsetY**: starting index for `Y`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `zlacrt()` corresponds to the [LAPACK][lapack] level routine [`zlacrt`][lapack-zlacrt].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var Complex128Array = require( '@stdlib/array/complex128' );
var zlacrt = require( '@stdlib/lapack/base/zlacrt' );

var cx = new Complex128Array( [ 1.0, 2.0, 3.0, 4.0, 5.0, 6.0 ] );
var cy = new Complex128Array( [ 7.0, 8.0, 9.0, 10.0, 11.0, 12.0 ] );
var c = new Complex128( 0.6, 0.1 );
var s = new Complex128( 0.8, 0.2 );

zlacrt.ndarray( 3, cx, 1, 0, cy, 1, 0, c, s );
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

[lapack-zlacrt]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__zlacrt.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->