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

# dlas2

> Computes singular values of a 2-by-2 triangular matrix.

<section class="usage">

## Usage

```javascript
var dlas2 = require( '@stdlib/lapack/base/dlas2' );
```

#### dlas2( f, g, h, out )

Computes singular values of a 2-by-2 triangular matrix.

```javascript
var dlas2 = require( '@stdlib/lapack/base/dlas2' );

dlas2.ndarray( 1, 1, 1, 1 );
```

The function has the following parameters:

-   **f**: `f`.
-   **g**: `g`.
-   **h**: `h`.
-   **out**: `out`.

#### dlas2.ndarray( f, g, h, out )

Computes singular values of a 2-by-2 triangular matrix, using alternative indexing semantics.

```javascript
var dlas2 = require( '@stdlib/lapack/base/dlas2' );

dlas2.ndarray( 1, 1, 1, 1 );
```

The function has the following additional parameters:


</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `dlas2()` corresponds to the [LAPACK][lapack] level routine [`dlas2`][lapack-dlas2].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var dlas2 = require( '@stdlib/lapack/base/dlas2' );

dlas2.ndarray( 1, 1, 1, 1 );
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

[lapack-dlas2]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__dlas2.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->