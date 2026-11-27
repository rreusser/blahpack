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

# zhpgvx

> @license Apache-2.0.

<section class="usage">

## Usage

```javascript
var zhpgvx = require( '@stdlib/lapack/base/zhpgvx' );
```

#### zhpgvx( order, itype, jobz, range, uplo, N, AP, BP, vl, vu, il, iu, abstol, out, w, Z, LDZ, WORK, RWORK, IWORK, IFAIL )

@license Apache-2.0.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Complex128Array = require( '@stdlib/array/complex128' );
var Int32Array = require( '@stdlib/array/int32' );
var zhpgvx = require( '@stdlib/lapack/base/zhpgvx' );

var AP = new Complex128Array( [ 4, 0, 1, -1, 5, 0 ] );
var BP = new Complex128Array( [ 2, 0, 0, 0, 3, 0 ] );
var W = new Float64Array( 2 );
var Z = new Complex128Array( 4 );
var WORK = new Complex128Array( 10 );
var RWORK = new Float64Array( 20 );
var IWORK = new Int32Array( 15 );
var IFAIL = new Int32Array( 2 );

zhpgvx( 'column-major', 1, 'compute-vectors', 'all', 'upper', 2, AP, BP, 0, 0, 0, 0, 0, out, W, Z, 2, WORK, RWORK, IWORK, IFAIL );
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **itype**: `itype`.
-   **jobz**: `jobz`.
-   **range**: `range`.
-   **uplo**: specifies whether the upper or lower triangular part is referenced.
-   **N**: number of columns.
-   **AP**: input array `AP`.
-   **BP**: input array `BP`.
-   **vl**: `vl`.
-   **vu**: `vu`.
-   **il**: `il`.
-   **iu**: `iu`.
-   **abstol**: `abstol`.
-   **out**: `out`.
-   **w**: `w`.
-   **Z**: input array `Z`.
-   **LDZ**: leading dimension of `Z`.
-   **WORK**: input array `WORK`.
-   **RWORK**: input array `RWORK`.
-   **IWORK**: input array `IWORK`.
-   **IFAIL**: input array `IFAIL`.

#### zhpgvx.ndarray( itype, jobz, range, uplo, N, AP, strideAP, offsetAP, BP, strideBP, offsetBP, vl, vu, il, iu, abstol, out, w, strideW, offsetW, Z, strideZ1, strideZ2, offsetZ, WORK, strideWORK, offsetWORK, RWORK, strideRWORK, offsetRWORK, IWORK, strideIWORK, offsetIWORK, IFAIL, strideIFAIL, offsetIFAIL )

@license Apache-2.0, using alternative indexing semantics.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Complex128Array = require( '@stdlib/array/complex128' );
var Int32Array = require( '@stdlib/array/int32' );
var zhpgvx = require( '@stdlib/lapack/base/zhpgvx' );

var AP = new Complex128Array( [ 4, 0, 1, -1, 5, 0 ] );
var BP = new Complex128Array( [ 2, 0, 0, 0, 3, 0 ] );
var W = new Float64Array( 2 );
var Z = new Complex128Array( 4 );
var WORK = new Complex128Array( 10 );
var RWORK = new Float64Array( 20 );
var IWORK = new Int32Array( 15 );
var IFAIL = new Int32Array( 2 );

zhpgvx( 'column-major', 1, 'compute-vectors', 'all', 'upper', 2, AP, BP, 0, 0, 0, 0, 0, out, W, Z, 2, WORK, RWORK, IWORK, IFAIL );
```

The function has the following additional parameters:

-   **strideAP**: stride length for `AP`.
-   **offsetAP**: starting index for `AP`.
-   **strideBP**: stride length for `BP`.
-   **offsetBP**: starting index for `BP`.
-   **strideW**: stride length for `W`.
-   **offsetW**: starting index for `W`.
-   **strideZ1**: stride of dimension 1 of `Z`.
-   **strideZ2**: stride of dimension 2 of `Z`.
-   **offsetZ**: starting index for `Z`.
-   **strideWORK**: stride length for `WORK`.
-   **offsetWORK**: starting index for `WORK`.
-   **strideRWORK**: stride length for `RWORK`.
-   **offsetRWORK**: starting index for `RWORK`.
-   **strideIWORK**: stride length for `IWORK`.
-   **offsetIWORK**: starting index for `IWORK`.
-   **strideIFAIL**: stride length for `IFAIL`.
-   **offsetIFAIL**: starting index for `IFAIL`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `zhpgvx()` corresponds to the [LAPACK][lapack] level routine [`zhpgvx`][lapack-zhpgvx].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Complex128Array = require( '@stdlib/array/complex128' );
var Int32Array = require( '@stdlib/array/int32' );
var zhpgvx = require( '@stdlib/lapack/base/zhpgvx' );

var AP = new Complex128Array( [ 4, 0, 1, -1, 5, 0 ] );
var BP = new Complex128Array( [ 2, 0, 0, 0, 3, 0 ] );
var W = new Float64Array( 2 );
var Z = new Complex128Array( 4 );
var WORK = new Complex128Array( 10 );
var RWORK = new Float64Array( 20 );
var IWORK = new Int32Array( 15 );
var IFAIL = new Int32Array( 2 );

zhpgvx( 'column-major', 1, 'compute-vectors', 'all', 'upper', 2, AP, BP, 0, 0, 0, 0, 0, out, W, Z, 2, WORK, RWORK, IWORK, IFAIL );
```

</section>

<!-- /.examples -->

<!-- fortran-docs:start (generated by bin/fortran-docs.mjs from data/lapack-3.12.0/SRC/zhpgvx.f; do not edit) -->

<section class="fortran-docs">

## Reference documentation

From the reference LAPACK 3.12.0 source of `ZHPGVX`, converted to Markdown with KaTeX math. Indices are the 1-based Fortran indices of the source.

### Purpose

ZHPGVX computes selected eigenvalues and, optionally, eigenvectors of a complex generalized Hermitian-definite eigenproblem, of the form $A \, x=(\lambda ) \, B \, x$, $A \, \mathrm{Bx}=(\lambda ) \, x$, or $B \, A \, x=(\lambda ) \, x$. Here A and B are assumed to be Hermitian, stored in packed format, and B is also positive definite. Eigenvalues and eigenvectors can be selected by specifying either a range of values or a range of indices for the desired eigenvalues.

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

-   `= 'A'`: all eigenvalues will be found;
-   `= 'V'`: all eigenvalues in the half-open interval (`VL`,`VU`\] will be found;
-   `= 'I'`: the `IL`-th through `IU`-th eigenvalues will be found.

#### UPLO `[in]`

_CHARACTER\*1_

-   `= 'U'`: Upper triangles of A and B are stored;
-   `= 'L'`: Lower triangles of A and B are stored.

#### N `[in]`

_INTEGER_

The order of the matrices A and B. $N \ge 0$.

#### AP `[in,out]`

_COMPLEX\*16 array, dimension (N\*(N+1)/2)_

On entry, the upper or lower triangle of the Hermitian matrix A, packed columnwise in a linear array. The j-th column of A is stored in the array `AP` as follows: if `UPLO = 'U'`, `AP(i + (j-1)*j/2) = A(i,j)` for $1 \le i \le j$; if `UPLO = 'L'`, `AP(i + (j-1)*(2*n-j)/2) = A(i,j)` for $j \le i \le n$.

On exit, the contents of `AP` are destroyed.

#### BP `[in,out]`

_COMPLEX\*16 array, dimension (N\*(N+1)/2)_

On entry, the upper or lower triangle of the Hermitian matrix B, packed columnwise in a linear array. The j-th column of B is stored in the array `BP` as follows: if `UPLO = 'U'`, `BP(i + (j-1)*j/2) = B(i,j)` for $1 \le i \le j$; if `UPLO = 'L'`, `BP(i + (j-1)*(2*n-j)/2) = B(i,j)` for $j \le i \le n$.

On exit, the triangular factor U or L from the Cholesky factorization $B = U^H \, U$ or $B = L \, L^H$, in the same storage format as B.

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

where EPS is the machine precision. If `ABSTOL` is less than or equal to zero, then EPS\*\|T\| will be used in its place, where \|T\| is the 1-norm of the tridiagonal matrix obtained by reducing `AP` to tridiagonal form.

Eigenvalues will be computed most accurately when `ABSTOL` is set to twice the underflow threshold $2 \, \mathrm{DLAMCH}(\text{'S'})$, not zero. If this routine returns with $\mathrm{INFO}>0$, indicating that some eigenvectors did not converge, try setting `ABSTOL` to $2 \, \mathrm{DLAMCH}(\text{'S'})$.

#### M `[out]`

_INTEGER_

The total number of eigenvalues found. $0 \le M \le N$. If `RANGE = 'A'`, $M = N$, and if `RANGE = 'I'`, $M = \mathrm{IU}-\mathrm{IL}+1$.

#### W `[out]`

_DOUBLE PRECISION array, dimension (N)_

On normal exit, the first M elements contain the selected eigenvalues in ascending order.

#### Z `[out]`

_COMPLEX\*16 array, dimension (LDZ, N)_

If `JOBZ = 'N'`, then Z is not referenced. If `JOBZ = 'V'`, then if `INFO = 0`, the first M columns of Z contain the orthonormal eigenvectors of the matrix A corresponding to the selected eigenvalues, with the i-th column of Z holding the eigenvector associated with `W(i)`. The eigenvectors are normalized as follows: if `ITYPE = 1` or 2, $Z^H \, B \, Z = I$; if `ITYPE = 3`, $Z^H \, \operatorname{inv}(B) \, Z = I$.

If an eigenvector fails to converge, then that column of Z contains the latest approximation to the eigenvector, and the index of the eigenvector is returned in `IFAIL`. Note: the user must ensure that at least max(1,M) columns are supplied in the array Z; if `RANGE = 'V'`, the exact value of M is not known in advance and an upper bound must be used.

#### LDZ `[in]`

_INTEGER_

The leading dimension of the array Z. $\mathrm{LDZ} \ge 1$, and if `JOBZ = 'V'`, $\mathrm{LDZ} \ge \max (1,N)$.

#### WORK `[out]`

_COMPLEX\*16 array, dimension (2\*N)_

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
-   `> 0`: ZPPTRF or ZHPEVX returned an error code: \<= N:  if `INFO = i`, ZHPEVX failed to converge; i eigenvectors failed to converge.  Their indices are stored in array `IFAIL`.
-   `> N`: if $\mathrm{INFO} = N + i$, for $1 \le i \le n$, then the leading principal minor of order i of B is not positive. The factorization of B could not be completed and no eigenvalues or eigenvectors were computed.

</section>

<!-- fortran-docs:end -->

<!-- Section for related `stdlib` packages. Do not manually edit this section, as it is automatically populated. -->

<section class="related">

</section>

<!-- /.related -->

<!-- Section for all links. Make sure to keep an empty line after the `section` element and another before the `/section` close. -->

<section class="links">

[lapack]: https://www.netlib.org/lapack/explore-html/

[lapack-zhpgvx]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__zhpgvx.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->