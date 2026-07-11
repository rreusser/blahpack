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

# dlarfg

> Generates an elementary reflector (Householder matrix).

<section class="usage">

## Usage

```javascript
var dlarfg = require( '@stdlib/lapack/base/dlarfg' );
```

#### dlarfg( N, alpha, offsetAlpha, x, strideX, tau, offsetTau )

Generates an elementary reflector (Householder matrix).

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var dlarfg = require( '@stdlib/lapack/base/dlarfg' );

var alpha = new Float64Array( [ 3.0 ] );
var x = new Float64Array( [ 4.0, 0.0, 0.0 ] );
var tau = new Float64Array( 1 );

dlarfg.ndarray( 4, alpha, 0, x, 1, 0, tau, 0 );
```

The function has the following parameters:

-   **N**: number of columns.
-   **alpha**: scalar constant.
-   **offsetAlpha**: starting index for `Alpha`.
-   **x**: `x`.
-   **strideX**: stride length for `X`.
-   **tau**: `tau`.
-   **offsetTau**: starting index for `Tau`.

#### dlarfg.ndarray( N, alpha, offsetAlpha, x, strideX, offsetX, tau, offsetTau )

Generates an elementary reflector (Householder matrix), using alternative indexing semantics.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var dlarfg = require( '@stdlib/lapack/base/dlarfg' );

var alpha = new Float64Array( [ 3.0 ] );
var x = new Float64Array( [ 4.0, 0.0, 0.0 ] );
var tau = new Float64Array( 1 );

dlarfg.ndarray( 4, alpha, 0, x, 1, 0, tau, 0 );
```

The function has the following additional parameters:

-   **offsetX**: starting index for `X`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `dlarfg()` corresponds to the [LAPACK][lapack] level routine [`dlarfg`][lapack-dlarfg].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var dlarfg = require( '@stdlib/lapack/base/dlarfg' );

var alpha = new Float64Array( [ 3.0 ] );
var x = new Float64Array( [ 4.0, 0.0, 0.0 ] );
var tau = new Float64Array( 1 );

dlarfg.ndarray( 4, alpha, 0, x, 1, 0, tau, 0 );
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

[lapack-dlarfg]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__dlarfg.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->