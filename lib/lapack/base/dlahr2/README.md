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

# dlahr2

> Reduces NB columns of a real general n-by-(n-k+1) matrix A.

<section class="usage">

## Usage

```javascript
var dlahr2 = require( '@stdlib/lapack/base/dlahr2' );
```

#### dlahr2( order, N, K, nb, A, LDA, tau, strideTAU, t, strideT1, strideT2, y, strideY1, strideY2 )

Reduces NB columns of a real general n-by-(n-k+1) matrix A.

```javascript
var dlahr2 = require( '@stdlib/lapack/base/dlahr2' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var tau = discreteUniform( N, -10, 10, opts );
var T = discreteUniform( N, -10, 10, opts );
var Y = discreteUniform( N, -10, 10, opts );

dlahr2.ndarray( N, N, N, A, N, 1, 0, tau, 1, 0, T, 1, 1, 0, Y, 1, 1, 0 );
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **N**: number of columns.
-   **K**: inner dimension.
-   **nb**: `nb`.
-   **A**: input array `A`.
-   **LDA**: leading dimension of `A`.
-   **tau**: `tau`.
-   **strideTAU**: stride length for `TAU`.
-   **t**: `t`.
-   **strideT1**: stride of dimension 1 of `T`.
-   **strideT2**: stride of dimension 2 of `T`.
-   **y**: `y`.
-   **strideY1**: stride of dimension 1 of `Y`.
-   **strideY2**: stride of dimension 2 of `Y`.

#### dlahr2.ndarray( N, K, nb, A, strideA1, strideA2, offsetA, tau, strideTAU, offsetTAU, T, strideT1, strideT2, offsetT, Y, strideY1, strideY2, offsetY )

Reduces NB columns of a real general n-by-(n-k+1) matrix A, using alternative indexing semantics.

```javascript
var dlahr2 = require( '@stdlib/lapack/base/dlahr2' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var tau = discreteUniform( N, -10, 10, opts );
var T = discreteUniform( N, -10, 10, opts );
var Y = discreteUniform( N, -10, 10, opts );

dlahr2.ndarray( N, N, N, A, N, 1, 0, tau, 1, 0, T, 1, 1, 0, Y, 1, 1, 0 );
```

The function has the following additional parameters:

-   **strideA1**: stride of dimension 1 of `A`.
-   **strideA2**: stride of dimension 2 of `A`.
-   **offsetA**: starting index for `A`.
-   **offsetTAU**: starting index for `TAU`.
-   **T**: input array `T`.
-   **strideT2**: stride of dimension 2 of `T`.
-   **offsetT**: starting index for `T`.
-   **Y**: input array `Y`.
-   **strideY2**: stride of dimension 2 of `Y`.
-   **offsetY**: starting index for `Y`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `dlahr2()` corresponds to the [LAPACK][lapack] level routine [`dlahr2`][lapack-dlahr2].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var dlahr2 = require( '@stdlib/lapack/base/dlahr2' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var tau = discreteUniform( N, -10, 10, opts );
var T = discreteUniform( N, -10, 10, opts );
var Y = discreteUniform( N, -10, 10, opts );

dlahr2.ndarray( N, N, N, A, N, 1, 0, tau, 1, 0, T, 1, 1, 0, Y, 1, 1, 0 );
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

[lapack-dlahr2]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__dlahr2.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->