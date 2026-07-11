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

# zgelq2

> Computes the LQ factorization of a general rectangular matrix using an unblocked algorithm.

<section class="usage">

## Usage

```javascript
var zgelq2 = require( '@stdlib/lapack/base/zgelq2' );
```

#### zgelq2( order, M, N, A, LDA, TAU, strideTAU, WORK, strideWORK )

Computes the LQ factorization of a general rectangular matrix using an unblocked algorithm.

```javascript
var zgelq2 = require( '@stdlib/lapack/base/zgelq2' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var TAU = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );

zgelq2.ndarray( N, N, A, N, 1, 0, TAU, 1, 0, WORK, 1, 0 );
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **M**: number of rows.
-   **N**: number of columns.
-   **A**: input array `A`.
-   **LDA**: leading dimension of `A`.
-   **TAU**: input array `TAU`.
-   **strideTAU**: stride length for `TAU`.
-   **WORK**: input array `WORK`.
-   **strideWORK**: stride length for `WORK`.

#### zgelq2.ndarray( M, N, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWORK, offsetWORK )

Computes the LQ factorization of a general rectangular matrix using an unblocked algorithm, using alternative indexing semantics.

```javascript
var zgelq2 = require( '@stdlib/lapack/base/zgelq2' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var TAU = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );

zgelq2.ndarray( N, N, A, N, 1, 0, TAU, 1, 0, WORK, 1, 0 );
```

The function has the following additional parameters:

-   **strideA1**: stride of dimension 1 of `A`.
-   **strideA2**: stride of dimension 2 of `A`.
-   **offsetA**: starting index for `A`.
-   **offsetTAU**: starting index for `TAU`.
-   **offsetWORK**: starting index for `WORK`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `zgelq2()` corresponds to the [LAPACK][lapack] level routine [`zgelq2`][lapack-zgelq2].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var zgelq2 = require( '@stdlib/lapack/base/zgelq2' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var TAU = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );

zgelq2.ndarray( N, N, A, N, 1, 0, TAU, 1, 0, WORK, 1, 0 );
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

[lapack-zgelq2]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__zgelq2.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->