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

# zlacgv

> Conjugate a complex vector in-place.

<section class="usage">

## Usage

```javascript
var zlacgv = require( '@stdlib/lapack/base/zlacgv' );
```

#### zlacgv( N, x, stride )

Conjugate a complex vector in-place.

```javascript
var zlacgv = require( '@stdlib/lapack/base/zlacgv' );

zlacgv.ndarray( N, 1, 1, 0 );
```

The function has the following parameters:

-   **N**: number of columns.
-   **x**: `x`.
-   **stride**: `stride`.

#### zlacgv.ndarray( N, x, stride, offset )

Conjugate a complex vector in-place, using alternative indexing semantics.

```javascript
var zlacgv = require( '@stdlib/lapack/base/zlacgv' );

zlacgv.ndarray( N, 1, 1, 0 );
```

The function has the following additional parameters:

-   **offset**: `offset`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `zlacgv()` corresponds to the [LAPACK][lapack] level routine [`zlacgv`][lapack-zlacgv].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var zlacgv = require( '@stdlib/lapack/base/zlacgv' );

zlacgv.ndarray( N, 1, 1, 0 );
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

[lapack-zlacgv]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__zlacgv.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->