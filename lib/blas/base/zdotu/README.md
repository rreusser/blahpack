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

# zdotu

> Forms the dot product of two complex vectors ZDOTU = Xᵀ·Y.

<section class="usage">

## Usage

```javascript
var zdotu = require( '@stdlib/blas/base/zdotu' );
```

#### zdotu( N, x, strideX, y, strideY )

Forms the dot product of two complex vectors ZDOTU = Xᵀ·Y.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var zdotu = require( '@stdlib/blas/base/zdotu' );

var x = new Float64Array( [ 1.0, 0.0, 0.0, 1.0 ] );
var y = new Float64Array( [ 1.0, 0.0, 0.0, 1.0 ] );

zdotu.ndarray( 2, x, 1, 0, y, 1, 0 );
```

The function has the following parameters:

-   **N**: number of columns.
-   **x**: `x`.
-   **strideX**: stride length for `X`.
-   **y**: `y`.
-   **strideY**: stride length for `Y`.

#### zdotu.ndarray( N, x, strideX, offsetX, y, strideY, offsetY )

Forms the dot product of two complex vectors ZDOTU = Xᵀ·Y, using alternative indexing semantics.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var zdotu = require( '@stdlib/blas/base/zdotu' );

var x = new Float64Array( [ 1.0, 0.0, 0.0, 1.0 ] );
var y = new Float64Array( [ 1.0, 0.0, 0.0, 1.0 ] );

zdotu.ndarray( 2, x, 1, 0, y, 1, 0 );
```

The function has the following additional parameters:

-   **offsetX**: starting index for `X`.
-   **offsetY**: starting index for `Y`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `zdotu()` corresponds to the [LAPACK][lapack] level routine [`zdotu`][lapack-zdotu].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var zdotu = require( '@stdlib/blas/base/zdotu' );

var x = new Float64Array( [ 1.0, 0.0, 0.0, 1.0 ] );
var y = new Float64Array( [ 1.0, 0.0, 0.0, 1.0 ] );

zdotu.ndarray( 2, x, 1, 0, y, 1, 0 );
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

[lapack-zdotu]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__zdotu.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->