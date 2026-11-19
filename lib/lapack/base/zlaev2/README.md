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

# zlaev2

> @license Apache-2.0.

<section class="usage">

## Usage

```javascript
var zlaev2 = require( '@stdlib/lapack/base/zlaev2' );
```

#### zlaev2( a, b, c, rt1, rt2, cs1, sn1 )

@license Apache-2.0.

```javascript
var zlaev2 = require( '@stdlib/lapack/base/zlaev2' );

var a = new Complex128( 5.0, 0.0 );
var b = new Complex128( 1.0, 2.0 );
var c = new Complex128( 3.0, 0.0 );

zlaev2( a, b, c, rt1, rt2, cs1, sn1 );
```

The function has the following parameters:

-   **a**: `a`.
-   **b**: `b`.
-   **c**: `c`.

#### zlaev2.ndarray( a, b, c, rt1, rt2, cs1, sn1 )

@license Apache-2.0, using alternative indexing semantics.

```javascript
var zlaev2 = require( '@stdlib/lapack/base/zlaev2' );

var a = new Complex128( 5.0, 0.0 );
var b = new Complex128( 1.0, 2.0 );
var c = new Complex128( 3.0, 0.0 );

zlaev2( a, b, c, rt1, rt2, cs1, sn1 );
```

The function has the following additional parameters:


</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `zlaev2()` corresponds to the [LAPACK][lapack] level routine [`zlaev2`][lapack-zlaev2].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var zlaev2 = require( '@stdlib/lapack/base/zlaev2' );

var a = new Complex128( 5.0, 0.0 );
var b = new Complex128( 1.0, 2.0 );
var c = new Complex128( 3.0, 0.0 );

zlaev2( a, b, c, rt1, rt2, cs1, sn1 );
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

[lapack-zlaev2]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__zlaev2.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->