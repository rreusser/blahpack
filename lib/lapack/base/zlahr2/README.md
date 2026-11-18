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

# zlahr2

> Reduces the first nb columns of a complex general rectangular matrix to upper trapezoidal form.

<section class="usage">

## Usage

```javascript
var zlahr2 = require( '@stdlib/lapack/base/zlahr2' );
```

#### zlahr2( order, N, K, nb, A, LDA, tau, strideTAU, T, LDT, Y, LDY )

Reduces the first nb columns of a complex general rectangular matrix to upper trapezoidal form.

```javascript
var Complex128Array = require( '@stdlib/array/complex128' );

var N = 3;
var A = new Complex128Array( N * N );
var tau = new Complex128Array( 2 );
var T = new Complex128Array( 4 );
var Y = new Complex128Array( N * 2 );

zlahr2( 'column-major', N, 1, 2, A, N, tau, 1, T, 2, Y, N );
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **N**: number of rows of `A`.
-   **K**: offset for the reduction.
-   **nb**: number of columns to reduce.
-   **A**: input/output `N`-by-`(N-K+1)` matrix.
-   **LDA**: leading dimension of `A`.
-   **tau**: output array of scalar factors (length `nb`).
-   **strideTAU**: stride length for `tau`.
-   **T**: output `nb`-by-`nb` upper triangular matrix.
-   **LDT**: leading dimension of `T`.
-   **Y**: output `N`-by-`nb` matrix.
-   **LDY**: leading dimension of `Y`.

#### zlahr2.ndarray( N, K, nb, A, strideA1, strideA2, offsetA, tau, strideTAU, offsetTAU, T, strideT1, strideT2, offsetT, Y, strideY1, strideY2, offsetY )

Reduces the first nb columns of a complex general rectangular matrix to upper trapezoidal form, using alternative indexing semantics.

```javascript
var zlahr2 = require( '@stdlib/lapack/base/zlahr2' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var T = discreteUniform( N * N, -10, 10, opts );
var Y = discreteUniform( N * N, -10, 10, opts );
var tau = discreteUniform( N, -10, 10, opts );

zlahr2.ndarray( N, N, N, A, N, 1, 0, tau, 1, 0, T, N, 1, 0, Y, N, 1, 0 );
```

The function has the following additional parameters:


</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `zlahr2()` corresponds to the [LAPACK][lapack] level routine [`zlahr2`][lapack-zlahr2].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var zlahr2 = require( '@stdlib/lapack/base/zlahr2' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var T = discreteUniform( N * N, -10, 10, opts );
var Y = discreteUniform( N * N, -10, 10, opts );
var tau = discreteUniform( N, -10, 10, opts );

zlahr2.ndarray( N, N, N, A, N, 1, 0, tau, 1, 0, T, N, 1, 0, Y, N, 1, 0 );
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

[lapack-zlahr2]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__zlahr2.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->