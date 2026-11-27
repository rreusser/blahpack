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

# zhgeqz

> Computes the eigenvalues of a complex matrix pair (H,T).

<section class="usage">

## Usage

```javascript
var zhgeqz = require( '@stdlib/lapack/base/zhgeqz' );
```

#### zhgeqz( order, job, compq, compz, N, ilo, ihi, H, LDH, T, LDT, ALPHA, strideALPHA, BETA, strideBETA, Q, LDQ, Z, LDZ, WORK, strideWORK, lwork, RWORK, strideRWORK )

Computes the eigenvalues of a complex matrix pair (H,T).

```javascript
var zhgeqz = require( '@stdlib/lapack/base/zhgeqz' );

var N = 3;
var H = discreteUniform( N * N, -10, 10, opts );
var T = discreteUniform( N * N, -10, 10, opts );
var Q = discreteUniform( N * N, -10, 10, opts );
var Z = discreteUniform( N * N, -10, 10, opts );
var ALPHA = discreteUniform( N, -10, 10, opts );
var BETA = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );
var RWORK = discreteUniform( N, -10, 10, opts );

zhgeqz.ndarray( 'both', 'update', 'update', N, N, N, H, N, 1, 0, T, N, 1, 0, ALPHA, 1, 0, BETA, 1, 0, Q, N, 1, 0, Z, N, 1, 0, WORK, 1, 0, N, RWORK, 1, 0 );
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **job**: `job`.
-   **compq**: `compq`.
-   **compz**: `compz`.
-   **N**: number of columns.
-   **ilo**: `ilo`.
-   **ihi**: `ihi`.
-   **H**: input array `H`.
-   **LDH**: leading dimension of `H`.
-   **T**: input array `T`.
-   **LDT**: leading dimension of `T`.
-   **ALPHA**: input array `ALPHA`.
-   **strideALPHA**: stride length for `ALPHA`.
-   **BETA**: input array `BETA`.
-   **strideBETA**: stride length for `BETA`.
-   **Q**: input array `Q`.
-   **LDQ**: leading dimension of `Q`.
-   **Z**: input array `Z`.
-   **LDZ**: leading dimension of `Z`.
-   **WORK**: input array `WORK`.
-   **strideWORK**: stride length for `WORK`.
-   **lwork**: `lwork`.
-   **RWORK**: input array `RWORK`.
-   **strideRWORK**: stride length for `RWORK`.

#### zhgeqz.ndarray( job, compq, compz, N, ilo, ihi, H, strideH1, strideH2, offsetH, T, strideT1, strideT2, offsetT, ALPHA, strideALPHA, offsetALPHA, BETA, strideBETA, offsetBETA, Q, strideQ1, strideQ2, offsetQ, Z, strideZ1, strideZ2, offsetZ, WORK, strideWORK, offsetWORK, lwork, RWORK, strideRWORK, offsetRWORK )

Computes the eigenvalues of a complex matrix pair (H,T), using alternative indexing semantics.

```javascript
var zhgeqz = require( '@stdlib/lapack/base/zhgeqz' );

var N = 3;
var H = discreteUniform( N * N, -10, 10, opts );
var T = discreteUniform( N * N, -10, 10, opts );
var Q = discreteUniform( N * N, -10, 10, opts );
var Z = discreteUniform( N * N, -10, 10, opts );
var ALPHA = discreteUniform( N, -10, 10, opts );
var BETA = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );
var RWORK = discreteUniform( N, -10, 10, opts );

zhgeqz.ndarray( 'both', 'update', 'update', N, N, N, H, N, 1, 0, T, N, 1, 0, ALPHA, 1, 0, BETA, 1, 0, Q, N, 1, 0, Z, N, 1, 0, WORK, 1, 0, N, RWORK, 1, 0 );
```

The function has the following additional parameters:

-   **strideH1**: stride of dimension 1 of `H`.
-   **strideH2**: stride of dimension 2 of `H`.
-   **offsetH**: starting index for `H`.
-   **strideT1**: stride of dimension 1 of `T`.
-   **strideT2**: stride of dimension 2 of `T`.
-   **offsetT**: starting index for `T`.
-   **offsetALPHA**: starting index for `ALPHA`.
-   **offsetBETA**: starting index for `BETA`.
-   **strideQ1**: stride of dimension 1 of `Q`.
-   **strideQ2**: stride of dimension 2 of `Q`.
-   **offsetQ**: starting index for `Q`.
-   **strideZ1**: stride of dimension 1 of `Z`.
-   **strideZ2**: stride of dimension 2 of `Z`.
-   **offsetZ**: starting index for `Z`.
-   **offsetWORK**: starting index for `WORK`.
-   **offsetRWORK**: starting index for `RWORK`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `zhgeqz()` corresponds to the [LAPACK][lapack] level routine [`zhgeqz`][lapack-zhgeqz].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var zhgeqz = require( '@stdlib/lapack/base/zhgeqz' );

var N = 3;
var H = discreteUniform( N * N, -10, 10, opts );
var T = discreteUniform( N * N, -10, 10, opts );
var Q = discreteUniform( N * N, -10, 10, opts );
var Z = discreteUniform( N * N, -10, 10, opts );
var ALPHA = discreteUniform( N, -10, 10, opts );
var BETA = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );
var RWORK = discreteUniform( N, -10, 10, opts );

zhgeqz.ndarray( 'both', 'update', 'update', N, N, N, H, N, 1, 0, T, N, 1, 0, ALPHA, 1, 0, BETA, 1, 0, Q, N, 1, 0, Z, N, 1, 0, WORK, 1, 0, N, RWORK, 1, 0 );
```

</section>

<!-- /.examples -->

<!-- fortran-docs:start (generated by bin/fortran-docs.mjs from data/lapack-3.12.0/SRC/zhgeqz.f; do not edit) -->

<section class="fortran-docs">

## Reference documentation

From the reference LAPACK 3.12.0 source of `ZHGEQZ`, converted to Markdown with KaTeX math. Indices are the 1-based Fortran indices of the source.

### Purpose

ZHGEQZ computes the eigenvalues of a complex matrix pair (H,T), where H is an upper Hessenberg matrix and T is upper triangular, using the single-shift QZ method. Matrix pairs of this type are produced by the reduction to generalized upper Hessenberg form of a complex matrix pair (A,B):

$$
A = Q_{1} \, H \, Z_{1}^H, B = Q_{1} \, T \, Z_{1}^H
$$

as computed by ZGGHRD.

If `JOB='S'`, then the Hessenberg-triangular pair (H,T) is also reduced to generalized Schur form,

$$
H = Q \, S \, Z^H, T = Q \, P \, Z^H
$$

where Q and Z are unitary matrices and S and P are upper triangular.

Optionally, the unitary matrix Q from the generalized Schur factorization may be postmultiplied into an input matrix Q1, and the unitary matrix Z may be postmultiplied into an input matrix Z1. If Q1 and Z1 are the unitary matrices from ZGGHRD that reduced the matrix pair (A,B) to generalized Hessenberg form, then the output matrices $Q_{1} \, Q$ and $Z_{1} \, Z$ are the unitary factors from the generalized Schur factorization of (A,B):

$$
A = (Q_{1} \, Q) \, S \, (Z_{1} \, Z)^H, B = (Q_{1} \, Q) \, P \, (Z_{1} \, Z)^H
$$

To avoid overflow, eigenvalues of the matrix pair (H,T) (equivalently, of (A,B)) are computed as a pair of complex values ($\alpha$,$\beta$). If $\beta$ is nonzero, $\lambda = \alpha / \beta$ is an eigenvalue of the generalized nonsymmetric eigenvalue problem (GNEP)

$$
A \, x = \lambda \, B \, x
$$

and if $\alpha$ is nonzero, $\mu = \beta / \alpha$ is an eigenvalue of the alternate form of the GNEP

$$
\mu \, A \, y = B \, y
$$

The values of $\alpha$ and $\beta$ for the i-th eigenvalue can be read directly from the generalized Schur form: $\alpha = S(i,i)$, $\beta = P(i,i)$.

Ref: C.B. Moler & G.W. Stewart, "An Algorithm for Generalized Matrix

-   Eigenvalue Problems", SIAM J. Numer. Anal., 10(1973),
-   pp. 241--256.

### Arguments

#### JOB `[in]`

_CHARACTER\*1_

-   `= 'E'`: Compute eigenvalues only;
-   `= 'S'`: Computer eigenvalues and the Schur form.

#### COMPQ `[in]`

_CHARACTER\*1_

-   `= 'N'`: Left Schur vectors (Q) are not computed;
-   `= 'I'`: Q is initialized to the unit matrix and the matrix Q of left Schur vectors of (H,T) is returned;
-   `= 'V'`: Q must contain a unitary matrix Q1 on entry and the product $Q_{1} \, Q$ is returned.

#### COMPZ `[in]`

_CHARACTER\*1_

-   `= 'N'`: Right Schur vectors (Z) are not computed;
-   `= 'I'`: Q is initialized to the unit matrix and the matrix Z of right Schur vectors of (H,T) is returned;
-   `= 'V'`: Z must contain a unitary matrix Z1 on entry and the product $Z_{1} \, Z$ is returned.

#### N `[in]`

_INTEGER_

The order of the matrices H, T, Q, and Z. $N \ge 0$.

#### ILO `[in]`

_INTEGER_

#### IHI `[in]`

_INTEGER_

`ILO` and `IHI` mark the rows and columns of H which are in Hessenberg form. It is assumed that A is already upper triangular in rows and columns 1:`ILO`-1 and `IHI`+1:N. If $N > 0$, $1 \le \mathrm{ILO} \le \mathrm{IHI} \le N$; if $N = 0$, `ILO=1` and `IHI=0`.

#### H `[in,out]`

_COMPLEX\*16 array, dimension (LDH, N)_

On entry, the N-by-N upper Hessenberg matrix H. On exit, if `JOB = 'S'`, H contains the upper triangular matrix S from the generalized Schur factorization. If `JOB = 'E'`, the diagonal of H matches that of S, but the rest of H is unspecified.

#### LDH `[in]`

_INTEGER_

The leading dimension of the array H. $\mathrm{LDH} \ge \max ( 1, N )$.

#### T `[in,out]`

_COMPLEX\*16 array, dimension (LDT, N)_

On entry, the N-by-N upper triangular matrix T. On exit, if `JOB = 'S'`, T contains the upper triangular matrix P from the generalized Schur factorization. If `JOB = 'E'`, the diagonal of T matches that of P, but the rest of T is unspecified.

#### LDT `[in]`

_INTEGER_

The leading dimension of the array T. $\mathrm{LDT} \ge \max ( 1, N )$.

#### ALPHA `[out]`

_COMPLEX\*16 array, dimension (N)_

The complex scalars $\alpha$ that define the eigenvalues of GNEP. `ALPHA(i) = S(i,i)` in the generalized Schur factorization.

#### BETA `[out]`

_COMPLEX\*16 array, dimension (N)_

The real non-negative scalars $\beta$ that define the eigenvalues of GNEP. `BETA(i) = P(i,i)` in the generalized Schur factorization.

Together, the quantities $\alpha = \mathrm{ALPHA}(j)$ and $\beta = \mathrm{BETA}(j)$ represent the j-th eigenvalue of the matrix pair (A,B), in one of the forms $\lambda = \alpha /\beta$ or $\mu = \beta /\alpha$. Since either $\lambda$ or $\mu$ may overflow, they should not, in general, be computed.

#### Q `[in,out]`

_COMPLEX\*16 array, dimension (LDQ, N)_

On entry, if `COMPQ = 'V'`, the unitary matrix Q1 used in the reduction of (A,B) to generalized Hessenberg form. On exit, if `COMPQ = 'I'`, the unitary matrix of left Schur vectors of (H,T), and if `COMPQ = 'V'`, the unitary matrix of left Schur vectors of (A,B). Not referenced if `COMPQ = 'N'`.

#### LDQ `[in]`

_INTEGER_

The leading dimension of the array Q. $\mathrm{LDQ} \ge 1$. If `COMPQ='V'` or 'I', then $\mathrm{LDQ} \ge N$.

#### Z `[in,out]`

_COMPLEX\*16 array, dimension (LDZ, N)_

On entry, if `COMPZ = 'V'`, the unitary matrix Z1 used in the reduction of (A,B) to generalized Hessenberg form. On exit, if `COMPZ = 'I'`, the unitary matrix of right Schur vectors of (H,T), and if `COMPZ = 'V'`, the unitary matrix of right Schur vectors of (A,B). Not referenced if `COMPZ = 'N'`.

#### LDZ `[in]`

_INTEGER_

The leading dimension of the array Z. $\mathrm{LDZ} \ge 1$. If `COMPZ='V'` or 'I', then $\mathrm{LDZ} \ge N$.

#### WORK `[out]`

_COMPLEX\*16 array, dimension (MAX(1,LWORK))_

On exit, if $\mathrm{INFO} \ge 0$, `WORK(1)` returns the optimal `LWORK`.

#### LWORK `[in]`

_INTEGER_

The dimension of the array `WORK`. $\mathrm{LWORK} \ge \max (1,N)$.

If `LWORK = -1`, then a workspace query is assumed; the routine only calculates the optimal size of the `WORK` array, returns this value as the first entry of the `WORK` array, and no error message related to `LWORK` is issued by XERBLA.

#### RWORK `[out]`

_DOUBLE PRECISION array, dimension (N)_

#### INFO `[out]`

_INTEGER_

-   `= 0`: successful exit
-   `< 0`: if `INFO = -i`, the i-th argument had an illegal value
-   `= 1,...,N`: the QZ iteration did not converge.  (H,T) is not in Schur form, but `ALPHA(i)` and `BETA(i)`, $i=\mathrm{INFO}+1$,...,N should be correct. = N+1,...,$2 \, N$: the shift calculation failed.  (H,T) is not in Schur form, but `ALPHA(i)` and `BETA(i)`, $i=\mathrm{INFO}-N+1$,...,N should be correct.

### Further Details

We assume that complex ABS works as long as its value is less than overflow.

</section>

<!-- fortran-docs:end -->

<!-- Section for related `stdlib` packages. Do not manually edit this section, as it is automatically populated. -->

<section class="related">

</section>

<!-- /.related -->

<!-- Section for all links. Make sure to keep an empty line after the `section` element and another before the `/section` close. -->

<section class="links">

[lapack]: https://www.netlib.org/lapack/explore-html/

[lapack-zhgeqz]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__zhgeqz.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->