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

# zlaqps

> Computes a step of QR factorization with column pivoting of a real m-by-n matrix A by using BLAS level 3.

<section class="usage">

## Usage

```javascript
var zlaqps = require( '@stdlib/lapack/base/zlaqps' );
```

#### zlaqps( order, M, N, offset, nb, A, LDA, JPVT, strideJPVT, TAU, strideTAU, VN1, strideVN1, VN2, strideVN2, AUXV, strideAUXV, F, LDF )

Computes a step of QR factorization with column pivoting of a real m-by-n matrix A by using BLAS level 3.

```javascript
var zlaqps = require( '@stdlib/lapack/base/zlaqps' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var F = discreteUniform( N * N, -10, 10, opts );
var JPVT = discreteUniform( N, -10, 10, opts );
var TAU = discreteUniform( N, -10, 10, opts );
var AUXV = discreteUniform( N, -10, 10, opts );

zlaqps.ndarray( N, N, 0, N, A, N, 1, 0, JPVT, 1, 0, TAU, 1, 0, 1, N, 0, 1, 1, 0, AUXV, 1, 0, F, N, 1, 0 );
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **M**: number of rows.
-   **N**: number of columns.
-   **offset**: `offset`.
-   **nb**: `nb`.
-   **A**: input array `A`.
-   **LDA**: leading dimension of `A`.
-   **JPVT**: input array `JPVT`.
-   **strideJPVT**: stride length for `JPVT`.
-   **TAU**: input array `TAU`.
-   **strideTAU**: stride length for `TAU`.
-   **VN1**: input array `VN1`.
-   **strideVN1**: stride of dimension 1 of `VN`.
-   **VN2**: input array `VN2`.
-   **strideVN2**: stride of dimension 2 of `VN`.
-   **AUXV**: input array `AUXV`.
-   **strideAUXV**: stride length for `AUXV`.
-   **F**: input array `F`.
-   **LDF**: leading dimension of `F`.

#### zlaqps.ndarray( M, N, offset, nb, A, strideA1, strideA2, offsetA, JPVT, strideJPVT, offsetJPVT, TAU, strideTAU, offsetTAU, VN1, strideVN1, offsetVN1, VN2, strideVN2, offsetVN2, AUXV, strideAUXV, offsetAUXV, F, strideF1, strideF2, offsetF )

Computes a step of QR factorization with column pivoting of a real m-by-n matrix A by using BLAS level 3, using alternative indexing semantics.

```javascript
var zlaqps = require( '@stdlib/lapack/base/zlaqps' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var F = discreteUniform( N * N, -10, 10, opts );
var JPVT = discreteUniform( N, -10, 10, opts );
var TAU = discreteUniform( N, -10, 10, opts );
var AUXV = discreteUniform( N, -10, 10, opts );

zlaqps.ndarray( N, N, 0, N, A, N, 1, 0, JPVT, 1, 0, TAU, 1, 0, 1, N, 0, 1, 1, 0, AUXV, 1, 0, F, N, 1, 0 );
```

The function has the following additional parameters:

-   **strideA1**: stride of dimension 1 of `A`.
-   **strideA2**: stride of dimension 2 of `A`.
-   **offsetA**: starting index for `A`.
-   **offsetJPVT**: starting index for `JPVT`.
-   **offsetTAU**: starting index for `TAU`.
-   **offsetVN1**: starting index for `VN1`.
-   **offsetVN2**: starting index for `VN2`.
-   **offsetAUXV**: starting index for `AUXV`.
-   **strideF1**: stride of dimension 1 of `F`.
-   **strideF2**: stride of dimension 2 of `F`.
-   **offsetF**: starting index for `F`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `zlaqps()` corresponds to the [LAPACK][lapack] level routine [`zlaqps`][lapack-zlaqps].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var zlaqps = require( '@stdlib/lapack/base/zlaqps' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var F = discreteUniform( N * N, -10, 10, opts );
var JPVT = discreteUniform( N, -10, 10, opts );
var TAU = discreteUniform( N, -10, 10, opts );
var AUXV = discreteUniform( N, -10, 10, opts );

zlaqps.ndarray( N, N, 0, N, A, N, 1, 0, JPVT, 1, 0, TAU, 1, 0, 1, N, 0, 1, 1, 0, AUXV, 1, 0, F, N, 1, 0 );
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

[lapack-zlaqps]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__zlaqps.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->