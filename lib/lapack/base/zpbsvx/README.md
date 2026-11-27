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

# zpbsvx

> @license Apache-2.0.

<section class="usage">

## Usage

```javascript
var zpbsvx = require( '@stdlib/lapack/base/zpbsvx' );
```

#### zpbsvx( fact, uplo, N, kd, nrhs, AB, LDAB, AFB, LDAFB, equed, S, strideS, B, LDB, X, LDX, rcond, FERR, strideFERR, BERR, strideBERR, WORK, strideWORK, RWORK, strideRWORK )

@license Apache-2.0.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Complex128Array = require( '@stdlib/array/complex128' );
var zpbsvx = require( '@stdlib/lapack/base/zpbsvx' );

var AB = new Complex128Array( [ 0, 0, 4, 0, -1, 0.5, 4, 0, -1, 0.5, 4, 0 ] );
var AFB = new Complex128Array( 6 );
var S = new Float64Array( 3 );
var equed = [ 'none' ];
var B = new Complex128Array( [ 1, 1, 2, -1, 3, 0 ] );
var X = new Complex128Array( 3 );
var rcond = new Float64Array( 1 );
var FERR = new Float64Array( 1 );
var BERR = new Float64Array( 1 );
var WORK = new Complex128Array( 6 );
var RWORK = new Float64Array( 3 );

zpbsvx.ndarray( 'not-factored', 'upper', 3, 1, 1, AB, 1, 2, 0, AFB, 1, 2, 0, equed, S, 1, 0, B, 1, 3, 0, X, 1, 3, 0, rcond, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 );
```

The function has the following parameters:

-   **fact**: `fact`.
-   **uplo**: specifies whether the upper or lower triangular part is referenced.
-   **N**: number of columns.
-   **kd**: `kd`.
-   **nrhs**: number of right-hand sides.
-   **AB**: input array `AB`.
-   **LDAB**: leading dimension of `AB`.
-   **AFB**: input array `AFB`.
-   **LDAFB**: leading dimension of `AFB`.
-   **equed**: `equed`.
-   **S**: input array `S`.
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

#### zpbsvx.ndarray( fact, uplo, N, kd, nrhs, AB, strideAB1, strideAB2, offsetAB, AFB, strideAFB1, strideAFB2, offsetAFB, equed, S, strideS, offsetS, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, rcond, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWORK, offsetWORK, RWORK, strideRWORK, offsetRWORK )

@license Apache-2.0, using alternative indexing semantics.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Complex128Array = require( '@stdlib/array/complex128' );
var zpbsvx = require( '@stdlib/lapack/base/zpbsvx' );

var AB = new Complex128Array( [ 0, 0, 4, 0, -1, 0.5, 4, 0, -1, 0.5, 4, 0 ] );
var AFB = new Complex128Array( 6 );
var S = new Float64Array( 3 );
var equed = [ 'none' ];
var B = new Complex128Array( [ 1, 1, 2, -1, 3, 0 ] );
var X = new Complex128Array( 3 );
var rcond = new Float64Array( 1 );
var FERR = new Float64Array( 1 );
var BERR = new Float64Array( 1 );
var WORK = new Complex128Array( 6 );
var RWORK = new Float64Array( 3 );

zpbsvx.ndarray( 'not-factored', 'upper', 3, 1, 1, AB, 1, 2, 0, AFB, 1, 2, 0, equed, S, 1, 0, B, 1, 3, 0, X, 1, 3, 0, rcond, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 );
```

The function has the following additional parameters:

-   **strideAB1**: stride of dimension 1 of `AB`.
-   **strideAB2**: stride of dimension 2 of `AB`.
-   **offsetAB**: starting index for `AB`.
-   **strideAFB1**: stride of dimension 1 of `AFB`.
-   **strideAFB2**: stride of dimension 2 of `AFB`.
-   **offsetAFB**: starting index for `AFB`.
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

-   `zpbsvx()` corresponds to the [LAPACK][lapack] level routine [`zpbsvx`][lapack-zpbsvx].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Complex128Array = require( '@stdlib/array/complex128' );
var zpbsvx = require( '@stdlib/lapack/base/zpbsvx' );

var AB = new Complex128Array( [ 0, 0, 4, 0, -1, 0.5, 4, 0, -1, 0.5, 4, 0 ] );
var AFB = new Complex128Array( 6 );
var S = new Float64Array( 3 );
var equed = [ 'none' ];
var B = new Complex128Array( [ 1, 1, 2, -1, 3, 0 ] );
var X = new Complex128Array( 3 );
var rcond = new Float64Array( 1 );
var FERR = new Float64Array( 1 );
var BERR = new Float64Array( 1 );
var WORK = new Complex128Array( 6 );
var RWORK = new Float64Array( 3 );

zpbsvx.ndarray( 'not-factored', 'upper', 3, 1, 1, AB, 1, 2, 0, AFB, 1, 2, 0, equed, S, 1, 0, B, 1, 3, 0, X, 1, 3, 0, rcond, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 );
```

</section>

<!-- /.examples -->

<!-- fortran-docs:start (generated by bin/fortran-docs.mjs from data/lapack-3.12.0/SRC/zpbsvx.f; do not edit) -->

<section class="fortran-docs">

## Reference documentation

From the reference LAPACK 3.12.0 source of `ZPBSVX`, converted to Markdown with KaTeX math. Indices are the 1-based Fortran indices of the source.

> Computes the solution to system of linear equations $A \, X = B$ for OTHER matrices

### Purpose

ZPBSVX uses the Cholesky factorization $A = U^H \, U$ or $A = L \, L^H$ to compute the solution to a complex system of linear equations

$$
A \, X = B
$$

where A is an N-by-N Hermitian positive definite band matrix and X and B are N-by-`NRHS` matrices.

Error bounds on the solution and a condition estimate are also provided.

### Arguments

#### FACT `[in]`

_CHARACTER\*1_

Specifies whether or not the factored form of the matrix A is supplied on entry, and if not, whether the matrix A should be equilibrated before it is factored.

-   `= 'F'`: On entry, `AFB` contains the factored form of A. If `EQUED = 'Y'`, the matrix A has been equilibrated with scaling factors given by S.  `AB` and `AFB` will not be modified.
-   `= 'N'`: The matrix A will be copied to `AFB` and factored.
-   `= 'E'`: The matrix A will be equilibrated if necessary, then copied to `AFB` and factored.

#### UPLO `[in]`

_CHARACTER\*1_

-   `= 'U'`: Upper triangle of A is stored;
-   `= 'L'`: Lower triangle of A is stored.

#### N `[in]`

_INTEGER_

The number of linear equations, i.e., the order of the matrix A. $N \ge 0$.

#### KD `[in]`

_INTEGER_

The number of superdiagonals of the matrix A if `UPLO = 'U'`, or the number of subdiagonals if `UPLO = 'L'`. $\mathrm{KD} \ge 0$.

#### NRHS `[in]`

_INTEGER_

The number of right-hand sides, i.e., the number of columns of the matrices B and X. $\mathrm{NRHS} \ge 0$.

#### AB `[in,out]`

_COMPLEX\*16 array, dimension (LDAB,N)_

On entry, the upper or lower triangle of the Hermitian band matrix A, stored in the first `KD`+1 rows of the array, except if `FACT = 'F'` and `EQUED = 'Y'`, then A must contain the equilibrated matrix $\operatorname{diag}(S) \, A \, \operatorname{diag}(S)$. The j-th column of A is stored in the j-th column of the array `AB` as follows: if `UPLO = 'U'`, `AB(KD+1+i-j,j) = A(i,j)` for $\max (1,j-\mathrm{KD}) \le i \le j$; if `UPLO = 'L'`, `AB(1+i-j,j) = A(i,j)` for $j \le i \le \min (N,j+\mathrm{KD})$. See below for further details.

On exit, if `FACT = 'E'` and `EQUED = 'Y'`, A is overwritten by $\operatorname{diag}(S) \, A \, \operatorname{diag}(S)$.

#### LDAB `[in]`

_INTEGER_

The leading dimension of the array A. $\mathrm{LDAB} \ge \mathrm{KD}+1$.

#### AFB `[in,out]`

_COMPLEX\*16 array, dimension (LDAFB,N)_

If `FACT = 'F'`, then `AFB` is an input argument and on entry contains the triangular factor U or L from the Cholesky factorization $A = U^H \, U$ or $A = L \, L^H$ of the band matrix A, in the same storage format as A (see `AB`). If `EQUED = 'Y'`, then `AFB` is the factored form of the equilibrated matrix A.

If `FACT = 'N'`, then `AFB` is an output argument and on exit returns the triangular factor U or L from the Cholesky factorization $A = U^H \, U$ or $A = L \, L^H$.

If `FACT = 'E'`, then `AFB` is an output argument and on exit returns the triangular factor U or L from the Cholesky factorization $A = U^H \, U$ or $A = L \, L^H$ of the equilibrated matrix A (see the description of A for the form of the equilibrated matrix).

#### LDAFB `[in]`

_INTEGER_

The leading dimension of the array `AFB`. $\mathrm{LDAFB} \ge \mathrm{KD}+1$.

#### EQUED `[in,out]`

_CHARACTER\*1_

Specifies the form of equilibration that was done.

-   `= 'N'`: No equilibration (always true if `FACT = 'N'`).
-   `= 'Y'`: Equilibration was done, i.e., A has been replaced by $\operatorname{diag}(S) \, A \, \operatorname{diag}(S)$. `EQUED` is an input argument if `FACT = 'F'`; otherwise, it is an output argument.

#### S `[in,out]`

_DOUBLE PRECISION array, dimension (N)_

The scale factors for A; not accessed if `EQUED = 'N'`. S is an input argument if `FACT = 'F'`; otherwise, S is an output argument. If `FACT = 'F'` and `EQUED = 'Y'`, each element of S must be positive.

#### B `[in,out]`

_COMPLEX\*16 array, dimension (LDB,NRHS)_

On entry, the N-by-`NRHS` right hand side matrix B. On exit, if `EQUED = 'N'`, B is not modified; if `EQUED = 'Y'`, B is overwritten by $\operatorname{diag}(S) \, B$.

#### LDB `[in]`

_INTEGER_

The leading dimension of the array B. $\mathrm{LDB} \ge \max (1,N)$.

#### X `[out]`

_COMPLEX\*16 array, dimension (LDX,NRHS)_

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

_COMPLEX\*16 array, dimension (2\*N)_

#### RWORK `[out]`

_DOUBLE PRECISION array, dimension (N)_

#### INFO `[out]`

_INTEGER_

-   `= 0`: successful exit
-   `< 0`: if `INFO = -i`, the i-th argument had an illegal value
-   `> 0`: if `INFO = i`, and i is \<= N:  the leading principal minor of order i of A is not positive, so the factorization could not be completed, and the solution has not been computed. `RCOND = 0` is returned. = N+1: U is nonsingular, but `RCOND` is less than machine precision, meaning that the matrix is singular to working precision.  Nevertheless, the solution and error bounds are computed because there are a number of situations where the computed solution can be more accurate than the value of `RCOND` would suggest.

### Further Details

The band storage scheme is illustrated by the following example, when $N = 6$, `KD = 2`, and `UPLO = 'U'`:

Two-dimensional storage of the Hermitian matrix A:

a11 a12 a13

a22 a23 a24 a33 a34 a35 a44 a45 a46 a55 a56

(aij=conjg(aji)) a66

Band storage of the upper triangle of A:

\* \* a13 a24 a35 $a_{46} \, a_{12}$ a23 a34 a45 a56 a11 a22 a33 a44 a55 a66

Similarly, if `UPLO = 'L'` the format of A is as follows:

a11 a22 a33 a44 a55 a66 a21 a32 a43 a54 $a_{65} \, a_{31}$ a42 a53 a64 \* \*

Array elements marked \* are not used by the routine.

</section>

<!-- fortran-docs:end -->

<!-- Section for related `stdlib` packages. Do not manually edit this section, as it is automatically populated. -->

<section class="related">

</section>

<!-- /.related -->

<!-- Section for all links. Make sure to keep an empty line after the `section` element and another before the `/section` close. -->

<section class="links">

[lapack]: https://www.netlib.org/lapack/explore-html/

[lapack-zpbsvx]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__zpbsvx.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->