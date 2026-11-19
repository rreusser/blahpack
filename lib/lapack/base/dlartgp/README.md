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

# dlartgp

> Generate a plane rotation (Givens rotation) with a non-negative diagonal.

<section class="usage">

## Usage

```javascript
var dlartgp = require( '@stdlib/lapack/base/dlartgp' );
```

#### dlartgp( f, g, cs, sn, r )

Generates a plane rotation such that

```text
[  cs  sn ]   [ f ]   [ r ]
[ -sn  cs ] . [ g ] = [ 0 ]
```

where `cs^2 + sn^2 = 1` and the sign is chosen so that `r >= 0`.

```javascript
var Float64Array = require( '@stdlib/array/float64' );

var out = new Float64Array( 3 );
dlartgp( 3.0, 4.0, out );
// out => <Float64Array>[ 0.6, 0.8, 5.0 ]
```

The function has the following parameters:

-   **f**: first component of the vector to be rotated.
-   **g**: second component of the vector to be rotated.
-   **out**: [`Float64Array`][mdn-float64array] of length at least `3`. On return, `out[0] = cs` (cosine), `out[1] = sn` (sine), `out[2] = r` (the non-negative radius).

The function returns `out`.

#### dlartgp.ndarray( f, g, cs, sn, r )

Generates a plane rotation, writing the results `[cs, sn, r]` into a pre-allocated output array.

```javascript
var Float64Array = require( '@stdlib/array/float64' );

var out = new Float64Array( 3 );
dlartgp.ndarray( 3.0, 4.0, out );
// out => <Float64Array>[ 0.6, 0.8, 5.0 ]
```

The function has the following additional parameters:

-   **out**: [`Float64Array`][mdn-float64array] of length at least `3`. On return, `out[0] = cs`, `out[1] = sn`, `out[2] = r`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   This is a more accurate (and slower) alternative to the Level-1 BLAS routine `drotg`. Unlike [`dlartg`][@stdlib/lapack/base/dlartg], `dlartgp` always returns a non-negative `r`.
-   If `g = 0`, then `cs = sign(1, f)` and `sn = 0`.
-   If `f = 0` and `g != 0`, then `cs = 0` and `sn = sign(1, g)`.
-   The algorithm incorporates iterative rescaling to avoid overflow or underflow for inputs with extreme magnitude.

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var dlartgp = require( '@stdlib/lapack/base/dlartgp' );

var r1 = dlartgp( 3.0, 4.0, new Float64Array( 3 ) );
console.log( r1 );
// => <Float64Array>[ 0.6, 0.8, 5.0 ]

var r2 = dlartgp( -3.0, -4.0, new Float64Array( 3 ) );
console.log( r2 );
// => <Float64Array>[ -0.6, -0.8, 5.0 ]
```

</section>

<!-- /.examples -->

<!-- Section for related `stdlib` packages. Do not manually edit this section, as it is automatically populated. -->

<section class="related">

</section>

<!-- /.related -->

<!-- Section for all links. Make sure to keep an empty line after the `section` element and another before the `/section` close. -->

<section class="links">

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[@stdlib/lapack/base/dlartg]: https://github.com/stdlib-js/stdlib

</section>

<!-- /.links -->
