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

# dlasrt

> Sorts numbers in increasing or decreasing order.

<section class="usage">

## Usage

```javascript
var dlasrt = require( '@stdlib/lapack/base/dlasrt' );
```

#### dlasrt( id, N, d, stride )

Sorts numbers in increasing or decreasing order.

```javascript
var dlasrt = require( '@stdlib/lapack/base/dlasrt' );

dlasrt.ndarray( 1, N, 1, 1, 0 );
```

The function has the following parameters:

-   **id**: `id`.
-   **N**: number of columns.
-   **d**: `d`.
-   **stride**: `stride`.

#### dlasrt.ndarray( id, N, d, stride, offset )

Sorts numbers in increasing or decreasing order, using alternative indexing semantics.

```javascript
var dlasrt = require( '@stdlib/lapack/base/dlasrt' );

dlasrt.ndarray( 1, N, 1, 1, 0 );
```

The function has the following additional parameters:

-   **offset**: `offset`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `dlasrt()` corresponds to the [LAPACK][lapack] level routine [`dlasrt`][lapack-dlasrt].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var dlasrt = require( '@stdlib/lapack/base/dlasrt' );

dlasrt.ndarray( 1, N, 1, 1, 0 );
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

[lapack-dlasrt]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__dlasrt.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->