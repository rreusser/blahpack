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

# zgerfs

> CABS1: |re(z)| + |im(z)|.

<section class="usage">

## Usage

```javascript
var zgerfs = require( '@stdlib/lapack/base/zgerfs' );
```

#### zgerfs( v, idx )

CABS1: |re(z)| + |im(z)|.

```javascript
var zgerfs = require( '@stdlib/lapack/base/zgerfs' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var AF = discreteUniform( N * N, -10, 10, opts );
var B = discreteUniform( N * N, -10, 10, opts );
var X = discreteUniform( N * N, -10, 10, opts );
var IPIV = discreteUniform( N, -10, 10, opts );
var FERR = discreteUniform( N, -10, 10, opts );
var BERR = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );
var RWORK = discreteUniform( N, -10, 10, opts );

zgerfs.ndarray( 'no-transpose', N, N, A, N, 1, 0, AF, N, 1, 0, IPIV, 1, 0, B, N, 1, 0, X, N, 1, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 );
```

The function has the following parameters:

-   **v**: `v`.
-   **idx**: `idx`.

#### zgerfs.ndarray( trans, N, nrhs, A, strideA1, strideA2, offsetA, AF, strideAF1, strideAF2, offsetAF, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWORK, offsetWORK, RWORK, strideRWORK, offsetRWORK )

CABS1: |re(z)| + |im(z)|, using alternative indexing semantics.

```javascript
var zgerfs = require( '@stdlib/lapack/base/zgerfs' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var AF = discreteUniform( N * N, -10, 10, opts );
var B = discreteUniform( N * N, -10, 10, opts );
var X = discreteUniform( N * N, -10, 10, opts );
var IPIV = discreteUniform( N, -10, 10, opts );
var FERR = discreteUniform( N, -10, 10, opts );
var BERR = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );
var RWORK = discreteUniform( N, -10, 10, opts );

zgerfs.ndarray( 'no-transpose', N, N, A, N, 1, 0, AF, N, 1, 0, IPIV, 1, 0, B, N, 1, 0, X, N, 1, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 );
```

The function has the following additional parameters:

-   **trans**: specifies whether the matrix should be transposed.
-   **N**: number of columns.
-   **nrhs**: number of right-hand sides.
-   **A**: input array `A`.
-   **strideA1**: stride of dimension 1 of `A`.
-   **strideA2**: stride of dimension 2 of `A`.
-   **offsetA**: starting index for `A`.
-   **AF**: input array `AF`.
-   **strideAF1**: stride of dimension 1 of `AF`.
-   **strideAF2**: stride of dimension 2 of `AF`.
-   **offsetAF**: starting index for `AF`.
-   **IPIV**: input array `IPIV`.
-   **strideIPIV**: stride length for `IPIV`.
-   **offsetIPIV**: starting index for `IPIV`.
-   **B**: input array `B`.
-   **strideB1**: stride of dimension 1 of `B`.
-   **strideB2**: stride of dimension 2 of `B`.
-   **offsetB**: starting index for `B`.
-   **X**: input array `X`.
-   **strideX1**: stride of dimension 1 of `X`.
-   **strideX2**: stride of dimension 2 of `X`.
-   **offsetX**: starting index for `X`.
-   **FERR**: input array `FERR`.
-   **strideFERR**: stride length for `FERR`.
-   **offsetFERR**: starting index for `FERR`.
-   **BERR**: input array `BERR`.
-   **strideBERR**: stride length for `BERR`.
-   **offsetBERR**: starting index for `BERR`.
-   **WORK**: input array `WORK`.
-   **strideWORK**: stride length for `WORK`.
-   **offsetWORK**: starting index for `WORK`.
-   **RWORK**: input array `RWORK`.
-   **strideRWORK**: stride length for `RWORK`.
-   **offsetRWORK**: starting index for `RWORK`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `zgerfs()` corresponds to the [LAPACK][lapack] level routine [`zgerfs`][lapack-zgerfs].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var zgerfs = require( '@stdlib/lapack/base/zgerfs' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var AF = discreteUniform( N * N, -10, 10, opts );
var B = discreteUniform( N * N, -10, 10, opts );
var X = discreteUniform( N * N, -10, 10, opts );
var IPIV = discreteUniform( N, -10, 10, opts );
var FERR = discreteUniform( N, -10, 10, opts );
var BERR = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );
var RWORK = discreteUniform( N, -10, 10, opts );

zgerfs.ndarray( 'no-transpose', N, N, A, N, 1, 0, AF, N, 1, 0, IPIV, 1, 0, B, N, 1, 0, X, N, 1, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 );
```

</section>

<!-- /.examples -->

<!-- fortran-docs:start (generated by bin/fortran-docs.mjs from data/lapack-3.12.0/SRC/zgerfs.f; do not edit) -->

<section class="fortran-docs">

## Reference documentation

From the reference LAPACK 3.12.0 source of `ZGERFS`, converted to Markdown with KaTeX math. Indices are the 1-based Fortran indices of the source.

### Purpose

ZGERFS improves the computed solution to a system of linear equations and provides error bounds and backward error estimates for the solution.

### Arguments

#### TRANS `[in]`

_CHARACTER\*1_

Specifies the form of the system of equations:

-   `= 'N'`: $A \, X = B$     (No transpose)
-   `= 'T'`: $A^T \, X = B$  (Transpose)
-   `= 'C'`: $A^H \, X = B$  (Conjugate transpose)

#### N `[in]`

_INTEGER_

The order of the matrix A. $N \ge 0$.

#### NRHS `[in]`

_INTEGER_

The number of right hand sides, i.e., the number of columns of the matrices B and X. $\mathrm{NRHS} \ge 0$.

#### A `[in]`

_COMPLEX\*16 array, dimension (LDA,N)_

The original N-by-N matrix A.

#### LDA `[in]`

_INTEGER_

The leading dimension of the array A. $\mathrm{LDA} \ge \max (1,N)$.

#### AF `[in]`

_COMPLEX\*16 array, dimension (LDAF,N)_

The factors L and U from the factorization $A = P \, L \, U$ as computed by ZGETRF.

#### LDAF `[in]`

_INTEGER_

The leading dimension of the array `AF`. $\mathrm{LDAF} \ge \max (1,N)$.

#### IPIV `[in]`

_INTEGER array, dimension (N)_

The pivot indices from ZGETRF; for $1 \le i \le N$, row i of the matrix was interchanged with row `IPIV(i)`.

#### B `[in]`

_COMPLEX\*16 array, dimension (LDB,NRHS)_

The right hand side matrix B.

#### LDB `[in]`

_INTEGER_

The leading dimension of the array B. $\mathrm{LDB} \ge \max (1,N)$.

#### X `[in,out]`

_COMPLEX\*16 array, dimension (LDX,NRHS)_

On entry, the solution matrix X, as computed by ZGETRS. On exit, the improved solution matrix X.

#### LDX `[in]`

_INTEGER_

The leading dimension of the array X. $\mathrm{LDX} \ge \max (1,N)$.

#### FERR `[out]`

_DOUBLE PRECISION array, dimension (NRHS)_

The estimated forward error bound for each solution vector `X(j)` (the j-th column of the solution matrix X). If XTRUE is the true solution corresponding to `X(j)`, `FERR(j)` is an estimated upper bound for the magnitude of the largest element in (`X(j)` - XTRUE) divided by the magnitude of the largest element in `X(j)`. The estimate is as reliable as the estimate for RCOND, and is almost always a slight overestimate of the true error.

#### BERR `[out]`

_DOUBLE PRECISION array, dimension (NRHS)_

The componentwise relative backward error of each solution vector `X(j)` (i.e., the smallest relative change in any element of A or B that makes `X(j)` an exact solution).

#### WORK `[out]`

_COMPLEX\*16 array, dimension (2\*N)_

#### RWORK `[out]`

_DOUBLE PRECISION array, dimension (N)_

#### INFO `[out]`

_INTEGER_

-   `= 0`: successful exit
-   `< 0`: if `INFO = -i`, the i-th argument had an illegal value

</section>

<!-- fortran-docs:end -->

<!-- Section for related `stdlib` packages. Do not manually edit this section, as it is automatically populated. -->

<section class="related">

</section>

<!-- /.related -->

<!-- Section for all links. Make sure to keep an empty line after the `section` element and another before the `/section` close. -->

<section class="links">

[lapack]: https://www.netlib.org/lapack/explore-html/

[lapack-zgerfs]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__zgerfs.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->