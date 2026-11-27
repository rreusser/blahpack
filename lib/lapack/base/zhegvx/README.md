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

# zhegvx

> Computes selected eigenvalues, and optionally, eigenvectors of a complex generalized Hermitian-definite eigenproblem, of the form A·x=λ·B·x, A·Bx=λ·x, or B·A·x=λ·x.

<section class="usage">

## Usage

```javascript
var zhegvx = require( '@stdlib/lapack/base/zhegvx' );
```

#### zhegvx( itype, jobz, range, uplo, N, A, LDA, B, LDB, vl, vu, il, iu, abstol, out, w, strideW, Z, LDZ, WORK, strideWORK, lwork, RWORK, strideRWORK, IWORK, strideIWORK, IFAIL, strideIFAIL )

Computes selected eigenvalues, and optionally, eigenvectors of a complex generalized Hermitian-definite eigenproblem, of the form A·x=λ·B·x, A·Bx=λ·x, or B·A·x=λ·x.

```javascript
var zhegvx = require( '@stdlib/lapack/base/zhegvx' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var B = discreteUniform( N * N, -10, 10, opts );
var Z = discreteUniform( N * N, -10, 10, opts );
var w = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );
var RWORK = discreteUniform( N, -10, 10, opts );
var IWORK = discreteUniform( N, -10, 10, opts );
var IFAIL = discreteUniform( N, -10, 10, opts );

zhegvx.ndarray( N, 'compute-vectors', 'all', 'upper', N, A, N, 1, 0, B, N, 1, 0, 1.0, 1.0, N, N, 1.0, 1, w, 1, 0, Z, N, 1, 0, WORK, 1, 0, N, RWORK, 1, 0, IWORK, 1, 0, IFAIL, 1, 0 );
```

The function has the following parameters:

-   **itype**: `itype`.
-   **jobz**: `jobz`.
-   **range**: `range`.
-   **uplo**: specifies whether the upper or lower triangular part is referenced.
-   **N**: number of columns.
-   **A**: input array `A`.
-   **LDA**: leading dimension of `A`.
-   **B**: input array `B`.
-   **LDB**: leading dimension of `B`.
-   **vl**: `vl`.
-   **vu**: `vu`.
-   **il**: `il`.
-   **iu**: `iu`.
-   **abstol**: `abstol`.
-   **out**: `out`.
-   **w**: `w`.
-   **strideW**: stride length for `W`.
-   **Z**: input array `Z`.
-   **LDZ**: leading dimension of `Z`.
-   **WORK**: input array `WORK`.
-   **strideWORK**: stride length for `WORK`.
-   **lwork**: `lwork`.
-   **RWORK**: input array `RWORK`.
-   **strideRWORK**: stride length for `RWORK`.
-   **IWORK**: input array `IWORK`.
-   **strideIWORK**: stride length for `IWORK`.
-   **IFAIL**: input array `IFAIL`.
-   **strideIFAIL**: stride length for `IFAIL`.

#### zhegvx.ndarray( itype, jobz, range, uplo, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, vl, vu, il, iu, abstol, out, w, strideW, offsetW, Z, strideZ1, strideZ2, offsetZ, WORK, strideWORK, offsetWORK, lwork, RWORK, strideRWORK, offsetRWORK, IWORK, strideIWORK, offsetIWORK, IFAIL, strideIFAIL, offsetIFAIL )

Computes selected eigenvalues, and optionally, eigenvectors of a complex generalized Hermitian-definite eigenproblem, of the form A·x=λ·B·x, A·Bx=λ·x, or B·A·x=λ·x, using alternative indexing semantics.

```javascript
var zhegvx = require( '@stdlib/lapack/base/zhegvx' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var B = discreteUniform( N * N, -10, 10, opts );
var Z = discreteUniform( N * N, -10, 10, opts );
var w = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );
var RWORK = discreteUniform( N, -10, 10, opts );
var IWORK = discreteUniform( N, -10, 10, opts );
var IFAIL = discreteUniform( N, -10, 10, opts );

zhegvx.ndarray( N, 'compute-vectors', 'all', 'upper', N, A, N, 1, 0, B, N, 1, 0, 1.0, 1.0, N, N, 1.0, 1, w, 1, 0, Z, N, 1, 0, WORK, 1, 0, N, RWORK, 1, 0, IWORK, 1, 0, IFAIL, 1, 0 );
```

The function has the following additional parameters:

-   **strideA1**: stride of dimension 1 of `A`.
-   **strideA2**: stride of dimension 2 of `A`.
-   **offsetA**: starting index for `A`.
-   **strideB1**: stride of dimension 1 of `B`.
-   **strideB2**: stride of dimension 2 of `B`.
-   **offsetB**: starting index for `B`.
-   **offsetW**: starting index for `W`.
-   **strideZ1**: stride of dimension 1 of `Z`.
-   **strideZ2**: stride of dimension 2 of `Z`.
-   **offsetZ**: starting index for `Z`.
-   **offsetWORK**: starting index for `WORK`.
-   **offsetRWORK**: starting index for `RWORK`.
-   **offsetIWORK**: starting index for `IWORK`.
-   **offsetIFAIL**: starting index for `IFAIL`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `zhegvx()` corresponds to the [LAPACK][lapack] level routine [`zhegvx`][lapack-zhegvx].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var zhegvx = require( '@stdlib/lapack/base/zhegvx' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var B = discreteUniform( N * N, -10, 10, opts );
var Z = discreteUniform( N * N, -10, 10, opts );
var w = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );
var RWORK = discreteUniform( N, -10, 10, opts );
var IWORK = discreteUniform( N, -10, 10, opts );
var IFAIL = discreteUniform( N, -10, 10, opts );

zhegvx.ndarray( N, 'compute-vectors', 'all', 'upper', N, A, N, 1, 0, B, N, 1, 0, 1.0, 1.0, N, N, 1.0, 1, w, 1, 0, Z, N, 1, 0, WORK, 1, 0, N, RWORK, 1, 0, IWORK, 1, 0, IFAIL, 1, 0 );
```

</section>

<!-- /.examples -->

<!-- fortran-docs:start (generated by bin/fortran-docs.mjs from data/lapack-3.12.0/SRC/zhegvx.f; do not edit) -->

<section class="fortran-docs">

## Reference documentation

From the reference LAPACK 3.12.0 source of `ZHEGVX`, converted to Markdown with KaTeX math. Indices are the 1-based Fortran indices of the source.

### Purpose

ZHEGVX computes selected eigenvalues, and optionally, eigenvectors of a complex generalized Hermitian-definite eigenproblem, of the form $A \, x=(\lambda ) \, B \, x$, $A \, \mathrm{Bx}=(\lambda ) \, x$, or $B \, A \, x=(\lambda ) \, x$. Here A and B are assumed to be Hermitian and B is also positive definite. Eigenvalues and eigenvectors can be selected by specifying either a range of values or a range of indices for the desired eigenvalues.

### Arguments

#### ITYPE `[in]`

_INTEGER_

Specifies the problem type to be solved:

-   `= 1`: $A \, x = (\lambda ) \, B \, x$
-   `= 2`: $A \, B \, x = (\lambda ) \, x$
-   `= 3`: $B \, A \, x = (\lambda ) \, x$

#### JOBZ `[in]`

_CHARACTER\*1_

-   `= 'N'`: Compute eigenvalues only;
-   `= 'V'`: Compute eigenvalues and eigenvectors.

#### RANGE `[in]`

_CHARACTER\*1_

-   `= 'A'`: all eigenvalues will be found.
-   `= 'V'`: all eigenvalues in the half-open interval (`VL`,`VU`\] will be found.
-   `= 'I'`: the `IL`-th through `IU`-th eigenvalues will be found.

#### UPLO `[in]`

_CHARACTER\*1_

-   `= 'U'`: Upper triangles of A and B are stored;
-   `= 'L'`: Lower triangles of A and B are stored.

#### N `[in]`

_INTEGER_

The order of the matrices A and B. $N \ge 0$.

#### A `[in,out]`

_COMPLEX\*16 array, dimension (LDA, N)_

On entry, the Hermitian matrix A. If `UPLO = 'U'`, the leading N-by-N upper triangular part of A contains the upper triangular part of the matrix A. If `UPLO = 'L'`, the leading N-by-N lower triangular part of A contains the lower triangular part of the matrix A.

On exit, the lower triangle (if `UPLO='L'`) or the upper triangle (if `UPLO='U'`) of A, including the diagonal, is destroyed.

#### LDA `[in]`

_INTEGER_

The leading dimension of the array A. $\mathrm{LDA} \ge \max (1,N)$.

#### B `[in,out]`

_COMPLEX\*16 array, dimension (LDB, N)_

On entry, the Hermitian matrix B. If `UPLO = 'U'`, the leading N-by-N upper triangular part of B contains the upper triangular part of the matrix B. If `UPLO = 'L'`, the leading N-by-N lower triangular part of B contains the lower triangular part of the matrix B.

On exit, if $\mathrm{INFO} \le N$, the part of B containing the matrix is overwritten by the triangular factor U or L from the Cholesky factorization $B = U^H \, U$ or $B = L \, L^H$.

#### LDB `[in]`

_INTEGER_

The leading dimension of the array B. $\mathrm{LDB} \ge \max (1,N)$.

#### VL `[in]`

_DOUBLE PRECISION_

If `RANGE='V'`, the lower bound of the interval to be searched for eigenvalues. $\mathrm{VL} < \mathrm{VU}$. Not referenced if `RANGE = 'A'` or 'I'.

#### VU `[in]`

_DOUBLE PRECISION_

If `RANGE='V'`, the upper bound of the interval to be searched for eigenvalues. $\mathrm{VL} < \mathrm{VU}$. Not referenced if `RANGE = 'A'` or 'I'.

#### IL `[in]`

_INTEGER_

If `RANGE='I'`, the index of the smallest eigenvalue to be returned. $1 \le \mathrm{IL} \le \mathrm{IU} \le N$, if $N > 0$; `IL = 1` and `IU = 0` if $N = 0$. Not referenced if `RANGE = 'A'` or 'V'.

#### IU `[in]`

_INTEGER_

If `RANGE='I'`, the index of the largest eigenvalue to be returned. $1 \le \mathrm{IL} \le \mathrm{IU} \le N$, if $N > 0$; `IL = 1` and `IU = 0` if $N = 0$. Not referenced if `RANGE = 'A'` or 'V'.

#### ABSTOL `[in]`

_DOUBLE PRECISION_

The absolute error tolerance for the eigenvalues. An approximate eigenvalue is accepted as converged when it is determined to lie in an interval \[a,b\] of width less than or equal to

$$
\mathrm{ABSTOL} + \mathrm{EPS} \, \max ( |a|,|b| )
$$

where EPS is the machine precision. If `ABSTOL` is less than or equal to zero, then EPS\*\|T\| will be used in its place, where \|T\| is the 1-norm of the tridiagonal matrix obtained by reducing C to tridiagonal form, where C is the symmetric matrix of the standard symmetric problem to which the generalized problem is transformed.

Eigenvalues will be computed most accurately when `ABSTOL` is set to twice the underflow threshold $2 \, \mathrm{DLAMCH}(\text{'S'})$, not zero. If this routine returns with $\mathrm{INFO}>0$, indicating that some eigenvectors did not converge, try setting `ABSTOL` to $2 \, \mathrm{DLAMCH}(\text{'S'})$.

#### M `[out]`

_INTEGER_

The total number of eigenvalues found. $0 \le M \le N$. If `RANGE = 'A'`, $M = N$, and if `RANGE = 'I'`, $M = \mathrm{IU}-\mathrm{IL}+1$.

#### W `[out]`

_DOUBLE PRECISION array, dimension (N)_

The first M elements contain the selected eigenvalues in ascending order.

#### Z `[out]`

_COMPLEX\*16 array, dimension (LDZ, max(1,M))_

If `JOBZ = 'N'`, then Z is not referenced. If `JOBZ = 'V'`, then if `INFO = 0`, the first M columns of Z contain the orthonormal eigenvectors of the matrix A corresponding to the selected eigenvalues, with the i-th column of Z holding the eigenvector associated with `W(i)`. The eigenvectors are normalized as follows: if `ITYPE = 1` or 2, $Z^T \, B \, Z = I$; if `ITYPE = 3`, $Z^T \, \operatorname{inv}(B) \, Z = I$.

If an eigenvector fails to converge, then that column of Z contains the latest approximation to the eigenvector, and the index of the eigenvector is returned in `IFAIL`. Note: the user must ensure that at least max(1,M) columns are supplied in the array Z; if `RANGE = 'V'`, the exact value of M is not known in advance and an upper bound must be used.

#### LDZ `[in]`

_INTEGER_

The leading dimension of the array Z. $\mathrm{LDZ} \ge 1$, and if `JOBZ = 'V'`, $\mathrm{LDZ} \ge \max (1,N)$.

#### WORK `[out]`

_COMPLEX\*16 array, dimension (MAX(1,LWORK))_

On exit, if `INFO = 0`, `WORK(1)` returns the optimal `LWORK`.

#### LWORK `[in]`

_INTEGER_

The length of the array `WORK`. $\mathrm{LWORK} \ge \max (1,2 \, N)$. For optimal efficiency, $\mathrm{LWORK} \ge (\mathrm{NB}+1) \, N$, where NB is the blocksize for ZHETRD returned by ILAENV.

If `LWORK = -1`, then a workspace query is assumed; the routine only calculates the optimal size of the `WORK` array, returns this value as the first entry of the `WORK` array, and no error message related to `LWORK` is issued by XERBLA.

#### RWORK `[out]`

_DOUBLE PRECISION array, dimension (7\*N)_

#### IWORK `[out]`

_INTEGER array, dimension (5\*N)_

#### IFAIL `[out]`

_INTEGER array, dimension (N)_

If `JOBZ = 'V'`, then if `INFO = 0`, the first M elements of `IFAIL` are zero. If $\mathrm{INFO} > 0$, then `IFAIL` contains the indices of the eigenvectors that failed to converge. If `JOBZ = 'N'`, then `IFAIL` is not referenced.

#### INFO `[out]`

_INTEGER_

-   `= 0`: successful exit
-   `< 0`: if `INFO = -i`, the i-th argument had an illegal value
-   `> 0`: ZPOTRF or ZHEEVX returned an error code: \<= N:  if `INFO = i`, ZHEEVX failed to converge; i eigenvectors failed to converge.  Their indices are stored in array `IFAIL`.
-   `> N`: if $\mathrm{INFO} = N + i$, for $1 \le i \le N$, then the leading principal minor of order i of B is not positive. The factorization of B could not be completed and no eigenvalues or eigenvectors were computed.

</section>

<!-- fortran-docs:end -->

<!-- Section for related `stdlib` packages. Do not manually edit this section, as it is automatically populated. -->

<section class="related">

</section>

<!-- /.related -->

<!-- Section for all links. Make sure to keep an empty line after the `section` element and another before the `/section` close. -->

<section class="links">

[lapack]: https://www.netlib.org/lapack/explore-html/

[lapack-zhegvx]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__zhegvx.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->