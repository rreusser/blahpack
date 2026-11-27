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

# dsbgvx

> @license Apache-2.0.

<section class="usage">

## Usage

```javascript
var dsbgvx = require( '@stdlib/lapack/base/dsbgvx' );
```

#### dsbgvx( jobz, range, uplo, N, ka, kb, AB, LDAB, BB, LDBB, Q, LDQ, vl, vu, il, iu, abstol, out, w, strideW, Z, LDZ, WORK, strideWORK, IWORK, strideIWORK, IFAIL, strideIFAIL )

@license Apache-2.0.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Int32Array = require( '@stdlib/array/int32' );
var dsbgvx = require( '@stdlib/lapack/base/dsbgvx' );

var Q = new Float64Array( 25 );
var W = new Float64Array( 5 );
var Z = new Float64Array( 25 );
var WORK = new Float64Array( 50 );
var IWORK = new Int32Array( 30 );
var IFAIL = new Int32Array( 5 );

dsbgvx.ndarray( 'compute-vectors', 'all', 'upper', 5, 2, 1, AB, 1, 3, 0, BB, 1, 2, 0, Q, 1, 5, 0, 0, 0, 0, 0, 0, out, W, 1, 0, Z, 1, 5, 0, WORK, 1, 0, IWORK, 1, 0, IFAIL, 1, 0 );
```

The function has the following parameters:

-   **jobz**: `jobz`.
-   **range**: `range`.
-   **uplo**: specifies whether the upper or lower triangular part is referenced.
-   **N**: number of columns.
-   **ka**: `ka`.
-   **kb**: `kb`.
-   **AB**: input array `AB`.
-   **LDAB**: leading dimension of `AB`.
-   **BB**: input array `BB`.
-   **LDBB**: leading dimension of `BB`.
-   **Q**: input array `Q`.
-   **LDQ**: leading dimension of `Q`.
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
-   **IWORK**: input array `IWORK`.
-   **strideIWORK**: stride length for `IWORK`.
-   **IFAIL**: input array `IFAIL`.
-   **strideIFAIL**: stride length for `IFAIL`.

#### dsbgvx.ndarray( jobz, range, uplo, N, ka, kb, AB, strideAB1, strideAB2, offsetAB, BB, strideBB1, strideBB2, offsetBB, Q, strideQ1, strideQ2, offsetQ, vl, vu, il, iu, abstol, out, w, strideW, offsetW, Z, strideZ1, strideZ2, offsetZ, WORK, strideWORK, offsetWORK, IWORK, strideIWORK, offsetIWORK, IFAIL, strideIFAIL, offsetIFAIL )

@license Apache-2.0, using alternative indexing semantics.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Int32Array = require( '@stdlib/array/int32' );
var dsbgvx = require( '@stdlib/lapack/base/dsbgvx' );

var Q = new Float64Array( 25 );
var W = new Float64Array( 5 );
var Z = new Float64Array( 25 );
var WORK = new Float64Array( 50 );
var IWORK = new Int32Array( 30 );
var IFAIL = new Int32Array( 5 );

dsbgvx.ndarray( 'compute-vectors', 'all', 'upper', 5, 2, 1, AB, 1, 3, 0, BB, 1, 2, 0, Q, 1, 5, 0, 0, 0, 0, 0, 0, out, W, 1, 0, Z, 1, 5, 0, WORK, 1, 0, IWORK, 1, 0, IFAIL, 1, 0 );
```

The function has the following additional parameters:

-   **strideAB1**: stride of dimension 1 of `AB`.
-   **strideAB2**: stride of dimension 2 of `AB`.
-   **offsetAB**: starting index for `AB`.
-   **strideBB1**: stride of dimension 1 of `BB`.
-   **strideBB2**: stride of dimension 2 of `BB`.
-   **offsetBB**: starting index for `BB`.
-   **strideQ1**: stride of dimension 1 of `Q`.
-   **strideQ2**: stride of dimension 2 of `Q`.
-   **offsetQ**: starting index for `Q`.
-   **offsetW**: starting index for `W`.
-   **strideZ1**: stride of dimension 1 of `Z`.
-   **strideZ2**: stride of dimension 2 of `Z`.
-   **offsetZ**: starting index for `Z`.
-   **offsetWORK**: starting index for `WORK`.
-   **offsetIWORK**: starting index for `IWORK`.
-   **offsetIFAIL**: starting index for `IFAIL`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `dsbgvx()` corresponds to the [LAPACK][lapack] level routine [`dsbgvx`][lapack-dsbgvx].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Int32Array = require( '@stdlib/array/int32' );
var dsbgvx = require( '@stdlib/lapack/base/dsbgvx' );

var Q = new Float64Array( 25 );
var W = new Float64Array( 5 );
var Z = new Float64Array( 25 );
var WORK = new Float64Array( 50 );
var IWORK = new Int32Array( 30 );
var IFAIL = new Int32Array( 5 );

dsbgvx.ndarray( 'compute-vectors', 'all', 'upper', 5, 2, 1, AB, 1, 3, 0, BB, 1, 2, 0, Q, 1, 5, 0, 0, 0, 0, 0, 0, out, W, 1, 0, Z, 1, 5, 0, WORK, 1, 0, IWORK, 1, 0, IFAIL, 1, 0 );
```

</section>

<!-- /.examples -->

<!-- fortran-docs:start (generated by bin/fortran-docs.mjs from data/lapack-3.12.0/SRC/dsbgvx.f; do not edit) -->

<section class="fortran-docs">

## Reference documentation

From the reference LAPACK 3.12.0 source of `DSBGVX`, converted to Markdown with KaTeX math. Indices are the 1-based Fortran indices of the source.

### Purpose

DSBGVX computes selected eigenvalues, and optionally, eigenvectors of a real generalized symmetric-definite banded eigenproblem, of the form $A \, x=(\lambda ) \, B \, x$. Here A and B are assumed to be symmetric and banded, and B is also positive definite. Eigenvalues and eigenvectors can be selected by specifying either all eigenvalues, a range of values or a range of indices for the desired eigenvalues.

### Arguments

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

#### KA `[in]`

_INTEGER_

The number of superdiagonals of the matrix A if `UPLO = 'U'`, or the number of subdiagonals if `UPLO = 'L'`. $\mathrm{KA} \ge 0$.

#### KB `[in]`

_INTEGER_

The number of superdiagonals of the matrix B if `UPLO = 'U'`, or the number of subdiagonals if `UPLO = 'L'`. $\mathrm{KB} \ge 0$.

#### AB `[in,out]`

_DOUBLE PRECISION array, dimension (LDAB, N)_

On entry, the upper or lower triangle of the symmetric band matrix A, stored in the first ka+1 rows of the array. The j-th column of A is stored in the j-th column of the array `AB` as follows: if `UPLO = 'U'`, `AB(ka+1+i-j,j) = A(i,j)` for $\max (1,j-\mathrm{ka}) \le i \le j$; if `UPLO = 'L'`, `AB(1+i-j,j) = A(i,j)` for $j \le i \le \min (n,j+\mathrm{ka})$.

On exit, the contents of `AB` are destroyed.

#### LDAB `[in]`

_INTEGER_

The leading dimension of the array `AB`. $\mathrm{LDAB} \ge \mathrm{KA}+1$.

#### BB `[in,out]`

_DOUBLE PRECISION array, dimension (LDBB, N)_

On entry, the upper or lower triangle of the symmetric band matrix B, stored in the first kb+1 rows of the array. The j-th column of B is stored in the j-th column of the array `BB` as follows: if `UPLO = 'U'`, `BB(ka+1+i-j,j) = B(i,j)` for $\max (1,j-\mathrm{kb}) \le i \le j$; if `UPLO = 'L'`, `BB(1+i-j,j) = B(i,j)` for $j \le i \le \min (n,j+\mathrm{kb})$.

On exit, the factor S from the split Cholesky factorization $B = S^T \, S$, as returned by DPBSTF.

#### LDBB `[in]`

_INTEGER_

The leading dimension of the array `BB`. $\mathrm{LDBB} \ge \mathrm{KB}+1$.

#### Q `[out]`

_DOUBLE PRECISION array, dimension (LDQ, N)_

If `JOBZ = 'V'`, the n-by-n matrix used in the reduction of $A \, x = (\lambda ) \, B \, x$ to standard form, i.e. $C \, x = (\lambda ) \, x$, and consequently C to tridiagonal form. If `JOBZ = 'N'`, the array Q is not referenced.

#### LDQ `[in]`

_INTEGER_

The leading dimension of the array Q. If `JOBZ = 'N'`, $\mathrm{LDQ} \ge 1$. If `JOBZ = 'V'`, $\mathrm{LDQ} \ge \max (1,N)$.

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

where EPS is the machine precision. If `ABSTOL` is less than or equal to zero, then EPS\*\|T\| will be used in its place, where \|T\| is the 1-norm of the tridiagonal matrix obtained by reducing A to tridiagonal form.

Eigenvalues will be computed most accurately when `ABSTOL` is set to twice the underflow threshold $2 \, \mathrm{DLAMCH}(\text{'S'})$, not zero. If this routine returns with $\mathrm{INFO}>0$, indicating that some eigenvectors did not converge, try setting `ABSTOL` to $2 \, \mathrm{DLAMCH}(\text{'S'})$.

#### M `[out]`

_INTEGER_

The total number of eigenvalues found. $0 \le M \le N$. If `RANGE = 'A'`, $M = N$, and if `RANGE = 'I'`, $M = \mathrm{IU}-\mathrm{IL}+1$.

#### W `[out]`

_DOUBLE PRECISION array, dimension (N)_

If `INFO = 0`, the eigenvalues in ascending order.

#### Z `[out]`

_DOUBLE PRECISION array, dimension (LDZ, N)_

If `JOBZ = 'V'`, then if `INFO = 0`, Z contains the matrix Z of eigenvectors, with the i-th column of Z holding the eigenvector associated with `W(i)`. The eigenvectors are normalized so $Z^T \, B \, Z = I$. If `JOBZ = 'N'`, then Z is not referenced.

#### LDZ `[in]`

_INTEGER_

The leading dimension of the array Z. $\mathrm{LDZ} \ge 1$, and if `JOBZ = 'V'`, $\mathrm{LDZ} \ge \max (1,N)$.

#### WORK `[out]`

_DOUBLE PRECISION array, dimension (7\*N)_

#### IWORK `[out]`

_INTEGER array, dimension (5\*N)_

#### IFAIL `[out]`

_INTEGER array, dimension (M)_

If `JOBZ = 'V'`, then if `INFO = 0`, the first M elements of `IFAIL` are zero. If $\mathrm{INFO} > 0$, then `IFAIL` contains the indices of the eigenvalues that failed to converge. If `JOBZ = 'N'`, then `IFAIL` is not referenced.

#### INFO `[out]`

_INTEGER_

-   `= 0`: successful exit
-   `< 0`: if `INFO = -i`, the i-th argument had an illegal value \<= N: if `INFO = i`, then i eigenvectors failed to converge. Their indices are stored in `IFAIL`.
-   `> N`: DPBSTF returned an error code; i.e., if $\mathrm{INFO} = N + i$, for $1 \le i \le N$, then the leading principal minor of order i of B is not positive. The factorization of B could not be completed and no eigenvalues or eigenvectors were computed.

</section>

<!-- fortran-docs:end -->

<!-- Section for related `stdlib` packages. Do not manually edit this section, as it is automatically populated. -->

<section class="related">

</section>

<!-- /.related -->

<!-- Section for all links. Make sure to keep an empty line after the `section` element and another before the `/section` close. -->

<section class="links">

[lapack]: https://www.netlib.org/lapack/explore-html/

[lapack-dsbgvx]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__dsbgvx.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->