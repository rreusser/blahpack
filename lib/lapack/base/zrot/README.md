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

# zrot

> Applies a plane rotation with real cosine and complex sine to a pair of complex vectors.

<section class="usage">

## Usage

```javascript
var zrot = require( '@stdlib/lapack/base/zrot' );
```

#### zrot( N, cx, strideX, cy, strideY, c, s )

Applies a plane rotation with real cosine and complex sine to a pair of complex vectors.

```javascript
var zrot = require( '@stdlib/lapack/base/zrot' );

zrot.ndarray( N, 1, 1, 0, 1, 1, 0, 1.0, 1.0 );
```

The function has the following parameters:

-   **N**: number of columns.
-   **cx**: `cx`.
-   **strideX**: stride length for `X`.
-   **cy**: `cy`.
-   **strideY**: stride length for `Y`.
-   **c**: `c`.
-   **s**: `s`.

#### zrot.ndarray( N, cx, strideX, offsetX, cy, strideY, offsetY, c, s )

Applies a plane rotation with real cosine and complex sine to a pair of complex vectors, using alternative indexing semantics.

```javascript
var zrot = require( '@stdlib/lapack/base/zrot' );

zrot.ndarray( N, 1, 1, 0, 1, 1, 0, 1.0, 1.0 );
```

The function has the following additional parameters:

-   **offsetX**: starting index for `X`.
-   **offsetY**: starting index for `Y`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `zrot()` corresponds to the [LAPACK][lapack] level routine [`zrot`][lapack-zrot].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var zrot = require( '@stdlib/lapack/base/zrot' );

zrot.ndarray( N, 1, 1, 0, 1, 1, 0, 1.0, 1.0 );
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

[lapack-zrot]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__zrot.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->