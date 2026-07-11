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

# zaxpy

> Constant times a vector plus a vector.

<section class="usage">

## Usage

```javascript
var zaxpy = require( '@stdlib/blas/base/zaxpy' );
```

#### zaxpy( N, za, zx, strideX, zy, strideY )

Constant times a vector plus a vector.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var zaxpy = require( '@stdlib/blas/base/zaxpy' );

var zx = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
var zy = new Float64Array( [ 5.0, 6.0, 7.0, 8.0 ] );
var alpha = new Float64Array( [ 1.0, 0.0 ] );

zaxpy.ndarray( 2, alpha, zx, 1, 0, zy, 1, 0 );
```

The function has the following parameters:

-   **N**: number of columns.
-   **za**: `za`.
-   **zx**: `zx`.
-   **strideX**: stride length for `X`.
-   **zy**: `zy`.
-   **strideY**: stride length for `Y`.

#### zaxpy.ndarray( N, za, zx, strideX, offsetX, zy, strideY, offsetY )

Constant times a vector plus a vector, using alternative indexing semantics.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var zaxpy = require( '@stdlib/blas/base/zaxpy' );

var zx = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
var zy = new Float64Array( [ 5.0, 6.0, 7.0, 8.0 ] );
var alpha = new Float64Array( [ 1.0, 0.0 ] );

zaxpy.ndarray( 2, alpha, zx, 1, 0, zy, 1, 0 );
```

The function has the following additional parameters:

-   **offsetX**: starting index for `X`.
-   **offsetY**: starting index for `Y`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `zaxpy()` corresponds to the [LAPACK][lapack] level routine [`zaxpy`][lapack-zaxpy].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var zaxpy = require( '@stdlib/blas/base/zaxpy' );

var zx = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
var zy = new Float64Array( [ 5.0, 6.0, 7.0, 8.0 ] );
var alpha = new Float64Array( [ 1.0, 0.0 ] );

zaxpy.ndarray( 2, alpha, zx, 1, 0, zy, 1, 0 );
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

[lapack-zaxpy]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__zaxpy.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->