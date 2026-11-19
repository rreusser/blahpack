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

# dlanv2

> @license Apache-2.0.

<section class="usage">

## Usage

```javascript
var dlanv2 = require( '@stdlib/lapack/base/dlanv2' );
```

#### dlanv2( a, b, c, d, rt1r, rt1i, rt2r, rt2i, cs, sn )

@license Apache-2.0.

```javascript
var dlanv2 = require( '@stdlib/lapack/base/dlanv2' );

dlanv2.ndarray( 1.0, -5.0, 1.0, 1.0 );
```

The function has the following parameters:

-   **a**: `a`.
-   **b**: `b`.
-   **c**: `c`.
-   **d**: `d`.

#### dlanv2.ndarray( A, B, C, D, rt1r, rt1i, rt2r, rt2i, cs, sn )

@license Apache-2.0, using alternative indexing semantics.

```javascript
var dlanv2 = require( '@stdlib/lapack/base/dlanv2' );

dlanv2.ndarray( 1.0, -5.0, 1.0, 1.0 );
```

The function has the following additional parameters:

-   **A**: input array `A`.
-   **B**: input array `B`.
-   **C**: input array `C`.
-   **D**: input array `D`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `dlanv2()` corresponds to the [LAPACK][lapack] level routine [`dlanv2`][lapack-dlanv2].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var dlanv2 = require( '@stdlib/lapack/base/dlanv2' );

dlanv2.ndarray( 1.0, -5.0, 1.0, 1.0 );
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

[lapack-dlanv2]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__dlanv2.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->