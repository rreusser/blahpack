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

# dtrrfs

> Provides error bounds and backward error estimates for the solution to a system of linear equations with a triangular coefficient matrix.

<section class="usage">

## Usage

```javascript
var dtrrfs = require( '@stdlib/lapack/base/dtrrfs' );
```

#### dtrrfs( uplo, trans, diag, N, nrhs, A, LDA, B, LDB, X, LDX, FERR, strideFERR, BERR, strideBERR, WORK, strideWORK, IWORK, strideIWORK )

Provides error bounds and backward error estimates for the solution to a system of linear equations with a triangular coefficient matrix.

```javascript
var dtrrfs = require( '@stdlib/lapack/base/dtrrfs' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var B = discreteUniform( N * N, -10, 10, opts );
var X = discreteUniform( N * N, -10, 10, opts );
var FERR = discreteUniform( N, -10, 10, opts );
var BERR = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );
var IWORK = discreteUniform( N, -10, 10, opts );

dtrrfs.ndarray( 'upper', 'no-transpose', 'non-unit', N, N, A, N, 1, 0, B, N, 1, 0, X, N, 1, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, IWORK, 1, 0 );
```

The function has the following parameters:

-   **uplo**: specifies whether the upper or lower triangular part is referenced.
-   **trans**: specifies whether the matrix should be transposed.
-   **diag**: specifies whether the matrix is unit triangular.
-   **N**: number of columns.
-   **nrhs**: number of right-hand sides.
-   **A**: input array `A`.
-   **LDA**: leading dimension of `A`.
-   **B**: input array `B`.
-   **LDB**: leading dimension of `B`.
-   **X**: input array `X`.
-   **LDX**: leading dimension of `X`.
-   **FERR**: input array `FERR`.
-   **strideFERR**: stride length for `FERR`.
-   **BERR**: input array `BERR`.
-   **strideBERR**: stride length for `BERR`.
-   **WORK**: input array `WORK`.
-   **strideWORK**: stride length for `WORK`.
-   **IWORK**: input array `IWORK`.
-   **strideIWORK**: stride length for `IWORK`.

#### dtrrfs.ndarray( uplo, trans, diag, N, nrhs, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWORK, offsetWORK, IWORK, strideIWORK, offsetIWORK )

Provides error bounds and backward error estimates for the solution to a system of linear equations with a triangular coefficient matrix, using alternative indexing semantics.

```javascript
var dtrrfs = require( '@stdlib/lapack/base/dtrrfs' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var B = discreteUniform( N * N, -10, 10, opts );
var X = discreteUniform( N * N, -10, 10, opts );
var FERR = discreteUniform( N, -10, 10, opts );
var BERR = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );
var IWORK = discreteUniform( N, -10, 10, opts );

dtrrfs.ndarray( 'upper', 'no-transpose', 'non-unit', N, N, A, N, 1, 0, B, N, 1, 0, X, N, 1, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, IWORK, 1, 0 );
```

The function has the following additional parameters:

-   **strideA1**: stride of dimension 1 of `A`.
-   **strideA2**: stride of dimension 2 of `A`.
-   **offsetA**: starting index for `A`.
-   **strideB1**: stride of dimension 1 of `B`.
-   **strideB2**: stride of dimension 2 of `B`.
-   **offsetB**: starting index for `B`.
-   **strideX1**: stride of dimension 1 of `X`.
-   **strideX2**: stride of dimension 2 of `X`.
-   **offsetX**: starting index for `X`.
-   **offsetFERR**: starting index for `FERR`.
-   **offsetBERR**: starting index for `BERR`.
-   **offsetWORK**: starting index for `WORK`.
-   **offsetIWORK**: starting index for `IWORK`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `dtrrfs()` corresponds to the [LAPACK][lapack] level routine [`dtrrfs`][lapack-dtrrfs].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var dtrrfs = require( '@stdlib/lapack/base/dtrrfs' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var B = discreteUniform( N * N, -10, 10, opts );
var X = discreteUniform( N * N, -10, 10, opts );
var FERR = discreteUniform( N, -10, 10, opts );
var BERR = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );
var IWORK = discreteUniform( N, -10, 10, opts );

dtrrfs.ndarray( 'upper', 'no-transpose', 'non-unit', N, N, A, N, 1, 0, B, N, 1, 0, X, N, 1, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, IWORK, 1, 0 );
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

[lapack-dtrrfs]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__dtrrfs.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->