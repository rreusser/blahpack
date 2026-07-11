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

# zdrscl

> Multiplies a vector by the reciprocal of a real scalar.

<section class="usage">

## Usage

```javascript
var zdrscl = require( '@stdlib/lapack/base/zdrscl' );
```

#### zdrscl( N, sa, x, strideX )

Multiplies a vector by the reciprocal of a real scalar.

```javascript
var zdrscl = require( '@stdlib/lapack/base/zdrscl' );

var N = 3;
var x = discreteUniform( N, -10, 10, opts );

zdrscl.ndarray( N, 1, x, 1, 0 );
```

The function has the following parameters:

-   **N**: number of columns.
-   **sa**: `sa`.
-   **x**: `x`.
-   **strideX**: stride length for `X`.

#### zdrscl.ndarray( N, sa, x, strideX, offsetX )

Multiplies a vector by the reciprocal of a real scalar, using alternative indexing semantics.

```javascript
var zdrscl = require( '@stdlib/lapack/base/zdrscl' );

var N = 3;
var x = discreteUniform( N, -10, 10, opts );

zdrscl.ndarray( N, 1, x, 1, 0 );
```

The function has the following additional parameters:

-   **offsetX**: starting index for `X`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `zdrscl()` corresponds to the [LAPACK][lapack] level routine [`zdrscl`][lapack-zdrscl].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var zdrscl = require( '@stdlib/lapack/base/zdrscl' );

var N = 3;
var x = discreteUniform( N, -10, 10, opts );

zdrscl.ndarray( N, 1, x, 1, 0 );
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

[lapack-zdrscl]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__zdrscl.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->