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

# dlarrr

> Tests whether a symmetric tridiagonal matrix warrants expensive computations for high relative accuracy

<section class="usage">

## Usage

```javascript
var dlarrr = require( '@stdlib/lapack/base/dlarrr' );
```

#### dlarrr( N, d, strideD, e, strideE )

Tests whether a symmetric tridiagonal matrix warrants expensive computations for high relative accuracy

```javascript
var Float64Array = require( '@stdlib/array/float64' );

var d = new Float64Array( [ 4.0, 4.0, 4.0, 4.0, 4.0 ] );
var e = new Float64Array( [ 1.0, 1.0, 1.0, 1.0 ] );

var info = dlarrr( 5, d, 1, e, 1 );
// returns 0
```

The function has the following parameters:

-   **N**: order of the matrix.
-   **d**: diagonal elements of the tridiagonal matrix.
-   **strideD**: stride length for `d`.
-   **e**: off-diagonal elements of the tridiagonal matrix.
-   **strideE**: stride length for `e`.

The function returns `0` if the matrix may be relatively robust (warranting expensive high-accuracy computations), and `1` if standard methods should be used.

#### dlarrr.ndarray( N, d, strideD, offsetD, e, strideE, offsetE )

Tests whether a symmetric tridiagonal matrix warrants expensive computations for high relative accuracy, using alternative indexing semantics.

```javascript
var Float64Array = require( '@stdlib/array/float64' );

var d = new Float64Array( [ 4.0, 4.0, 4.0, 4.0, 4.0 ] );
var e = new Float64Array( [ 1.0, 1.0, 1.0, 1.0 ] );

var info = dlarrr.ndarray( 5, d, 1, 0, e, 1, 0 );
// returns 0
```

The function has the following additional parameters:

-   **N**: number of columns.
-   **d**: input array.
-   **strideD**: stride length for `d`.
-   **offsetD**: starting index for `D`.
-   **e**: output array.
-   **strideE**: stride length for `e`.
-   **offsetE**: starting index for `E`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   The function returns `0` if the matrix may be relatively robust, indicating that expensive computations guaranteeing high relative accuracy in eigenvalues are warranted. It returns `1` if standard methods should be used instead.
-   The routine checks whether `sqrt(|d(i)|)` is sufficiently large and whether the accumulated off-diagonal ratios remain below a threshold (`RELCOND = 0.999`).

</section>

<!-- /.notes -->

<section class="examples">

## Examples

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var dlarrr = require( '@stdlib/lapack/base/dlarrr' );

// Well-conditioned tridiagonal matrix:
var d = new Float64Array( [ 4.0, 4.0, 4.0, 4.0, 4.0 ] );
var e = new Float64Array( [ 1.0, 1.0, 1.0, 1.0 ] );

var info = dlarrr( 5, d, 1, e, 1 );
console.log( 'Well-conditioned INFO:', info );
// => 0

// Poorly-conditioned tridiagonal matrix:
d = new Float64Array( [ 1.0, 1.0, 1.0, 1.0 ] );
e = new Float64Array( [ 0.99, 0.99, 0.99 ] );

info = dlarrr( 4, d, 1, e, 1 );
console.log( 'Poorly-conditioned INFO:', info );
// => 1
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
[mdn-float32array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float32Array
[mdn-int32array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Int32Array
[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->
