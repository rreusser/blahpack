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

# zhesvx

> Computes the solution to system of linear equations A·X = B for Hermitian matrices.

<section class="usage">

## Usage

```javascript
var zhesvx = require( '@stdlib/lapack/base/zhesvx' );
```

#### zhesvx( fact, uplo, N, nrhs, A, LDA, AF, LDAF, IPIV, strideIPIV, B, LDB, X, LDX, rcond, FERR, strideFERR, BERR, strideBERR, WORK, strideWORK, RWORK, strideRWORK )

Computes the solution to system of linear equations A·X = B for Hermitian matrices.

```javascript
var zhesvx = require( '@stdlib/lapack/base/zhesvx' );

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

zhesvx.ndarray( 'not-factored', 'upper', N, N, A, N, 1, 0, AF, N, 1, 0, IPIV, 1, 0, B, N, 1, 0, X, N, 1, 0, 1.0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 );
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
-   **IPIV**: input array `IPIV`.
-   **strideIPIV**: stride length for `IPIV`.
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

#### zhesvx.ndarray( fact, uplo, N, nrhs, A, strideA1, strideA2, offsetA, AF, strideAF1, strideAF2, offsetAF, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, rcond, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWORK, offsetWORK, RWORK, strideRWORK, offsetRWORK )

Computes the solution to system of linear equations A·X = B for Hermitian matrices, using alternative indexing semantics.

```javascript
var zhesvx = require( '@stdlib/lapack/base/zhesvx' );

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

zhesvx.ndarray( 'not-factored', 'upper', N, N, A, N, 1, 0, AF, N, 1, 0, IPIV, 1, 0, B, N, 1, 0, X, N, 1, 0, 1.0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 );
```

The function has the following additional parameters:

-   **strideA1**: stride of dimension 1 of `A`.
-   **strideA2**: stride of dimension 2 of `A`.
-   **offsetA**: starting index for `A`.
-   **strideAF1**: stride of dimension 1 of `AF`.
-   **strideAF2**: stride of dimension 2 of `AF`.
-   **offsetAF**: starting index for `AF`.
-   **offsetIPIV**: starting index for `IPIV`.
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

-   `zhesvx()` corresponds to the [LAPACK][lapack] level routine [`zhesvx`][lapack-zhesvx].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var zhesvx = require( '@stdlib/lapack/base/zhesvx' );

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

zhesvx.ndarray( 'not-factored', 'upper', N, N, A, N, 1, 0, AF, N, 1, 0, IPIV, 1, 0, B, N, 1, 0, X, N, 1, 0, 1.0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 );
```

</section>

<!-- /.examples -->

<!-- fortran-docs:start (generated by bin/fortran-docs.mjs from data/lapack-3.12.0/SRC/zhesvx.f; do not edit) -->

<section class="fortran-docs">

## Reference documentation

From the reference LAPACK 3.12.0 source of `ZHESVX`, converted to Markdown with KaTeX math. Indices are the 1-based Fortran indices of the source.

> Computes the solution to system of linear equations $A \, X = B$ for HE matrices

### Purpose

ZHESVX uses the diagonal pivoting factorization to compute the solution to a complex system of linear equations $A \, X = B$, where A is an N-by-N Hermitian matrix and X and B are N-by-`NRHS` matrices.

Error bounds on the solution and a condition estimate are also provided.

### Arguments

#### FACT `[in]`

_CHARACTER\*1_

Specifies whether or not the factored form of A has been supplied on entry.

-   `= 'F'`: On entry, `AF` and `IPIV` contain the factored form of A.  A, `AF` and `IPIV` will not be modified.
-   `= 'N'`: The matrix A will be copied to `AF` and factored.

#### UPLO `[in]`

_CHARACTER\*1_

-   `= 'U'`: Upper triangle of A is stored;
-   `= 'L'`: Lower triangle of A is stored.

#### N `[in]`

_INTEGER_

The number of linear equations, i.e., the order of the matrix A. $N \ge 0$.

#### NRHS `[in]`

_INTEGER_

The number of right hand sides, i.e., the number of columns of the matrices B and X. $\mathrm{NRHS} \ge 0$.

#### A `[in]`

_COMPLEX\*16 array, dimension (LDA,N)_

The Hermitian matrix A. If `UPLO = 'U'`, the leading N-by-N upper triangular part of A contains the upper triangular part of the matrix A, and the strictly lower triangular part of A is not referenced. If `UPLO = 'L'`, the leading N-by-N lower triangular part of A contains the lower triangular part of the matrix A, and the strictly upper triangular part of A is not referenced.

#### LDA `[in]`

_INTEGER_

The leading dimension of the array A. $\mathrm{LDA} \ge \max (1,N)$.

#### AF `[in,out]`

_COMPLEX\*16 array, dimension (LDAF,N)_

If `FACT = 'F'`, then `AF` is an input argument and on entry contains the block diagonal matrix D and the multipliers used to obtain the factor U or L from the factorization $A = U \, D \, U^H$ or $A = L \, D \, L^H$ as computed by ZHETRF.

If `FACT = 'N'`, then `AF` is an output argument and on exit returns the block diagonal matrix D and the multipliers used to obtain the factor U or L from the factorization $A = U \, D \, U^H$ or $A = L \, D \, L^H$.

#### LDAF `[in]`

_INTEGER_

The leading dimension of the array `AF`. $\mathrm{LDAF} \ge \max (1,N)$.

#### IPIV `[in,out]`

_INTEGER array, dimension (N)_

If `FACT = 'F'`, then `IPIV` is an input argument and on entry contains details of the interchanges and the block structure of D, as determined by ZHETRF. If $\mathrm{IPIV}(k) > 0$, then rows and columns k and `IPIV(k)` were interchanged and D(k,k) is a 1-by-1 diagonal block. If `UPLO = 'U'` and $\mathrm{IPIV}(k) = \mathrm{IPIV}(k-1) < 0$, then rows and columns k-1 and -`IPIV(k)` were interchanged and D(k-1:k,k-1:k) is a 2-by-2 diagonal block. If `UPLO = 'L'` and $\mathrm{IPIV}(k) = \mathrm{IPIV}(k+1) < 0$, then rows and columns k+1 and -`IPIV(k)` were interchanged and D(k:k+1,k:k+1) is a 2-by-2 diagonal block.

If `FACT = 'N'`, then `IPIV` is an output argument and on exit contains details of the interchanges and the block structure of D, as determined by ZHETRF.

#### B `[in]`

_COMPLEX\*16 array, dimension (LDB,NRHS)_

The N-by-`NRHS` right hand side matrix B.

#### LDB `[in]`

_INTEGER_

The leading dimension of the array B. $\mathrm{LDB} \ge \max (1,N)$.

#### X `[out]`

_COMPLEX\*16 array, dimension (LDX,NRHS)_

If `INFO = 0` or $\mathrm{INFO} = N+1$, the N-by-`NRHS` solution matrix X.

#### LDX `[in]`

_INTEGER_

The leading dimension of the array X. $\mathrm{LDX} \ge \max (1,N)$.

#### RCOND `[out]`

_DOUBLE PRECISION_

The estimate of the reciprocal condition number of the matrix A. If `RCOND` is less than the machine precision (in particular, if `RCOND = 0`), the matrix is singular to working precision. This condition is indicated by a return code of $\mathrm{INFO} > 0$.

#### FERR `[out]`

_DOUBLE PRECISION array, dimension (NRHS)_

The estimated forward error bound for each solution vector `X(j)` (the j-th column of the solution matrix X). If XTRUE is the true solution corresponding to `X(j)`, `FERR(j)` is an estimated upper bound for the magnitude of the largest element in (`X(j)` - XTRUE) divided by the magnitude of the largest element in `X(j)`. The estimate is as reliable as the estimate for `RCOND`, and is almost always a slight overestimate of the true error.

#### BERR `[out]`

_DOUBLE PRECISION array, dimension (NRHS)_

The componentwise relative backward error of each solution vector `X(j)` (i.e., the smallest relative change in any element of A or B that makes `X(j)` an exact solution).

#### WORK `[out]`

_COMPLEX\*16 array, dimension (MAX(1,LWORK))_

On exit, if `INFO = 0`, `WORK(1)` returns the optimal `LWORK`.

#### LWORK `[in]`

_INTEGER_

The length of `WORK`. $\mathrm{LWORK} \ge \max (1,2 \, N)$, and for best performance, when `FACT = 'N'`, $\mathrm{LWORK} \ge \max (1,2 \, N,N \, \mathrm{NB})$, where NB is the optimal blocksize for ZHETRF.

If `LWORK = -1`, then a workspace query is assumed; the routine only calculates the optimal size of the `WORK` array, returns this value as the first entry of the `WORK` array, and no error message related to `LWORK` is issued by XERBLA.

#### RWORK `[out]`

_DOUBLE PRECISION array, dimension (N)_

#### INFO `[out]`

_INTEGER_

-   `= 0`: successful exit
-   `< 0`: if `INFO = -i`, the i-th argument had an illegal value
-   `> 0`: if `INFO = i`, and i is \<= N:  D(i,i) is exactly zero.  The factorization has been completed but the factor D is exactly singular, so the solution and error bounds could not be computed. `RCOND = 0` is returned. = N+1: D is nonsingular, but `RCOND` is less than machine precision, meaning that the matrix is singular to working precision.  Nevertheless, the solution and error bounds are computed because there are a number of situations where the computed solution can be more accurate than the value of `RCOND` would suggest.

</section>

<!-- fortran-docs:end -->

<!-- Section for related `stdlib` packages. Do not manually edit this section, as it is automatically populated. -->

<section class="related">

</section>

<!-- /.related -->

<!-- Section for all links. Make sure to keep an empty line after the `section` element and another before the `/section` close. -->

<section class="links">

[lapack]: https://www.netlib.org/lapack/explore-html/

[lapack-zhesvx]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__zhesvx.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->