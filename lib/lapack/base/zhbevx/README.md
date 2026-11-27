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

# zhbevx

> Computes selected eigenvalues and, optionally, eigenvectors of a complex Hermitian band matrix A.

<section class="usage">

## Usage

```javascript
var zhbevx = require( '@stdlib/lapack/base/zhbevx' );
```

#### zhbevx( jobz, range, uplo, N, kd, AB, LDAB, Q, LDQ, vl, vu, il, iu, abstol, out, w, strideW, Z, LDZ, WORK, strideWORK, RWORK, strideRWORK, IWORK, strideIWORK, IFAIL, strideIFAIL )

Computes selected eigenvalues and, optionally, eigenvectors of a complex Hermitian band matrix A.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Complex128Array = require( '@stdlib/array/complex128' );
var Int32Array = require( '@stdlib/array/int32' );
var zhbevx = require( '@stdlib/lapack/base/zhbevx' );

var Q = new Complex128Array( 16 );
var W = new Float64Array( 4 );
var Z = new Complex128Array( 16 );
var WORK = new Complex128Array( 20 );
var RWORK = new Float64Array( 50 );
var IWORK = new Int32Array( 30 );
var IFAIL = new Int32Array( 4 );

zhbevx.ndarray( 'compute-vectors', 'all', 'lower', 4, 1, AB, 1, 2, 0, Q, 1, 4, 0, 0, 0, 0, 0, 0, out, W, 1, 0, Z, 1, 4, 0, WORK, 1, 0, RWORK, 1, 0, IWORK, 1, 0, IFAIL, 1, 0 );
```

The function has the following parameters:

-   **jobz**: `jobz`.
-   **range**: `range`.
-   **uplo**: specifies whether the upper or lower triangular part is referenced.
-   **N**: number of columns.
-   **kd**: `kd`.
-   **AB**: input array `AB`.
-   **LDAB**: leading dimension of `AB`.
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
-   **RWORK**: input array `RWORK`.
-   **strideRWORK**: stride length for `RWORK`.
-   **IWORK**: input array `IWORK`.
-   **strideIWORK**: stride length for `IWORK`.
-   **IFAIL**: input array `IFAIL`.
-   **strideIFAIL**: stride length for `IFAIL`.

#### zhbevx.ndarray( jobz, range, uplo, N, kd, AB, strideAB1, strideAB2, offsetAB, Q, strideQ1, strideQ2, offsetQ, vl, vu, il, iu, abstol, out, w, strideW, offsetW, Z, strideZ1, strideZ2, offsetZ, WORK, strideWORK, offsetWORK, RWORK, strideRWORK, offsetRWORK, IWORK, strideIWORK, offsetIWORK, IFAIL, strideIFAIL, offsetIFAIL )

Computes selected eigenvalues and, optionally, eigenvectors of a complex Hermitian band matrix A, using alternative indexing semantics.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Complex128Array = require( '@stdlib/array/complex128' );
var Int32Array = require( '@stdlib/array/int32' );
var zhbevx = require( '@stdlib/lapack/base/zhbevx' );

var Q = new Complex128Array( 16 );
var W = new Float64Array( 4 );
var Z = new Complex128Array( 16 );
var WORK = new Complex128Array( 20 );
var RWORK = new Float64Array( 50 );
var IWORK = new Int32Array( 30 );
var IFAIL = new Int32Array( 4 );

zhbevx.ndarray( 'compute-vectors', 'all', 'lower', 4, 1, AB, 1, 2, 0, Q, 1, 4, 0, 0, 0, 0, 0, 0, out, W, 1, 0, Z, 1, 4, 0, WORK, 1, 0, RWORK, 1, 0, IWORK, 1, 0, IFAIL, 1, 0 );
```

The function has the following additional parameters:

-   **strideAB1**: stride of dimension 1 of `AB`.
-   **strideAB2**: stride of dimension 2 of `AB`.
-   **offsetAB**: starting index for `AB`.
-   **strideQ1**: stride of dimension 1 of `Q`.
-   **strideQ2**: stride of dimension 2 of `Q`.
-   **offsetQ**: starting index for `Q`.
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

-   `zhbevx()` corresponds to the [LAPACK][lapack] level routine [`zhbevx`][lapack-zhbevx].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Complex128Array = require( '@stdlib/array/complex128' );
var Int32Array = require( '@stdlib/array/int32' );
var zhbevx = require( '@stdlib/lapack/base/zhbevx' );

var Q = new Complex128Array( 16 );
var W = new Float64Array( 4 );
var Z = new Complex128Array( 16 );
var WORK = new Complex128Array( 20 );
var RWORK = new Float64Array( 50 );
var IWORK = new Int32Array( 30 );
var IFAIL = new Int32Array( 4 );

zhbevx.ndarray( 'compute-vectors', 'all', 'lower', 4, 1, AB, 1, 2, 0, Q, 1, 4, 0, 0, 0, 0, 0, 0, out, W, 1, 0, Z, 1, 4, 0, WORK, 1, 0, RWORK, 1, 0, IWORK, 1, 0, IFAIL, 1, 0 );
```

</section>

<!-- /.examples -->

<!-- fortran-docs:start (generated by bin/fortran-docs.mjs from data/lapack-3.12.0/SRC/zhbevx.f; do not edit) -->

<section class="fortran-docs">

## Reference documentation

From the reference LAPACK 3.12.0 source of `ZHBEVX`, converted to Markdown with KaTeX math. Indices are the 1-based Fortran indices of the source.

> Computes the eigenvalues and, optionally, the left and/or right eigenvectors for OTHER matrices

### Purpose

ZHBEVX computes selected eigenvalues and, optionally, eigenvectors of a complex Hermitian band matrix A. Eigenvalues and eigenvectors can be selected by specifying either a range of values or a range of indices for the desired eigenvalues.

### Arguments

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

-   `= 'U'`: Upper triangle of A is stored;
-   `= 'L'`: Lower triangle of A is stored.

#### N `[in]`

_INTEGER_

The order of the matrix A. $N \ge 0$.

#### KD `[in]`

_INTEGER_

The number of superdiagonals of the matrix A if `UPLO = 'U'`, or the number of subdiagonals if `UPLO = 'L'`. $\mathrm{KD} \ge 0$.

#### AB `[in,out]`

_COMPLEX\*16 array, dimension (LDAB, N)_

On entry, the upper or lower triangle of the Hermitian band matrix A, stored in the first `KD`+1 rows of the array. The j-th column of A is stored in the j-th column of the array `AB` as follows: if `UPLO = 'U'`, `AB(kd+1+i-j,j) = A(i,j)` for $\max (1,j-\mathrm{kd}) \le i \le j$; if `UPLO = 'L'`, `AB(1+i-j,j) = A(i,j)` for $j \le i \le \min (n,j+\mathrm{kd})$.

On exit, `AB` is overwritten by values generated during the reduction to tridiagonal form.

#### LDAB `[in]`

_INTEGER_

The leading dimension of the array `AB`. $\mathrm{LDAB} \ge \mathrm{KD} + 1$.

#### Q `[out]`

_COMPLEX\*16 array, dimension (LDQ, N)_

If `JOBZ = 'V'`, the N-by-N unitary matrix used in the

reduction to tridiagonal form.

If `JOBZ = 'N'`, the array Q is not referenced.

#### LDQ `[in]`

_INTEGER_

The leading dimension of the array Q. If `JOBZ = 'V'`, then $\mathrm{LDQ} \ge \max (1,N)$.

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

where EPS is the machine precision. If `ABSTOL` is less than or equal to zero, then EPS\*\|T\| will be used in its place, where \|T\| is the 1-norm of the tridiagonal matrix obtained by reducing `AB` to tridiagonal form.

Eigenvalues will be computed most accurately when `ABSTOL` is set to twice the underflow threshold $2 \, \mathrm{DLAMCH}(\text{'S'})$, not zero. If this routine returns with $\mathrm{INFO}>0$, indicating that some eigenvectors did not converge, try setting `ABSTOL` to $2 \, \mathrm{DLAMCH}(\text{'S'})$.

See "Computing Small Singular Values of Bidiagonal Matrices with Guaranteed High Relative Accuracy," by Demmel and Kahan, LAPACK Working Note #3.

#### M `[out]`

_INTEGER_

The total number of eigenvalues found. $0 \le M \le N$. If `RANGE = 'A'`, $M = N$, and if `RANGE = 'I'`, $M = \mathrm{IU}-\mathrm{IL}+1$.

#### W `[out]`

_DOUBLE PRECISION array, dimension (N)_

The first M elements contain the selected eigenvalues in ascending order.

#### Z `[out]`

_COMPLEX\*16 array, dimension (LDZ, max(1,M))_

If `JOBZ = 'V'`, then if `INFO = 0`, the first M columns of Z contain the orthonormal eigenvectors of the matrix A corresponding to the selected eigenvalues, with the i-th column of Z holding the eigenvector associated with `W(i)`. If an eigenvector fails to converge, then that column of Z contains the latest approximation to the eigenvector, and the index of the eigenvector is returned in `IFAIL`. If `JOBZ = 'N'`, then Z is not referenced. Note: the user must ensure that at least max(1,M) columns are supplied in the array Z; if `RANGE = 'V'`, the exact value of M is not known in advance and an upper bound must be used.

#### LDZ `[in]`

_INTEGER_

The leading dimension of the array Z. $\mathrm{LDZ} \ge 1$, and if `JOBZ = 'V'`, $\mathrm{LDZ} \ge \max (1,N)$.

#### WORK `[out]`

_COMPLEX\*16 array, dimension (N)_

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
-   `> 0`: if `INFO = i`, then i eigenvectors failed to converge. Their indices are stored in array `IFAIL`.

</section>

<!-- fortran-docs:end -->

<!-- Section for related `stdlib` packages. Do not manually edit this section, as it is automatically populated. -->

<section class="related">

</section>

<!-- /.related -->

<!-- Section for all links. Make sure to keep an empty line after the `section` element and another before the `/section` close. -->

<section class="links">

[lapack]: https://www.netlib.org/lapack/explore-html/

[lapack-zhbevx]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__zhbevx.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->