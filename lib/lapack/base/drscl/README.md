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

# drscl

> Multiplies a vector by the reciprocal of a real scalar.

<section class="usage">

## Usage

```javascript
var drscl = require( '@stdlib/lapack/base/drscl' );
```

#### drscl( N, sa, x, strideX )

Multiplies a vector by the reciprocal of a real scalar.

```javascript
var drscl = require( '@stdlib/lapack/base/drscl' );

var N = 3;
var x = discreteUniform( N, -10, 10, opts );

drscl.ndarray( N, 1, x, 1, 0 );
```

The function has the following parameters:

-   **N**: number of columns.
-   **sa**: `sa`.
-   **x**: `x`.
-   **strideX**: stride length for `X`.

#### drscl.ndarray( N, sa, x, strideX, offsetX )

Multiplies a vector by the reciprocal of a real scalar, using alternative indexing semantics.

```javascript
var drscl = require( '@stdlib/lapack/base/drscl' );

var N = 3;
var x = discreteUniform( N, -10, 10, opts );

drscl.ndarray( N, 1, x, 1, 0 );
```

The function has the following additional parameters:

-   **offsetX**: starting index for `X`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `drscl()` corresponds to the [LAPACK][lapack] level routine [`drscl`][lapack-drscl].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var drscl = require( '@stdlib/lapack/base/drscl' );

var N = 3;
var x = discreteUniform( N, -10, 10, opts );

drscl.ndarray( N, 1, x, 1, 0 );
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

[lapack-drscl]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__drscl.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->