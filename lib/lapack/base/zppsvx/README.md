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

# zppsvx

> Solves a complex Hermitian positive definite system A*X = B where A is in packed storage, with optional equilibration, condition estimation, and error bounds.

<section class="usage">

## Usage

```javascript
var zppsvx = require( '@stdlib/lapack/base/zppsvx' );
```

#### zppsvx( fact, uplo, N, nrhs, AP, AFP, equed, S, strideS, B, LDB, X, LDX, rcond, FERR, strideFERR, BERR, strideBERR, WORK, strideWORK, RWORK, strideRWORK )

Solves a complex Hermitian positive definite system A*X = B where A is in packed storage, with optional equilibration, condition estimation, and error bounds.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Complex128Array = require( '@stdlib/array/complex128' );
var zppsvx = require( '@stdlib/lapack/base/zppsvx' );

var AFP = new Complex128Array( 6 );
var S = new Float64Array( 3 );
var equed = [ 'none' ];
var B = new Complex128Array( new Float64Array( [ 1, 1, 2, -1, 3, 0.5 ] ) );
var X = new Complex128Array( 3 );
var rcond = new Float64Array( 1 );
var FERR = new Float64Array( 1 );
var BERR = new Float64Array( 1 );
var WORK = new Complex128Array( 6 );
var RWORK = new Float64Array( 3 );

zppsvx.ndarray( 'not-factored', 'upper', 3, 1, AP, 1, 0, AFP, 1, 0, equed, S, 1, 0, B, 1, 3, 0, X, 1, 3, 0, rcond, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 );
```

The function has the following parameters:

-   **fact**: `fact`.
-   **uplo**: specifies whether the upper or lower triangular part is referenced.
-   **N**: number of columns.
-   **nrhs**: number of right-hand sides.
-   **AP**: input array `AP`.
-   **AFP**: input array `AFP`.
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

#### zppsvx.ndarray( fact, uplo, N, nrhs, AP, strideAP, offsetAP, AFP, strideAFP, offsetAFP, equed, S, strideS, offsetS, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, rcond, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWORK, offsetWORK, RWORK, strideRWORK, offsetRWORK )

Solves a complex Hermitian positive definite system A*X = B where A is in packed storage, with optional equilibration, condition estimation, and error bounds, using alternative indexing semantics.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Complex128Array = require( '@stdlib/array/complex128' );
var zppsvx = require( '@stdlib/lapack/base/zppsvx' );

var AFP = new Complex128Array( 6 );
var S = new Float64Array( 3 );
var equed = [ 'none' ];
var B = new Complex128Array( new Float64Array( [ 1, 1, 2, -1, 3, 0.5 ] ) );
var X = new Complex128Array( 3 );
var rcond = new Float64Array( 1 );
var FERR = new Float64Array( 1 );
var BERR = new Float64Array( 1 );
var WORK = new Complex128Array( 6 );
var RWORK = new Float64Array( 3 );

zppsvx.ndarray( 'not-factored', 'upper', 3, 1, AP, 1, 0, AFP, 1, 0, equed, S, 1, 0, B, 1, 3, 0, X, 1, 3, 0, rcond, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 );
```

The function has the following additional parameters:

-   **strideAP**: stride length for `AP`.
-   **offsetAP**: starting index for `AP`.
-   **strideAFP**: stride length for `AFP`.
-   **offsetAFP**: starting index for `AFP`.
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

-   `zppsvx()` corresponds to the [LAPACK][lapack] level routine [`zppsvx`][lapack-zppsvx].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Complex128Array = require( '@stdlib/array/complex128' );
var zppsvx = require( '@stdlib/lapack/base/zppsvx' );

var AFP = new Complex128Array( 6 );
var S = new Float64Array( 3 );
var equed = [ 'none' ];
var B = new Complex128Array( new Float64Array( [ 1, 1, 2, -1, 3, 0.5 ] ) );
var X = new Complex128Array( 3 );
var rcond = new Float64Array( 1 );
var FERR = new Float64Array( 1 );
var BERR = new Float64Array( 1 );
var WORK = new Complex128Array( 6 );
var RWORK = new Float64Array( 3 );

zppsvx.ndarray( 'not-factored', 'upper', 3, 1, AP, 1, 0, AFP, 1, 0, equed, S, 1, 0, B, 1, 3, 0, X, 1, 3, 0, rcond, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 );
```

</section>

<!-- /.examples -->

<!-- fortran-docs:start (generated by bin/fortran-docs.mjs from data/lapack-3.12.0/SRC/zppsvx.f; do not edit) -->

<section class="fortran-docs">

## Reference documentation

From the reference LAPACK 3.12.0 source of `ZPPSVX`, converted to Markdown with KaTeX math. Indices are the 1-based Fortran indices of the source.

> Computes the solution to system of linear equations $A \, X = B$ for OTHER matrices

### Purpose

ZPPSVX uses the Cholesky factorization $A = U^H \, U$ or $A = L \, L^H$ to compute the solution to a complex system of linear equations

$$
A \, X = B
$$

where A is an N-by-N Hermitian positive definite matrix stored in packed format and X and B are N-by-`NRHS` matrices.

Error bounds on the solution and a condition estimate are also provided.

### Arguments

#### FACT `[in]`

_CHARACTER\*1_

Specifies whether or not the factored form of the matrix A is supplied on entry, and if not, whether the matrix A should be equilibrated before it is factored.

-   `= 'F'`: On entry, `AFP` contains the factored form of A. If `EQUED = 'Y'`, the matrix A has been equilibrated with scaling factors given by S.  `AP` and `AFP` will not be modified.
-   `= 'N'`: The matrix A will be copied to `AFP` and factored.
-   `= 'E'`: The matrix A will be equilibrated if necessary, then copied to `AFP` and factored.

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

#### AP `[in,out]`

_COMPLEX\*16 array, dimension (N\*(N+1)/2)_

On entry, the upper or lower triangle of the Hermitian matrix A, packed columnwise in a linear array, except if `FACT = 'F'` and `EQUED = 'Y'`, then A must contain the equilibrated matrix $\operatorname{diag}(S) \, A \, \operatorname{diag}(S)$. The j-th column of A is stored in the array `AP` as follows: if `UPLO = 'U'`, `AP(i + (j-1)*j/2) = A(i,j)` for $1 \le i \le j$; if `UPLO = 'L'`, `AP(i + (j-1)*(2n-j)/2) = A(i,j)` for $j \le i \le n$. See below for further details. A is not modified if `FACT = 'F'` or 'N', or if `FACT = 'E'` and `EQUED = 'N'` on exit.

On exit, if `FACT = 'E'` and `EQUED = 'Y'`, A is overwritten by $\operatorname{diag}(S) \, A \, \operatorname{diag}(S)$.

#### AFP `[in,out]`

_COMPLEX\*16 array, dimension (N\*(N+1)/2)_

If `FACT = 'F'`, then `AFP` is an input argument and on entry contains the triangular factor U or L from the Cholesky factorization $A = U^H \, U$ or $A = L \, L^H$, in the same storage format as A. If $\mathrm{EQUED} \ne \text{'N'}$, then `AFP` is the factored form of the equilibrated matrix A.

If `FACT = 'N'`, then `AFP` is an output argument and on exit returns the triangular factor U or L from the Cholesky factorization $A = U^H \, U$ or $A = L \, L^H$ of the original matrix A.

If `FACT = 'E'`, then `AFP` is an output argument and on exit returns the triangular factor U or L from the Cholesky factorization $A = U^H \, U$ or $A = L \, L^H$ of the equilibrated matrix A (see the description of `AP` for the form of the equilibrated matrix).

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

The packed storage scheme is illustrated by the following example when $N = 4$, `UPLO = 'U'`:

Two-dimensional storage of the Hermitian matrix A:

a11 a12 a13 a14

a22 a23 a24 a33 a34 (aij = conjg(aji)) a44

Packed storage of the upper triangle of A:

`AP` = \[ a11, a12, a22, a13, a23, a33, a14, a24, a34, a44 \]

</section>

<!-- fortran-docs:end -->

<!-- Section for related `stdlib` packages. Do not manually edit this section, as it is automatically populated. -->

<section class="related">

</section>

<!-- /.related -->

<!-- Section for all links. Make sure to keep an empty line after the `section` element and another before the `/section` close. -->

<section class="links">

[lapack]: https://www.netlib.org/lapack/explore-html/

[lapack-zppsvx]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__zppsvx.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->