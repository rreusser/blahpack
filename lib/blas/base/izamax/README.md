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

# izamax

> Finds the index of the first element having maximum |Re(.)| + |Im(.)|.

<section class="usage">

## Usage

```javascript
var izamax = require( '@stdlib/blas/base/izamax' );
```

#### izamax( N, zx, strideX )

Finds the index of the first element having maximum |Re(.)| + |Im(.)|.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var izamax = require( '@stdlib/blas/base/izamax' );

var zx = new Float64Array( [ 1.0, 2.0, 5.0, 1.0, 3.0, 4.0 ] );

izamax.ndarray( 3, zx, 1, 0 );
```

The function has the following parameters:

-   **N**: number of columns.
-   **zx**: `zx`.
-   **strideX**: stride length for `X`.

#### izamax.ndarray( N, zx, strideX, offsetX )

Finds the index of the first element having maximum |Re(.)| + |Im(.)|, using alternative indexing semantics.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var izamax = require( '@stdlib/blas/base/izamax' );

var zx = new Float64Array( [ 1.0, 2.0, 5.0, 1.0, 3.0, 4.0 ] );

izamax.ndarray( 3, zx, 1, 0 );
```

The function has the following additional parameters:

-   **offsetX**: starting index for `X`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `izamax()` corresponds to the [LAPACK][lapack] level routine [`izamax`][lapack-izamax].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var izamax = require( '@stdlib/blas/base/izamax' );

var zx = new Float64Array( [ 1.0, 2.0, 5.0, 1.0, 3.0, 4.0 ] );

izamax.ndarray( 3, zx, 1, 0 );
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

[lapack-izamax]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__izamax.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->