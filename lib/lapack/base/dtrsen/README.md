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

# dtrsen

> Reorders the real Schur factorization of a real matrix A = Q·T·Qᵀ, so that a selected cluster of eigenvalues appears in the leading diagonal blocks of the upper quasi-triangular matrix T, and the leading columns of Q form an orthonormal basis of the corresponding right invariant subspace.

<section class="usage">

## Usage

```javascript
var dtrsen = require( '@stdlib/lapack/base/dtrsen' );
```

#### dtrsen( job, compq, SELECT, strideSELECT, N, T, LDT, Q, LDQ, WR, strideWR, WI, strideWI, M, s, sep, WORK, strideWORK, lwork, IWORK, strideIWORK, liwork )

Reorders the real Schur factorization of a real matrix A = Q·T·Qᵀ, so that a selected cluster of eigenvalues appears in the leading diagonal blocks of the upper quasi-triangular matrix T, and the leading columns of Q form an orthonormal basis of the corresponding right invariant subspace.

```javascript
var dtrsen = require( '@stdlib/lapack/base/dtrsen' );

var N = 3;
var T = discreteUniform( N * N, -10, 10, opts );
var Q = discreteUniform( N * N, -10, 10, opts );
var SELECT = discreteUniform( N, -10, 10, opts );
var WR = discreteUniform( N, -10, 10, opts );
var WI = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );
var IWORK = discreteUniform( N, -10, 10, opts );

dtrsen.ndarray( 'both', 'update', SELECT, 1, 0, N, T, N, 1, 0, Q, N, 1, 0, WR, 1, 0, WI, 1, 0, N, 1.0, 1, WORK, 1, 0, N, IWORK, 1, 0, 1 );
```

The function has the following parameters:

-   **job**: `job`.
-   **compq**: `compq`.
-   **SELECT**: input array `SELECT`.
-   **strideSELECT**: stride length for `SELECT`.
-   **N**: number of columns.
-   **T**: input array `T`.
-   **LDT**: leading dimension of `T`.
-   **Q**: input array `Q`.
-   **LDQ**: leading dimension of `Q`.
-   **WR**: input array `WR`.
-   **strideWR**: stride length for `WR`.
-   **WI**: input array `WI`.
-   **strideWI**: stride length for `WI`.
-   **M**: number of rows.
-   **s**: `s`.
-   **sep**: `sep`.
-   **WORK**: input array `WORK`.
-   **strideWORK**: stride length for `WORK`.
-   **lwork**: `lwork`.
-   **IWORK**: input array `IWORK`.
-   **strideIWORK**: stride length for `IWORK`.
-   **liwork**: `liwork`.

#### dtrsen.ndarray( job, compq, SELECT, strideSELECT, offsetSELECT, N, T, strideT1, strideT2, offsetT, Q, strideQ1, strideQ2, offsetQ, WR, strideWR, offsetWR, WI, strideWI, offsetWI, M, s, sep, WORK, strideWORK, offsetWORK, lwork, IWORK, strideIWORK, offsetIWORK, liwork )

Reorders the real Schur factorization of a real matrix A = Q·T·Qᵀ, so that a selected cluster of eigenvalues appears in the leading diagonal blocks of the upper quasi-triangular matrix T, and the leading columns of Q form an orthonormal basis of the corresponding right invariant subspace,, using alternative indexing semantics.

```javascript
var dtrsen = require( '@stdlib/lapack/base/dtrsen' );

var N = 3;
var T = discreteUniform( N * N, -10, 10, opts );
var Q = discreteUniform( N * N, -10, 10, opts );
var SELECT = discreteUniform( N, -10, 10, opts );
var WR = discreteUniform( N, -10, 10, opts );
var WI = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );
var IWORK = discreteUniform( N, -10, 10, opts );

dtrsen.ndarray( 'both', 'update', SELECT, 1, 0, N, T, N, 1, 0, Q, N, 1, 0, WR, 1, 0, WI, 1, 0, N, 1.0, 1, WORK, 1, 0, N, IWORK, 1, 0, 1 );
```

The function has the following additional parameters:

-   **offsetSELECT**: starting index for `SELECT`.
-   **strideT1**: stride of dimension 1 of `T`.
-   **strideT2**: stride of dimension 2 of `T`.
-   **offsetT**: starting index for `T`.
-   **strideQ1**: stride of dimension 1 of `Q`.
-   **strideQ2**: stride of dimension 2 of `Q`.
-   **offsetQ**: starting index for `Q`.
-   **offsetWR**: starting index for `WR`.
-   **offsetWI**: starting index for `WI`.
-   **offsetWORK**: starting index for `WORK`.
-   **offsetIWORK**: starting index for `IWORK`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `dtrsen()` corresponds to the [LAPACK][lapack] level routine [`dtrsen`][lapack-dtrsen].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var dtrsen = require( '@stdlib/lapack/base/dtrsen' );

var N = 3;
var T = discreteUniform( N * N, -10, 10, opts );
var Q = discreteUniform( N * N, -10, 10, opts );
var SELECT = discreteUniform( N, -10, 10, opts );
var WR = discreteUniform( N, -10, 10, opts );
var WI = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );
var IWORK = discreteUniform( N, -10, 10, opts );

dtrsen.ndarray( 'both', 'update', SELECT, 1, 0, N, T, N, 1, 0, Q, N, 1, 0, WR, 1, 0, WI, 1, 0, N, 1.0, 1, WORK, 1, 0, N, IWORK, 1, 0, 1 );
```

</section>

<!-- /.examples -->

<!-- fortran-docs:start (generated by bin/fortran-docs.mjs from data/lapack-3.12.0/SRC/dtrsen.f; do not edit) -->

<section class="fortran-docs">

## Reference documentation

From the reference LAPACK 3.12.0 source of `DTRSEN`, converted to Markdown with KaTeX math. Indices are the 1-based Fortran indices of the source.

### Purpose

DTRSEN reorders the real Schur factorization of a real matrix $A = Q \, T \, Q^T$, so that a selected cluster of eigenvalues appears in the leading diagonal blocks of the upper quasi-triangular matrix T, and the leading columns of Q form an orthonormal basis of the corresponding right invariant subspace.

Optionally the routine computes the reciprocal condition numbers of the cluster of eigenvalues and/or the invariant subspace.

T must be in Schur canonical form (as returned by DHSEQR), that is, block upper triangular with 1-by-1 and 2-by-2 diagonal blocks; each 2-by-2 diagonal block has its diagonal elements equal and its off-diagonal elements of opposite sign.

### Arguments

#### JOB `[in]`

_CHARACTER\*1_

Specifies whether condition numbers are required for the cluster of eigenvalues (S) or the invariant subspace (`SEP`):

-   `= 'N'`: none;
-   `= 'E'`: for eigenvalues only (S);
-   `= 'V'`: for invariant subspace only (`SEP`);
-   `= 'B'`: for both eigenvalues and invariant subspace (S and `SEP`).

#### COMPQ `[in]`

_CHARACTER\*1_

-   `= 'V'`: update the matrix Q of Schur vectors;
-   `= 'N'`: do not update Q.

#### SELECT `[in]`

_LOGICAL array, dimension (N)_

`SELECT` specifies the eigenvalues in the selected cluster. To select a real eigenvalue w(j), `SELECT(j)` must be set to .TRUE.. To select a complex conjugate pair of eigenvalues w(j) and w(j+1), corresponding to a 2-by-2 diagonal block, either `SELECT(j)` or `SELECT(j+1)` or both must be set to .TRUE.; a complex conjugate pair of eigenvalues must be either both included in the cluster or both excluded.

#### N `[in]`

_INTEGER_

The order of the matrix T. $N \ge 0$.

#### T `[in,out]`

_DOUBLE PRECISION array, dimension (LDT,N)_

On entry, the upper quasi-triangular matrix T, in Schur canonical form. On exit, T is overwritten by the reordered matrix T, again in Schur canonical form, with the selected eigenvalues in the leading diagonal blocks.

#### LDT `[in]`

_INTEGER_

The leading dimension of the array T. $\mathrm{LDT} \ge \max (1,N)$.

#### Q `[in,out]`

_DOUBLE PRECISION array, dimension (LDQ,N)_

On entry, if `COMPQ = 'V'`, the matrix Q of Schur vectors. On exit, if `COMPQ = 'V'`, Q has been postmultiplied by the orthogonal transformation matrix which reorders T; the leading M columns of Q form an orthonormal basis for the specified invariant subspace. If `COMPQ = 'N'`, Q is not referenced.

#### LDQ `[in]`

_INTEGER_

The leading dimension of the array Q. $\mathrm{LDQ} \ge 1$; and if `COMPQ = 'V'`, $\mathrm{LDQ} \ge N$.

#### WR `[out]`

_DOUBLE PRECISION array, dimension (N)_

#### WI `[out]`

_DOUBLE PRECISION array, dimension (N)_

The real and imaginary parts, respectively, of the reordered eigenvalues of T. The eigenvalues are stored in the same order as on the diagonal of T, with `WR(i) = T(i,i)` and, if `T(i:i+1,i:i+1)` is a 2-by-2 diagonal block, $\mathrm{WI}(i) > 0$ and `WI(i+1) = -WI(i)`. Note that if a complex eigenvalue is sufficiently ill-conditioned, then its value may differ significantly from its value before reordering.

#### M `[out]`

_INTEGER_

The dimension of the specified invariant subspace. 0 \< = $M \le N$.

#### S `[out]`

_DOUBLE PRECISION_

If `JOB = 'E'` or 'B', S is a lower bound on the reciprocal condition number for the selected cluster of eigenvalues. S cannot underestimate the true reciprocal condition number by more than a factor of sqrt(N). If $M = 0$ or N, $S = 1$. If `JOB = 'N'` or 'V', S is not referenced.

#### SEP `[out]`

_DOUBLE PRECISION_

If `JOB = 'V'` or 'B', `SEP` is the estimated reciprocal condition number of the specified invariant subspace. If $M = 0$ or N, `SEP = norm(T)`. If `JOB = 'N'` or 'E', `SEP` is not referenced.

#### WORK `[out]`

_DOUBLE PRECISION array, dimension (MAX(1,LWORK))_

On exit, if `INFO = 0`, `WORK(1)` returns the optimal `LWORK`.

#### LWORK `[in]`

_INTEGER_

The dimension of the array `WORK`. If `JOB = 'N'`, $\mathrm{LWORK} \ge \max (1,N)$; if `JOB = 'E'`, $\mathrm{LWORK} \ge \max (1,M \, (N-M))$; if `JOB = 'V'` or 'B', $\mathrm{LWORK} \ge \max (1,2 \, M \, (N-M))$.

If `LWORK = -1`, then a workspace query is assumed; the routine only calculates the optimal size of the `WORK` array, returns this value as the first entry of the `WORK` array, and no error message related to `LWORK` is issued by XERBLA.

#### IWORK `[out]`

_INTEGER array, dimension (MAX(1,LIWORK))_

On exit, if `INFO = 0`, `IWORK(1)` returns the optimal `LIWORK`.

#### LIWORK `[in]`

_INTEGER_

The dimension of the array `IWORK`. If `JOB = 'N'` or 'E', $\mathrm{LIWORK} \ge 1$; if `JOB = 'V'` or 'B', $\mathrm{LIWORK} \ge \max (1,M \, (N-M))$.

If `LIWORK = -1`, then a workspace query is assumed; the routine only calculates the optimal size of the `IWORK` array, returns this value as the first entry of the `IWORK` array, and no error message related to `LIWORK` is issued by XERBLA.

#### INFO `[out]`

_INTEGER_

-   `= 0`: successful exit
-   `< 0`: if `INFO = -i`, the i-th argument had an illegal value
-   `= 1`: reordering of T failed because some eigenvalues are too close to separate (the problem is very ill-conditioned); T may have been partially reordered, and `WR` and `WI` contain the eigenvalues in the same order as in T; S and `SEP` (if requested) are set to zero.

### Further Details

DTRSEN first collects the selected eigenvalues by computing an orthogonal transformation Z to move them to the top left corner of T. In other words, the selected eigenvalues are the eigenvalues of T11 in:

```text
Z**T * T * Z = ( T11 T12 ) n1
               (  0  T22 ) n2
                  n1  n2
```

where $N = n_{1}+n_{2}$ and $Z^T$ means the transpose of Z. The first n1 columns of Z span the specified invariant subspace of T.

If T has been obtained from the real Schur factorization of a matrix $A = Q \, T \, Q^T$, then the reordered real Schur factorization of A is given by $A = (Q \, Z) \, (Z^T \, T \, Z) \, (Q \, Z)^T$, and the first n1 columns of $Q \, Z$ span the corresponding invariant subspace of A.

The reciprocal condition number of the average of the eigenvalues of T11 may be returned in S. S lies between 0 (very badly conditioned) and 1 (very well conditioned). It is computed as follows. First we compute R so that

```text
P = ( I  R ) n1
    ( 0  0 ) n2
      n1 n2
```

is the projector on the invariant subspace associated with T11. R is the solution of the Sylvester equation:

$$
T_{11} \, R - R \, T_{22} = T_{12}
$$

Let F-norm(M) denote the Frobenius-norm of M and 2-norm(M) denote the two-norm of M. Then S is computed as the lower bound

$$
(1 + F-\operatorname{norm}(R)^2)^{-1/2}
$$

on the reciprocal of 2-norm(P), the true reciprocal condition number. S cannot underestimate 1 / 2-norm(P) by more than a factor of sqrt(N).

An approximate error bound for the computed average of the eigenvalues of T11 is

$$
\mathrm{EPS} \, \operatorname{norm}(T) / S
$$

where EPS is the machine precision.

The reciprocal condition number of the right invariant subspace spanned by the first n1 columns of Z (or of $Q \, Z$) is returned in `SEP`. `SEP` is defined as the separation of T11 and T22:

sep( T11, T22 ) = $\sigma$-min( C )

where $\sigma$-min(C) is the smallest singular value of the $n_{1} \, n_{2}$-by-$n_{1} \, n_{2}$ matrix

C = kprod( I(n2), T11 ) - kprod( transpose(T22), I(n1) )

I(m) is an m by m identity matrix, and kprod denotes the Kronecker product. We estimate $\sigma$-min(C) by the reciprocal of an estimate of the 1-norm of inverse(C). The true reciprocal 1-norm of inverse(C) cannot differ from $\sigma$-min(C) by more than a factor of sqrt(n1\*n2).

When `SEP` is small, small changes in T can cause large changes in the invariant subspace. An approximate bound on the maximum angular error in the computed right invariant subspace is

$$
\mathrm{EPS} \, \operatorname{norm}(T) / \mathrm{SEP}
$$

</section>

<!-- fortran-docs:end -->

<!-- Section for related `stdlib` packages. Do not manually edit this section, as it is automatically populated. -->

<section class="related">

</section>

<!-- /.related -->

<!-- Section for all links. Make sure to keep an empty line after the `section` element and another before the `/section` close. -->

<section class="links">

[lapack]: https://www.netlib.org/lapack/explore-html/

[lapack-dtrsen]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__dtrsen.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->