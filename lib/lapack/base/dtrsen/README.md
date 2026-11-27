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

## Reference notes

The mathematical description from the reference LAPACK 3.12.0 source of `DTRSEN`. Indices are the 1-based Fortran indices of the source.

### Purpose

DTRSEN reorders the real Schur factorization of a real matrix $A = Q \, T \, Q^T$, so that a selected cluster of eigenvalues appears in the leading diagonal blocks of the upper quasi-triangular matrix T, and the leading columns of Q form an orthonormal basis of the corresponding right invariant subspace.

Optionally the routine computes the reciprocal condition numbers of the cluster of eigenvalues and/or the invariant subspace.

T must be in Schur canonical form (as returned by DHSEQR), that is, block upper triangular with 1-by-1 and 2-by-2 diagonal blocks; each 2-by-2 diagonal block has its diagonal elements equal and its off-diagonal elements of opposite sign.

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