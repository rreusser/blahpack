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

# zgels

> Solves overdetermined or underdetermined systems for general matrices.

<section class="usage">

## Usage

```javascript
var zgels = require( '@stdlib/lapack/base/zgels' );
```

#### zgels( order, trans, M, N, nrhs, A, LDA, B, LDB, WORK )

Solves overdetermined or underdetermined systems for general matrices.

```javascript
var zgels = require( '@stdlib/lapack/base/zgels' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var B = discreteUniform( N * N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );

zgels.ndarray( 'no-transpose', N, N, N, A, N, 1, 0, B, N, 1, 0, WORK, 1, 0, N );
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **trans**: specifies whether to solve with `A` (`'no-transpose'`) or its conjugate transpose (`'conjugate-transpose'`).
-   **M**: number of rows of `A`.
-   **N**: number of columns of `A`.
-   **nrhs**: number of right-hand sides.
-   **A**: input matrix `A`; overwritten with its factorization.
-   **LDA**: leading dimension of `A`.
-   **B**: `max(M,N)`-by-`nrhs` matrix: the right-hand sides on entry, the solution on exit.
-   **LDB**: leading dimension of `B` (column-major: `>= max(1,M,N)`; row-major: `>= max(1,nrhs)`).
-   **WORK**: workspace; if `null`, a workspace is allocated internally.

#### zgels.ndarray( trans, M, N, nrhs, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, WORK, strideWORK, offsetWORK, lwork )

Solves overdetermined or underdetermined systems for general matrices, using alternative indexing semantics.

```javascript
var zgels = require( '@stdlib/lapack/base/zgels' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var B = discreteUniform( N * N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );

zgels.ndarray( 'no-transpose', N, N, N, A, N, 1, 0, B, N, 1, 0, WORK, 1, 0, N );
```

The function has the following additional parameters:

-   **strideA1**: stride of dimension 1 of `A`.
-   **strideA2**: stride of dimension 2 of `A`.
-   **offsetA**: starting index for `A`.
-   **strideB1**: stride of dimension 1 of `B`.
-   **strideB2**: stride of dimension 2 of `B`.
-   **offsetB**: starting index for `B`.
-   **offsetWORK**: starting index for `WORK`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `zgels()` corresponds to the [LAPACK][lapack] level routine [`zgels`][lapack-zgels].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var zgels = require( '@stdlib/lapack/base/zgels' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var B = discreteUniform( N * N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );

zgels.ndarray( 'no-transpose', N, N, N, A, N, 1, 0, B, N, 1, 0, WORK, 1, 0, N );
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

[lapack-zgels]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__zgels.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->