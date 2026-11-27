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

# dposvx

> Computes the solution to system of linear equations A·X = B for positive definite matrices.

<section class="usage">

## Usage

```javascript
var Float64Array = require( '@stdlib/array/float64' );

var A = new Float64Array( [ 4.0, 2.0, 0.0, 2.0, 5.0, 1.0, 0.0, 1.0, 3.0 ] );
var AF = new Float64Array( 9 );
var B = new Float64Array( [ 6.0, 8.0, 4.0 ] );
var X = new Float64Array( 3 );
var s = new Float64Array( 3 );
var rcond = new Float64Array( 1 );
var FERR = new Float64Array( 1 );
var BERR = new Float64Array( 1 );

var out = dposvx( 'column-major', 'not-factored', 'upper', 3, 1, A, 3, AF, 3, 'none', s, 1, B, 3, X, 3, rcond, FERR, 1, BERR, 1, null, null );
// returns { 'info': 0, 'equed': 'none', 'rcond': 0.25 }
// X => <Float64Array>[ 1.0, 1.0, 1.0 ]
```

#### dposvx( order, fact, uplo, N, nrhs, A, LDA, AF, LDAF, equed, s, strideS, B, LDB, X, LDX, rcond, FERR, strideFERR, BERR, strideBERR, WORK, IWORK )

Computes the solution to system of linear equations A·X = B for positive definite matrices.

```javascript
var dposvx = require( '@stdlib/lapack/base/dposvx' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var AF = discreteUniform( N * N, -10, 10, opts );
var B = discreteUniform( N * N, -10, 10, opts );
var X = discreteUniform( N * N, -10, 10, opts );
var s = discreteUniform( N, -10, 10, opts );
var FERR = discreteUniform( N, -10, 10, opts );
var BERR = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );
var IWORK = discreteUniform( N, -10, 10, opts );

dposvx.ndarray( 'not-factored', 'upper', N, N, A, N, 1, 0, AF, N, 1, 0, 'none', s, 1, 0, B, N, 1, 0, X, N, 1, 0, 1.0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, IWORK, 1, 0 );
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **fact**: `'not-factored'`, `'equilibrate'`, or `'factored'`.
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
-   **rcond**: output [`Float64Array`][mdn-float64array]; on return, `rcond[0]` is the reciprocal condition number estimate.
-   **FERR**: input array `FERR`.
-   **strideFERR**: stride length for `FERR`.
-   **BERR**: input array `BERR`.
-   **strideBERR**: stride length for `BERR`.
-   **WORK**: workspace of length at least `3*N`, or `null` to allocate internally.
-   **IWORK**: integer workspace of length at least `N`, or `null` to allocate internally.

The function returns an object with properties `info`, `equed`, and `rcond`.

#### dposvx.ndarray( fact, uplo, N, nrhs, A, strideA1, strideA2, offsetA, AF, strideAF1, strideAF2, offsetAF, equed, s, strideS, offsetS, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, rcond, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWORK, offsetWORK, IWORK, strideIWORK, offsetIWORK )

Computes the solution to system of linear equations A·X = B for positive definite matrices, using alternative indexing semantics.

```javascript
var dposvx = require( '@stdlib/lapack/base/dposvx' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var AF = discreteUniform( N * N, -10, 10, opts );
var B = discreteUniform( N * N, -10, 10, opts );
var X = discreteUniform( N * N, -10, 10, opts );
var s = discreteUniform( N, -10, 10, opts );
var FERR = discreteUniform( N, -10, 10, opts );
var BERR = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );
var IWORK = discreteUniform( N, -10, 10, opts );

dposvx.ndarray( 'not-factored', 'upper', N, N, A, N, 1, 0, AF, N, 1, 0, 'none', s, 1, 0, B, N, 1, 0, X, N, 1, 0, 1.0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, IWORK, 1, 0 );
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
-   **rcond**: `rcond`.
-   **offsetFERR**: starting index for `FERR`.
-   **offsetBERR**: starting index for `BERR`.
-   **offsetWORK**: starting index for `WORK`.
-   **offsetIWORK**: starting index for `IWORK`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `dposvx()` corresponds to the [LAPACK][lapack] level routine [`dposvx`][lapack-dposvx].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var dposvx = require( '@stdlib/lapack/base/dposvx' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var AF = discreteUniform( N * N, -10, 10, opts );
var B = discreteUniform( N * N, -10, 10, opts );
var X = discreteUniform( N * N, -10, 10, opts );
var s = discreteUniform( N, -10, 10, opts );
var FERR = discreteUniform( N, -10, 10, opts );
var BERR = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );
var IWORK = discreteUniform( N, -10, 10, opts );

dposvx.ndarray( 'not-factored', 'upper', N, N, A, N, 1, 0, AF, N, 1, 0, 'none', s, 1, 0, B, N, 1, 0, X, N, 1, 0, 1.0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, IWORK, 1, 0 );
```

</section>

<!-- /.examples -->

<!-- fortran-docs:start (generated by bin/fortran-docs.mjs from data/lapack-3.12.0/SRC/dposvx.f; do not edit) -->

<section class="fortran-docs">

## Reference documentation

From the reference LAPACK 3.12.0 source of `DPOSVX`, converted to Markdown with KaTeX math. Indices are the 1-based Fortran indices of the source.

> Computes the solution to system of linear equations $A \, X = B$ for PO matrices

### Purpose

DPOSVX uses the Cholesky factorization $A = U^T \, U$ or $A = L \, L^T$ to compute the solution to a real system of linear equations

$$
A \, X = B
$$

where A is an N-by-N symmetric positive definite matrix and X and B are N-by-`NRHS` matrices.

Error bounds on the solution and a condition estimate are also provided.

### Arguments

#### FACT `[in]`

_CHARACTER\*1_

Specifies whether or not the factored form of the matrix A is supplied on entry, and if not, whether the matrix A should be equilibrated before it is factored.

-   `= 'F'`: On entry, `AF` contains the factored form of A. If `EQUED = 'Y'`, the matrix A has been equilibrated with scaling factors given by S.  A and `AF` will not be modified.
-   `= 'N'`: The matrix A will be copied to `AF` and factored.
-   `= 'E'`: The matrix A will be equilibrated if necessary, then copied to `AF` and factored.

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

#### A `[in,out]`

_DOUBLE PRECISION array, dimension (LDA,N)_

On entry, the symmetric matrix A, except if `FACT = 'F'` and `EQUED = 'Y'`, then A must contain the equilibrated matrix $\operatorname{diag}(S) \, A \, \operatorname{diag}(S)$. If `UPLO = 'U'`, the leading N-by-N upper triangular part of A contains the upper triangular part of the matrix A, and the strictly lower triangular part of A is not referenced. If `UPLO = 'L'`, the leading N-by-N lower triangular part of A contains the lower triangular part of the matrix A, and the strictly upper triangular part of A is not referenced. A is not modified if `FACT = 'F'` or 'N', or if `FACT = 'E'` and `EQUED = 'N'` on exit.

On exit, if `FACT = 'E'` and `EQUED = 'Y'`, A is overwritten by $\operatorname{diag}(S) \, A \, \operatorname{diag}(S)$.

#### LDA `[in]`

_INTEGER_

The leading dimension of the array A. $\mathrm{LDA} \ge \max (1,N)$.

#### AF `[in,out]`

_DOUBLE PRECISION array, dimension (LDAF,N)_

If `FACT = 'F'`, then `AF` is an input argument and on entry contains the triangular factor U or L from the Cholesky factorization $A = U^T \, U$ or $A = L \, L^T$, in the same storage format as A. If $\mathrm{EQUED} \ne \text{'N'}$, then `AF` is the factored form of the equilibrated matrix $\operatorname{diag}(S) \, A \, \operatorname{diag}(S)$.

If `FACT = 'N'`, then `AF` is an output argument and on exit returns the triangular factor U or L from the Cholesky factorization $A = U^T \, U$ or $A = L \, L^T$ of the original matrix A.

If `FACT = 'E'`, then `AF` is an output argument and on exit returns the triangular factor U or L from the Cholesky factorization $A = U^T \, U$ or $A = L \, L^T$ of the equilibrated matrix A (see the description of A for the form of the equilibrated matrix).

#### LDAF `[in]`

_INTEGER_

The leading dimension of the array `AF`. $\mathrm{LDAF} \ge \max (1,N)$.

#### EQUED `[in,out]`

_CHARACTER\*1_

Specifies the form of equilibration that was done.

-   `= 'N'`: No equilibration (always true if `FACT = 'N'`).
-   `= 'Y'`: Equilibration was done, i.e., A has been replaced by $\operatorname{diag}(S) \, A \, \operatorname{diag}(S)$. `EQUED` is an input argument if `FACT = 'F'`; otherwise, it is an output argument.

#### S `[in,out]`

_DOUBLE PRECISION array, dimension (N)_

The scale factors for A; not accessed if `EQUED = 'N'`. S is an input argument if `FACT = 'F'`; otherwise, S is an output argument. If `FACT = 'F'` and `EQUED = 'Y'`, each element of S must be positive.

#### B `[in,out]`

_DOUBLE PRECISION array, dimension (LDB,NRHS)_

On entry, the N-by-`NRHS` right hand side matrix B. On exit, if `EQUED = 'N'`, B is not modified; if `EQUED = 'Y'`, B is overwritten by $\operatorname{diag}(S) \, B$.

#### LDB `[in]`

_INTEGER_

The leading dimension of the array B. $\mathrm{LDB} \ge \max (1,N)$.

#### X `[out]`

_DOUBLE PRECISION array, dimension (LDX,NRHS)_

If `INFO = 0` or $\mathrm{INFO} = N+1$, the N-by-`NRHS` solution matrix X to the original system of equations. Note that if `EQUED = 'Y'`, A and B are modified on exit, and the solution to the equilibrated system is $\operatorname{inv}(\operatorname{diag}(S)) \, X$.

#### LDX `[in]`

_INTEGER_

The leading dimension of the array X. $\mathrm{LDX} \ge \max (1,N)$.

#### RCOND `[out]`

_DOUBLE PRECISION_

The estimate of the reciprocal condition number of the matrix A after equilibration (if done). If `RCOND` is less than the machine precision (in particular, if `RCOND = 0`), the matrix is singular to working precision. This condition is indicated by a return code of $\mathrm{INFO} > 0$.

#### FERR `[out]`

_DOUBLE PRECISION array, dimension (NRHS)_

The estimated forward error bound for each solution vector `X(j)` (the j-th column of the solution matrix X). If XTRUE is the true solution corresponding to `X(j)`, `FERR(j)` is an estimated upper bound for the magnitude of the largest element in (`X(j)` - XTRUE) divided by the magnitude of the largest element in `X(j)`. The estimate is as reliable as the estimate for `RCOND`, and is almost always a slight overestimate of the true error.

#### BERR `[out]`

_DOUBLE PRECISION array, dimension (NRHS)_

The componentwise relative backward error of each solution vector `X(j)` (i.e., the smallest relative change in any element of A or B that makes `X(j)` an exact solution).

#### WORK `[out]`

_DOUBLE PRECISION array, dimension (3\*N)_

#### IWORK `[out]`

_INTEGER array, dimension (N)_

#### INFO `[out]`

_INTEGER_

-   `= 0`: successful exit
-   `< 0`: if `INFO = -i`, the i-th argument had an illegal value
-   `> 0`: if `INFO = i`, and i is \<= N:  the leading principal minor of order i of A is not positive, so the factorization could not be completed, and the solution has not been computed. `RCOND = 0` is returned. = N+1: U is nonsingular, but `RCOND` is less than machine precision, meaning that the matrix is singular to working precision.  Nevertheless, the solution and error bounds are computed because there are a number of situations where the computed solution can be more accurate than the value of `RCOND` would suggest.

</section>

<!-- fortran-docs:end -->

<!-- Section for related `stdlib` packages. Do not manually edit this section, as it is automatically populated. -->

<section class="related">

</section>

<!-- /.related -->

<!-- Section for all links. Make sure to keep an empty line after the `section` element and another before the `/section` close. -->

<section class="links">

[lapack]: https://www.netlib.org/lapack/explore-html/

[lapack-dposvx]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__dposvx.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->