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

# zgbsvx

> Computes the solution to system of linear equations A·X = B for general band matrices.

<section class="usage">

## Usage

```javascript
var zgbsvx = require( '@stdlib/lapack/base/zgbsvx' );
```

#### zgbsvx( fact, trans, N, kl, ku, nrhs, AB, LDAB, AFB, LDAFB, IPIV, strideIPIV, equed, r, strideR, c, strideC, B, LDB, X, LDX, FERR, strideFERR, BERR, strideBERR, WORK, strideWORK, RWORK, strideRWORK )

Computes the solution to system of linear equations A·X = B for general band matrices.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Complex128Array = require( '@stdlib/array/complex128' );
var Int32Array = require( '@stdlib/array/int32' );
var zgbsvx = require( '@stdlib/lapack/base/zgbsvx' );

var N = 3;
var KL = 1;
var KU = 1;
var nrhs = 1;
var nRows = KL + KU + 1;
var AFB = new Complex128Array( ((2 * KL) + KU + 1) * N );
var IPIV = new Int32Array( N );
var r = new Float64Array( N );
var c = new Float64Array( N );
var B = new Complex128Array( [ 5, 0, 5, 0, 3, 0 ] );
var X = new Complex128Array( N );
var FERR = new Float64Array( nrhs );
var BERR = new Float64Array( nrhs );
var WORK = new Complex128Array( 2 * N );
var RWORK = new Float64Array( N );

zgbsvx.ndarray( 'not-factored', 'no-transpose', N, KL, KU, nrhs, AB, 1, nRows, 0, AFB, 1, (2 * KL) + KU + 1, 0, IPIV, 1, 0, 'none', r, 1, 0, c, 1, 0, B, 1, N, 0, X, 1, N, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 );
```

The function has the following parameters:

-   **fact**: `fact`.
-   **trans**: specifies whether the matrix should be transposed.
-   **N**: number of columns.
-   **kl**: number of subdiagonals.
-   **ku**: number of superdiagonals.
-   **nrhs**: number of right-hand sides.
-   **AB**: input array `AB`.
-   **LDAB**: leading dimension of `AB`.
-   **AFB**: input array `AFB`.
-   **LDAFB**: leading dimension of `AFB`.
-   **IPIV**: input array `IPIV`.
-   **strideIPIV**: stride length for `IPIV`.
-   **equed**: `equed`.
-   **r**: `r`.
-   **strideR**: stride length for `R`.
-   **c**: `c`.
-   **strideC**: stride length for `C`.
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
-   **RWORK**: input array `RWORK`.
-   **strideRWORK**: stride length for `RWORK`.

#### zgbsvx.ndarray( fact, trans, N, kl, ku, nrhs, AB, strideAB1, strideAB2, offsetAB, AFB, strideAFB1, strideAFB2, offsetAFB, IPIV, strideIPIV, offsetIPIV, equed, r, strideR, offsetR, c, strideC, offsetC, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWORK, offsetWORK, RWORK, strideRWORK, offsetRWORK )

Computes the solution to system of linear equations A·X = B for general band matrices, using alternative indexing semantics.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Complex128Array = require( '@stdlib/array/complex128' );
var Int32Array = require( '@stdlib/array/int32' );
var zgbsvx = require( '@stdlib/lapack/base/zgbsvx' );

var N = 3;
var KL = 1;
var KU = 1;
var nrhs = 1;
var nRows = KL + KU + 1;
var AFB = new Complex128Array( ((2 * KL) + KU + 1) * N );
var IPIV = new Int32Array( N );
var r = new Float64Array( N );
var c = new Float64Array( N );
var B = new Complex128Array( [ 5, 0, 5, 0, 3, 0 ] );
var X = new Complex128Array( N );
var FERR = new Float64Array( nrhs );
var BERR = new Float64Array( nrhs );
var WORK = new Complex128Array( 2 * N );
var RWORK = new Float64Array( N );

zgbsvx.ndarray( 'not-factored', 'no-transpose', N, KL, KU, nrhs, AB, 1, nRows, 0, AFB, 1, (2 * KL) + KU + 1, 0, IPIV, 1, 0, 'none', r, 1, 0, c, 1, 0, B, 1, N, 0, X, 1, N, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 );
```

The function has the following additional parameters:

-   **strideAB1**: stride of dimension 1 of `AB`.
-   **strideAB2**: stride of dimension 2 of `AB`.
-   **offsetAB**: starting index for `AB`.
-   **strideAFB1**: stride of dimension 1 of `AFB`.
-   **strideAFB2**: stride of dimension 2 of `AFB`.
-   **offsetAFB**: starting index for `AFB`.
-   **offsetIPIV**: starting index for `IPIV`.
-   **offsetR**: starting index for `R`.
-   **offsetC**: starting index for `C`.
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

-   `zgbsvx()` corresponds to the [LAPACK][lapack] level routine [`zgbsvx`][lapack-zgbsvx].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Complex128Array = require( '@stdlib/array/complex128' );
var Int32Array = require( '@stdlib/array/int32' );
var zgbsvx = require( '@stdlib/lapack/base/zgbsvx' );

var N = 3;
var KL = 1;
var KU = 1;
var nrhs = 1;
var nRows = KL + KU + 1;
var AFB = new Complex128Array( ((2 * KL) + KU + 1) * N );
var IPIV = new Int32Array( N );
var r = new Float64Array( N );
var c = new Float64Array( N );
var B = new Complex128Array( [ 5, 0, 5, 0, 3, 0 ] );
var X = new Complex128Array( N );
var FERR = new Float64Array( nrhs );
var BERR = new Float64Array( nrhs );
var WORK = new Complex128Array( 2 * N );
var RWORK = new Float64Array( N );

zgbsvx.ndarray( 'not-factored', 'no-transpose', N, KL, KU, nrhs, AB, 1, nRows, 0, AFB, 1, (2 * KL) + KU + 1, 0, IPIV, 1, 0, 'none', r, 1, 0, c, 1, 0, B, 1, N, 0, X, 1, N, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 );
```

</section>

<!-- /.examples -->

<!-- fortran-docs:start (generated by bin/fortran-docs.mjs from data/lapack-3.12.0/SRC/zgbsvx.f; do not edit) -->

<section class="fortran-docs">

## Reference documentation

From the reference LAPACK 3.12.0 source of `ZGBSVX`, converted to Markdown with KaTeX math. Indices are the 1-based Fortran indices of the source.

> Computes the solution to system of linear equations $A \, X = B$ for GB matrices

### Purpose

ZGBSVX uses the LU factorization to compute the solution to a complex system of linear equations $A \, X = B$, $A^T \, X = B$, or $A^H \, X = B$, where A is a band matrix of order N with `KL` subdiagonals and `KU` superdiagonals, and X and B are N-by-`NRHS` matrices.

Error bounds on the solution and a condition estimate are also provided.

### Arguments

#### FACT `[in]`

_CHARACTER\*1_

Specifies whether or not the factored form of the matrix A is supplied on entry, and if not, whether the matrix A should be equilibrated before it is factored.

-   `= 'F'`: On entry, `AFB` and `IPIV` contain the factored form of A.  If `EQUED` is not 'N', the matrix A has been equilibrated with scaling factors given by R and C. `AB`, `AFB`, and `IPIV` are not modified.
-   `= 'N'`: The matrix A will be copied to `AFB` and factored.
-   `= 'E'`: The matrix A will be equilibrated if necessary, then copied to `AFB` and factored.

#### TRANS `[in]`

_CHARACTER\*1_

Specifies the form of the system of equations.

-   `= 'N'`: $A \, X = B$     (No transpose)
-   `= 'T'`: $A^T \, X = B$  (Transpose)
-   `= 'C'`: $A^H \, X = B$  (Conjugate transpose)

#### N `[in]`

_INTEGER_

The number of linear equations, i.e., the order of the matrix A. $N \ge 0$.

#### KL `[in]`

_INTEGER_

The number of subdiagonals within the band of A. $\mathrm{KL} \ge 0$.

#### KU `[in]`

_INTEGER_

The number of superdiagonals within the band of A. $\mathrm{KU} \ge 0$.

#### NRHS `[in]`

_INTEGER_

The number of right hand sides, i.e., the number of columns of the matrices B and X. $\mathrm{NRHS} \ge 0$.

#### AB `[in,out]`

_COMPLEX\*16 array, dimension (LDAB,N)_

On entry, the matrix A in band storage, in rows 1 to `KL`+`KU`+1. The j-th column of A is stored in the j-th column of the array `AB` as follows: `AB(KU+1+i-j,j) = A(i,j)` for $\max (1,j-\mathrm{KU}) \le i \le \min (N,j+\mathrm{kl})$

If `FACT = 'F'` and `EQUED` is not 'N', then A must have been equilibrated by the scaling factors in R and/or C. `AB` is not modified if `FACT = 'F'` or 'N', or if `FACT = 'E'` and `EQUED = 'N'` on exit.

On exit, if $\mathrm{EQUED} \ne \text{'N'}$, A is scaled as follows: `EQUED = 'R'`: A := $\operatorname{diag}(R) \, A$ `EQUED = 'C'`: A := $A \, \operatorname{diag}(C)$ `EQUED = 'B'`: A := $\operatorname{diag}(R) \, A \, \operatorname{diag}(C)$.

#### LDAB `[in]`

_INTEGER_

The leading dimension of the array `AB`. $\mathrm{LDAB} \ge \mathrm{KL}+\mathrm{KU}+1$.

#### AFB `[in,out]`

_COMPLEX\*16 array, dimension (LDAFB,N)_

If `FACT = 'F'`, then `AFB` is an input argument and on entry contains details of the LU factorization of the band matrix A, as computed by ZGBTRF. U is stored as an upper triangular band matrix with `KL`+`KU` superdiagonals in rows 1 to `KL`+`KU`+1, and the multipliers used during the factorization are stored in rows `KL`+`KU`+2 to $2 \, \mathrm{KL}+\mathrm{KU}+1$. If $\mathrm{EQUED} \ne \text{'N'}$, then `AFB` is the factored form of the equilibrated matrix A.

If `FACT = 'N'`, then `AFB` is an output argument and on exit returns details of the LU factorization of A.

If `FACT = 'E'`, then `AFB` is an output argument and on exit returns details of the LU factorization of the equilibrated matrix A (see the description of `AB` for the form of the equilibrated matrix).

#### LDAFB `[in]`

_INTEGER_

The leading dimension of the array `AFB`. $\mathrm{LDAFB} \ge 2 \, \mathrm{KL}+\mathrm{KU}+1$.

#### IPIV `[in,out]`

_INTEGER array, dimension (N)_

If `FACT = 'F'`, then `IPIV` is an input argument and on entry contains the pivot indices from the factorization $A = L \, U$ as computed by ZGBTRF; row i of the matrix was interchanged with row `IPIV(i)`.

If `FACT = 'N'`, then `IPIV` is an output argument and on exit contains the pivot indices from the factorization $A = L \, U$ of the original matrix A.

If `FACT = 'E'`, then `IPIV` is an output argument and on exit contains the pivot indices from the factorization $A = L \, U$ of the equilibrated matrix A.

#### EQUED `[in,out]`

_CHARACTER\*1_

Specifies the form of equilibration that was done.

-   `= 'N'`: No equilibration (always true if `FACT = 'N'`).
-   `= 'R'`: Row equilibration, i.e., A has been premultiplied by diag(R).
-   `= 'C'`: Column equilibration, i.e., A has been postmultiplied by diag(C).
-   `= 'B'`: Both row and column equilibration, i.e., A has been replaced by $\operatorname{diag}(R) \, A \, \operatorname{diag}(C)$. `EQUED` is an input argument if `FACT = 'F'`; otherwise, it is an output argument.

#### R `[in,out]`

_DOUBLE PRECISION array, dimension (N)_

The row scale factors for A. If `EQUED = 'R'` or 'B', A is multiplied on the left by diag(R); if `EQUED = 'N'` or 'C', R is not accessed. R is an input argument if `FACT = 'F'`; otherwise, R is an output argument. If `FACT = 'F'` and `EQUED = 'R'` or 'B', each element of R must be positive.

#### C `[in,out]`

_DOUBLE PRECISION array, dimension (N)_

The column scale factors for A. If `EQUED = 'C'` or 'B', A is multiplied on the right by diag(C); if `EQUED = 'N'` or 'R', C is not accessed. C is an input argument if `FACT = 'F'`; otherwise, C is an output argument. If `FACT = 'F'` and `EQUED = 'C'` or 'B', each element of C must be positive.

#### B `[in,out]`

_COMPLEX\*16 array, dimension (LDB,NRHS)_

On entry, the right hand side matrix B. On exit, if `EQUED = 'N'`, B is not modified; if `TRANS = 'N'` and `EQUED = 'R'` or 'B', B is overwritten by $\operatorname{diag}(R) \, B$; if `TRANS = 'T'` or 'C' and `EQUED = 'C'` or 'B', B is overwritten by $\operatorname{diag}(C) \, B$.

#### LDB `[in]`

_INTEGER_

The leading dimension of the array B. $\mathrm{LDB} \ge \max (1,N)$.

#### X `[out]`

_COMPLEX\*16 array, dimension (LDX,NRHS)_

If `INFO = 0` or $\mathrm{INFO} = N+1$, the N-by-`NRHS` solution matrix X to the original system of equations. Note that A and B are modified on exit if $\mathrm{EQUED} \ne \text{'N'}$, and the solution to the equilibrated system is $\operatorname{inv}(\operatorname{diag}(C)) \, X$ if `TRANS = 'N'` and `EQUED = 'C'` or 'B', or $\operatorname{inv}(\operatorname{diag}(R)) \, X$ if `TRANS = 'T'` or 'C' and `EQUED = 'R'` or 'B'.

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

_DOUBLE PRECISION array, dimension (MAX(1,N))_

On exit, `RWORK(1)` contains the reciprocal pivot growth factor norm(A)/norm(U). The "max absolute element" norm is used. If `RWORK(1)` is much less than 1, then the stability of the LU factorization of the (equilibrated) matrix A could be poor. This also means that the solution X, condition estimator `RCOND`, and forward error bound `FERR` could be unreliable. If factorization fails with $0<\mathrm{INFO} \le N$, then `RWORK(1)` contains the reciprocal pivot growth factor for the leading `INFO` columns of A.

#### INFO `[out]`

_INTEGER_

-   `= 0`: successful exit
-   `< 0`: if `INFO = -i`, the i-th argument had an illegal value
-   `> 0`: if `INFO = i`, and i is \<= N:  U(i,i) is exactly zero.  The factorization has been completed, but the factor U is exactly singular, so the solution and error bounds could not be computed. `RCOND = 0` is returned. = N+1: U is nonsingular, but `RCOND` is less than machine precision, meaning that the matrix is singular to working precision.  Nevertheless, the solution and error bounds are computed because there are a number of situations where the computed solution can be more accurate than the value of `RCOND` would suggest.

</section>

<!-- fortran-docs:end -->

<!-- Section for related `stdlib` packages. Do not manually edit this section, as it is automatically populated. -->

<section class="related">

</section>

<!-- /.related -->

<!-- Section for all links. Make sure to keep an empty line after the `section` element and another before the `/section` close. -->

<section class="links">

[lapack]: https://www.netlib.org/lapack/explore-html/

[lapack-zgbsvx]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__zgbsvx.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->