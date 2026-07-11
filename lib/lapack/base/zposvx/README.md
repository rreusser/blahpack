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

# zposvx

> Computes the solution to system of linear equations A·X = B for positive definite matrices.

<section class="usage">

## Usage

```javascript
var zposvx = require( '@stdlib/lapack/base/zposvx' );
```

#### zposvx( fact, uplo, N, nrhs, A, LDA, AF, LDAF, equed, s, strideS, B, LDB, X, LDX, rcond, FERR, strideFERR, BERR, strideBERR, WORK, strideWORK, RWORK, strideRWORK )

Computes the solution to system of linear equations A·X = B for positive definite matrices.

```javascript
var zposvx = require( '@stdlib/lapack/base/zposvx' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var AF = discreteUniform( N * N, -10, 10, opts );
var B = discreteUniform( N * N, -10, 10, opts );
var X = discreteUniform( N * N, -10, 10, opts );
var s = discreteUniform( N, -10, 10, opts );
var FERR = discreteUniform( N, -10, 10, opts );
var BERR = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );
var RWORK = discreteUniform( N, -10, 10, opts );

zposvx.ndarray( 'not-factored', 'upper', N, N, A, N, 1, 0, AF, N, 1, 0, 'none', s, 1, 0, B, N, 1, 0, X, N, 1, 0, 1.0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 );
```

The function has the following parameters:

-   **fact**: `fact`.
-   **uplo**: specifies whether the upper or lower triangular part is referenced.
-   **N**: number of columns.
-   **nrhs**: number of right-hand sides.
-   **A**: input array `A`.
-   **LDA**: leading dimension of `A`.
-   **AF**: input array `AF`.
-   **LDAF**: leading dimension of `AF`.
-   **equed**: `equed`.
-   **s**: `s`.
-   **strideS**: stride length for `S`.
-   **B**: input array `B`.
-   **LDB**: leading dimension of `B`.
-   **X**: input array `X`.
-   **LDX**: leading dimension of `X`.
-   **rcond**: `rcond`.
-   **FERR**: input array `FERR`.
-   **strideFERR**: stride length for `FERR`.
-   **BERR**: input array `BERR`.
-   **strideBERR**: stride length for `BERR`.
-   **WORK**: input array `WORK`.
-   **strideWORK**: stride length for `WORK`.
-   **RWORK**: input array `RWORK`.
-   **strideRWORK**: stride length for `RWORK`.

#### zposvx.ndarray( fact, uplo, N, nrhs, A, strideA1, strideA2, offsetA, AF, strideAF1, strideAF2, offsetAF, equed, s, strideS, offsetS, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, rcond, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWORK, offsetWORK, RWORK, strideRWORK, offsetRWORK )

Computes the solution to system of linear equations A·X = B for positive definite matrices, using alternative indexing semantics.

```javascript
var zposvx = require( '@stdlib/lapack/base/zposvx' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var AF = discreteUniform( N * N, -10, 10, opts );
var B = discreteUniform( N * N, -10, 10, opts );
var X = discreteUniform( N * N, -10, 10, opts );
var s = discreteUniform( N, -10, 10, opts );
var FERR = discreteUniform( N, -10, 10, opts );
var BERR = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );
var RWORK = discreteUniform( N, -10, 10, opts );

zposvx.ndarray( 'not-factored', 'upper', N, N, A, N, 1, 0, AF, N, 1, 0, 'none', s, 1, 0, B, N, 1, 0, X, N, 1, 0, 1.0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 );
```

The function has the following additional parameters:

-   **strideA1**: stride of dimension 1 of `A`.
-   **strideA2**: stride of dimension 2 of `A`.
-   **offsetA**: starting index for `A`.
-   **strideAF1**: stride of dimension 1 of `AF`.
-   **strideAF2**: stride of dimension 2 of `AF`.
-   **offsetAF**: starting index for `AF`.
-   **offsetS**: starting index for `S`.
-   **strideB1**: stride of dimension 1 of `B`.
-   **strideB2**: stride of dimension 2 of `B`.
-   **offsetB**: starting index for `B`.
-   **strideX1**: stride of dimension 1 of `X`.
-   **strideX2**: stride of dimension 2 of `X`.
-   **offsetX**: starting index for `X`.
-   **offsetFERR**: starting index for `FERR`.
-   **offsetBERR**: starting index for `BERR`.
-   **offsetWORK**: starting index for `WORK`.
-   **offsetRWORK**: starting index for `RWORK`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `zposvx()` corresponds to the [LAPACK][lapack] level routine [`zposvx`][lapack-zposvx].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var zposvx = require( '@stdlib/lapack/base/zposvx' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var AF = discreteUniform( N * N, -10, 10, opts );
var B = discreteUniform( N * N, -10, 10, opts );
var X = discreteUniform( N * N, -10, 10, opts );
var s = discreteUniform( N, -10, 10, opts );
var FERR = discreteUniform( N, -10, 10, opts );
var BERR = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );
var RWORK = discreteUniform( N, -10, 10, opts );

zposvx.ndarray( 'not-factored', 'upper', N, N, A, N, 1, 0, AF, N, 1, 0, 'none', s, 1, 0, B, N, 1, 0, X, N, 1, 0, 1.0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 );
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

[lapack-zposvx]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__zposvx.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->