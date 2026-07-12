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

# dlamch

> Determines double-precision machine parameters.

<section class="usage">

## Usage

```javascript
var dlamch = require( '@stdlib/lapack/base/dlamch' );
```

#### dlamch( cmach )

Determines double-precision machine parameters.

```javascript
var dlamch = require( '@stdlib/lapack/base/dlamch' );

dlamch( 'epsilon' );
```

The function has the following parameters:

-   **cmach**: string specifying which machine parameter to return. Long-form (preferred): `epsilon`, `safe-minimum`, `base`, `precision`, `digits`, `rounding`, `min-exponent`, `underflow`, `max-exponent`, `overflow`, or `scale`. The single-character LAPACK codes (`E`, `S`, `B`, `P`, `N`, `R`, `M`, `U`, `L`, `O`, either case) are also accepted. An unrecognized value returns `0`.

The function returns a `number`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `dlamch()` corresponds to the [LAPACK][lapack] level routine [`dlamch`][lapack-dlamch].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var dlamch = require( '@stdlib/lapack/base/dlamch' );

dlamch( 'epsilon' );
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

[lapack-dlamch]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__dlamch.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->