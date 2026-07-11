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

# zdrot

> Applies a plane rotation.

<section class="usage">

## Usage

```javascript
var zdrot = require( '@stdlib/blas/base/zdrot' );
```

#### zdrot( N, zx, strideX, zy, strideY, c, s )

Applies a plane rotation.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var zdrot = require( '@stdlib/blas/base/zdrot' );

var zx = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
var zy = new Float64Array( [ 5.0, 6.0, 7.0, 8.0 ] );

zdrot.ndarray( 2, zx, 1, 0, zy, 1, 0, 0.8, 0.6 );
```

The function has the following parameters:

-   **N**: number of columns.
-   **zx**: `zx`.
-   **strideX**: stride length for `X`.
-   **zy**: `zy`.
-   **strideY**: stride length for `Y`.
-   **c**: `c`.
-   **s**: `s`.

#### zdrot.ndarray( N, zx, strideX, offsetX, zy, strideY, offsetY, c, s )

Applies a plane rotation, using alternative indexing semantics.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var zdrot = require( '@stdlib/blas/base/zdrot' );

var zx = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
var zy = new Float64Array( [ 5.0, 6.0, 7.0, 8.0 ] );

zdrot.ndarray( 2, zx, 1, 0, zy, 1, 0, 0.8, 0.6 );
```

The function has the following additional parameters:

-   **offsetX**: starting index for `X`.
-   **offsetY**: starting index for `Y`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `zdrot()` corresponds to the [LAPACK][lapack] level routine [`zdrot`][lapack-zdrot].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var zdrot = require( '@stdlib/blas/base/zdrot' );

var zx = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
var zy = new Float64Array( [ 5.0, 6.0, 7.0, 8.0 ] );

zdrot.ndarray( 2, zx, 1, 0, zy, 1, 0, 0.8, 0.6 );
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

[lapack-zdrot]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__zdrot.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->