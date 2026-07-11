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

# dlasq3

> Checks for deflation, computes a shift and calls dqds.

<section class="usage">

## Usage

```javascript
var dlasq3 = require( '@stdlib/lapack/base/dlasq3' );
```

#### dlasq3( i0, n0, z, stride, pp, dmin, sigma, desig, qmax, nfail, iter, ndiv, ieee, ttype, dmin1, dmin2, dn, dn1, dn2, g, tau )

Checks for deflation, computes a shift and calls dqds.

```javascript
var dlasq3 = require( '@stdlib/lapack/base/dlasq3' );

dlasq3.ndarray( 1, 1, 1, 1, 0, 1, 1, 1.0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.0 );
```

The function has the following parameters:

-   **i0**: `i0`.
-   **n0**: `n0`.
-   **z**: `z`.
-   **stride**: `stride`.
-   **pp**: `pp`.
-   **dmin**: `dmin`.
-   **sigma**: `sigma`.
-   **desig**: `desig`.
-   **qmax**: `qmax`.
-   **nfail**: `nfail`.
-   **iter**: `iter`.
-   **ndiv**: `ndiv`.
-   **ieee**: `ieee`.
-   **ttype**: `ttype`.
-   **dmin1**: `dmin1`.
-   **dmin2**: `dmin2`.
-   **dn**: `dn`.
-   **dn1**: `dn1`.
-   **dn2**: `dn2`.
-   **g**: `g`.
-   **tau**: `tau`.

#### dlasq3.ndarray( i0, n0, z, stride, offset, pp, dmin, sigma, desig, qmax, nfail, iter, ndiv, ieee, ttype, dmin1, dmin2, dn, dn1, dn2, g, tau )

Checks for deflation, computes a shift and calls dqds, using alternative indexing semantics.

```javascript
var dlasq3 = require( '@stdlib/lapack/base/dlasq3' );

dlasq3.ndarray( 1, 1, 1, 1, 0, 1, 1, 1.0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.0 );
```

The function has the following additional parameters:

-   **offset**: `offset`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `dlasq3()` corresponds to the [LAPACK][lapack] level routine [`dlasq3`][lapack-dlasq3].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var dlasq3 = require( '@stdlib/lapack/base/dlasq3' );

dlasq3.ndarray( 1, 1, 1, 1, 0, 1, 1, 1.0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.0 );
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

[lapack-dlasq3]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__dlasq3.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->