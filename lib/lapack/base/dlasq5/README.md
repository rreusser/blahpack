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

# dlasq5

> Computes one dqds transform in ping-pong form with a shift.

<section class="usage">

## Usage

```javascript
var dlasq5 = require( '@stdlib/lapack/base/dlasq5' );
```

#### dlasq5( i0, n0, z, stride, pp, tau, sigma, dmin, dmin1, dmin2, dn, dnm1, dnm2, ieee, eps )

Computes one dqds transform in ping-pong form with a shift.

```javascript
var dlasq5 = require( '@stdlib/lapack/base/dlasq5' );

dlasq5.ndarray( 1, 1, 1, 1, 0, 1, 1.0, 1.0, 1, 1 );
```

The function has the following parameters:

-   **i0**: `i0`.
-   **n0**: `n0`.
-   **z**: `z`.
-   **stride**: `stride`.
-   **pp**: `pp`.
-   **tau**: `tau`.
-   **sigma**: `sigma`.
-   **ieee**: `ieee`.
-   **eps**: `eps`.

#### dlasq5.ndarray( i0, n0, z, stride, offset, pp, tau, sigma, dmin, dmin1, dmin2, dn, dnm1, dnm2, ieee, eps )

Computes one dqds transform in ping-pong form with a shift, using alternative indexing semantics.

```javascript
var dlasq5 = require( '@stdlib/lapack/base/dlasq5' );

dlasq5.ndarray( 1, 1, 1, 1, 0, 1, 1.0, 1.0, 1, 1 );
```

The function has the following additional parameters:

-   **offset**: `offset`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `dlasq5()` corresponds to the [LAPACK][lapack] level routine [`dlasq5`][lapack-dlasq5].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var dlasq5 = require( '@stdlib/lapack/base/dlasq5' );

dlasq5.ndarray( 1, 1, 1, 1, 0, 1, 1.0, 1.0, 1, 1 );
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

[lapack-dlasq5]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__dlasq5.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->