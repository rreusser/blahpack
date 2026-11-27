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

# ztgsen

> Reorders the generalized Schur decomposition of a complex matrix pair (A, B) (in terms of an unitary equivalence transformation Qᴴ·(A, B)·Z), so that a selected cluster of eigenvalues appears in the leading diagonal blocks of the pair (A,B)

<section class="usage">

## Usage

```javascript
var ztgsen = require( '@stdlib/lapack/base/ztgsen' );
```

#### ztgsen( order, ijob, wantq, wantz, SELECT, strideSELECT, N, A, LDA, B, LDB, ALPHA, strideALPHA, BETA, strideBETA, Q, LDQ, Z, LDZ, M, pl, pr, DIF, strideDIF, WORK, strideWORK, IWORK, strideIWORK, offsetIWORK )

Reorders the generalized Schur decomposition of a complex matrix pair (A, B) (in terms of an unitary equivalence transformation Qᴴ·(A, B)·Z), so that a selected cluster of eigenvalues appears in the leading diagonal blocks of the pair (A,B)

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Complex128Array = require( '@stdlib/array/complex128' );
var Int32Array = require( '@stdlib/array/int32' );
var Uint8Array = require( '@stdlib/array/uint8' );
var ztgsen = require( '@stdlib/lapack/base/ztgsen' );

var A = new Complex128Array( [ 2.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.5, -0.2, 4.0, 0.0, 0.0, 0.0, 0.3, 0.1, 0.7, -0.3, 6.0, -1.0 ] );
var B = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.1, 0.05, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.2, -0.1, 1.0, 0.0 ] );
var Q = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0 ] );
var Z = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0 ] );
var SELECT = new Uint8Array( [ 1, 0, 1 ] );
var ALPHA = new Complex128Array( 3 );
var BETA = new Complex128Array( 3 );
var DIF = new Float64Array( 2 );
var WORK = new Complex128Array( 64 );
var IWORK = new Int32Array( 64 );

ztgsen( 'column-major', 0, true, true, SELECT, 1, 3, A, 3, B, 3, ALPHA, 1, BETA, 1, Q, 3, Z, 3, 0, 1.0, 1.0, DIF, 1, WORK, 1, -1, IWORK, 1, 0, -1 );
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **ijob**: ijob.
-   **wantq**: wantq.
-   **wantz**: wantz.
-   **SELECT**: input array.
-   **strideSELECT**: stride length for `SELECT`.
-   **N**: number of columns.
-   **A**: input matrix.
-   **LDA**: leading dimension of `A`.
-   **B**: input matrix.
-   **LDB**: leading dimension of `B`.
-   **ALPHA**: input array.
-   **strideALPHA**: stride length for `ALPHA`.
-   **BETA**: input array.
-   **strideBETA**: stride length for `BETA`.
-   **Q**: input matrix.
-   **LDQ**: leading dimension of `Q`.
-   **Z**: input matrix.
-   **LDZ**: leading dimension of `Z`.
-   **M**: number of rows.
-   **pl**: pl.
-   **pr**: pr.
-   **DIF**: input array.
-   **strideDIF**: stride length for `DIF`.
-   **WORK**: input array.
-   **strideWORK**: stride length for `WORK`.
-   **IWORK**: output array.
-   **strideIWORK**: stride length for `IWORK`.
-   **offsetIWORK**: starting index for `IWORK`.

#### ztgsen.ndarray( ijob, wantq, wantz, SELECT, strideSELECT, offsetSELECT, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, ALPHA, strideALPHA, offsetALPHA, BETA, strideBETA, offsetBETA, Q, strideQ1, strideQ2, offsetQ, Z, strideZ1, strideZ2, offsetZ, M, pl, pr, DIF, strideDIF, offsetDIF, WORK, strideWORK, offsetWORK, IWORK, strideIWORK, offsetIWORK )

Reorders the generalized Schur decomposition of a complex matrix pair (A, B) (in terms of an unitary equivalence transformation Qᴴ·(A, B)·Z), so that a selected cluster of eigenvalues appears in the leading diagonal blocks of the pair (A,B), using alternative indexing semantics.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Complex128Array = require( '@stdlib/array/complex128' );
var Int32Array = require( '@stdlib/array/int32' );
var Uint8Array = require( '@stdlib/array/uint8' );
var ztgsen = require( '@stdlib/lapack/base/ztgsen' );

var A = new Complex128Array( [ 2.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.5, -0.2, 4.0, 0.0, 0.0, 0.0, 0.3, 0.1, 0.7, -0.3, 6.0, -1.0 ] );
var B = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.1, 0.05, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.2, -0.1, 1.0, 0.0 ] );
var Q = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0 ] );
var Z = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0 ] );
var SELECT = new Uint8Array( [ 1, 0, 1 ] );
var ALPHA = new Complex128Array( 3 );
var BETA = new Complex128Array( 3 );
var DIF = new Float64Array( 2 );
var WORK = new Complex128Array( 64 );
var IWORK = new Int32Array( 64 );

ztgsen( 'column-major', 0, true, true, SELECT, 1, 3, A, 3, B, 3, ALPHA, 1, BETA, 1, Q, 3, Z, 3, 0, 1.0, 1.0, DIF, 1, WORK, 1, -1, IWORK, 1, 0, -1 );
```

The function has the following additional parameters:

-   **ijob**: ijob.
-   **wantq**: wantq.
-   **wantz**: wantz.
-   **SELECT**: input array.
-   **strideSELECT**: stride length for `SELECT`.
-   **offsetSELECT**: starting index for `SELECT`.
-   **N**: number of columns.
-   **A**: input matrix.
-   **strideA1**: stride of dimension 1 of `A`.
-   **strideA2**: stride of dimension 2 of `A`.
-   **offsetA**: starting index for `A`.
-   **B**: input matrix.
-   **strideB1**: stride of dimension 1 of `B`.
-   **strideB2**: stride of dimension 2 of `B`.
-   **offsetB**: starting index for `B`.
-   **ALPHA**: input array.
-   **strideALPHA**: stride length for `ALPHA`.
-   **offsetALPHA**: starting index for `ALPHA`.
-   **BETA**: input array.
-   **strideBETA**: stride length for `BETA`.
-   **offsetBETA**: starting index for `BETA`.
-   **Q**: input matrix.
-   **strideQ1**: stride of dimension 1 of `Q`.
-   **strideQ2**: stride of dimension 2 of `Q`.
-   **offsetQ**: starting index for `Q`.
-   **Z**: input matrix.
-   **strideZ1**: stride of dimension 1 of `Z`.
-   **strideZ2**: stride of dimension 2 of `Z`.
-   **offsetZ**: starting index for `Z`.
-   **M**: number of rows.
-   **pl**: pl.
-   **pr**: pr.
-   **DIF**: input array.
-   **strideDIF**: stride length for `DIF`.
-   **offsetDIF**: starting index for `DIF`.
-   **WORK**: input array.
-   **strideWORK**: stride length for `WORK`.
-   **offsetWORK**: starting index for `WORK`.
-   **IWORK**: output array.
-   **strideIWORK**: stride length for `IWORK`.
-   **offsetIWORK**: starting index for `IWORK`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   See LAPACK reference documentation for full algorithmic details.
</section>

<!-- /.notes -->

<section class="examples">

## Examples

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Complex128Array = require( '@stdlib/array/complex128' );
var Int32Array = require( '@stdlib/array/int32' );
var Uint8Array = require( '@stdlib/array/uint8' );
var ztgsen = require( '@stdlib/lapack/base/ztgsen' );

var A = new Complex128Array( [ 2.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.5, -0.2, 4.0, 0.0, 0.0, 0.0, 0.3, 0.1, 0.7, -0.3, 6.0, -1.0 ] );
var B = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.1, 0.05, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.2, -0.1, 1.0, 0.0 ] );
var Q = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0 ] );
var Z = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0 ] );
var SELECT = new Uint8Array( [ 1, 0, 1 ] );
var ALPHA = new Complex128Array( 3 );
var BETA = new Complex128Array( 3 );
var DIF = new Float64Array( 2 );
var WORK = new Complex128Array( 64 );
var IWORK = new Int32Array( 64 );

ztgsen( 'column-major', 0, true, true, SELECT, 1, 3, A, 3, B, 3, ALPHA, 1, BETA, 1, Q, 3, Z, 3, 0, 1.0, 1.0, DIF, 1, WORK, 1, -1, IWORK, 1, 0, -1 );
```

</section>

<!-- /.examples -->

<!-- fortran-docs:start (generated by bin/fortran-docs.mjs from data/lapack-3.12.0/SRC/ztgsen.f; do not edit) -->

<section class="fortran-docs">

## Reference documentation

From the reference LAPACK 3.12.0 source of `ZTGSEN`, converted to Markdown with KaTeX math. Indices are the 1-based Fortran indices of the source.

### Purpose

ZTGSEN reorders the generalized Schur decomposition of a complex matrix pair (A, B) (in terms of an unitary equivalence trans- formation $Q^H \, (A, B) \, Z$), so that a selected cluster of eigenvalues appears in the leading diagonal blocks of the pair (A,B). The leading columns of Q and Z form unitary bases of the corresponding left and right eigenspaces (deflating subspaces). (A, B) must be in generalized Schur canonical form, that is, A and B are both upper triangular.

ZTGSEN also computes the generalized eigenvalues

$$
w(j)= \mathrm{ALPHA}(j) / \mathrm{BETA}(j)
$$

of the reordered matrix pair (A, B).

Optionally, the routine computes estimates of reciprocal condition numbers for eigenvalues and eigenspaces. These are Difu\[(A11,B11), (A22,B22)\] and Difl\[(A11,B11), (A22,B22)\], i.e. the separation(s) between the matrix pairs (A11, B11) and (A22,B22) that correspond to the selected cluster and the eigenvalues outside the cluster, resp., and norms of "projections" onto left and right eigenspaces w.r.t. the selected cluster in the (1,1)-block.

### Arguments

#### IJOB `[in]`

_INTEGER_

Specifies whether condition numbers are required for the cluster of eigenvalues (`PL` and `PR`) or the deflating subspaces (Difu and Difl):

-   `=0`: Only reorder w.r.t. `SELECT`. No extras.
-   `=1`: Reciprocal of norms of "projections" onto left and right eigenspaces w.r.t. the selected cluster (`PL` and `PR`).
-   `=2`: Upper bounds on Difu and Difl. F-norm-based estimate (`DIF(1:2)`).
-   `=3`: Estimate of Difu and Difl. 1-norm-based estimate (`DIF(1:2)`). About 5 times as expensive as `IJOB = 2`.
-   `=4`: Compute `PL`, `PR` and `DIF` (i.e. 0, 1 and 2 above): Economic version to get it all.
-   `=5`: Compute `PL`, `PR` and `DIF` (i.e. 0, 1 and 3 above)

#### WANTQ `[in]`

_LOGICAL_

.TRUE. : update the left transformation matrix Q; .FALSE.: do not update Q.

#### WANTZ `[in]`

_LOGICAL_

.TRUE. : update the right transformation matrix Z; .FALSE.: do not update Z.

#### SELECT `[in]`

_LOGICAL array, dimension (N)_

`SELECT` specifies the eigenvalues in the selected cluster. To select an eigenvalue w(j), `SELECT(j)` must be set to .TRUE..

#### N `[in]`

_INTEGER_

The order of the matrices A and B. $N \ge 0$.

#### A `[in,out]`

_COMPLEX\*16 array, dimension(LDA,N)_

On entry, the upper triangular matrix A, in generalized Schur canonical form. On exit, A is overwritten by the reordered matrix A.

#### LDA `[in]`

_INTEGER_

The leading dimension of the array A. $\mathrm{LDA} \ge \max (1,N)$.

#### B `[in,out]`

_COMPLEX\*16 array, dimension(LDB,N)_

On entry, the upper triangular matrix B, in generalized Schur canonical form. On exit, B is overwritten by the reordered matrix B.

#### LDB `[in]`

_INTEGER_

The leading dimension of the array B. $\mathrm{LDB} \ge \max (1,N)$.

#### ALPHA `[out]`

_COMPLEX\*16 array, dimension (N)_

#### BETA `[out]`

_COMPLEX\*16 array, dimension (N)_

The diagonal elements of A and B, respectively, when the pair (A,B) has been reduced to generalized Schur form. `ALPHA(i)`/`BETA(i)` $i=1$,...,N are the generalized eigenvalues.

#### Q `[in,out]`

_COMPLEX\*16 array, dimension (LDQ,N)_

On entry, if `WANTQ` = .TRUE., Q is an N-by-N matrix. On exit, Q has been postmultiplied by the left unitary transformation matrix which reorder (A, B); The leading M columns of Q form orthonormal bases for the specified pair of left eigenspaces (deflating subspaces). If `WANTQ` = .FALSE., Q is not referenced.

#### LDQ `[in]`

_INTEGER_

The leading dimension of the array Q. $\mathrm{LDQ} \ge 1$. If `WANTQ` = .TRUE., $\mathrm{LDQ} \ge N$.

#### Z `[in,out]`

_COMPLEX\*16 array, dimension (LDZ,N)_

On entry, if `WANTZ` = .TRUE., Z is an N-by-N matrix. On exit, Z has been postmultiplied by the left unitary transformation matrix which reorder (A, B); The leading M columns of Z form orthonormal bases for the specified pair of left eigenspaces (deflating subspaces). If `WANTZ` = .FALSE., Z is not referenced.

#### LDZ `[in]`

_INTEGER_

The leading dimension of the array Z. $\mathrm{LDZ} \ge 1$. If `WANTZ` = .TRUE., $\mathrm{LDZ} \ge N$.

#### M `[out]`

_INTEGER_

The dimension of the specified pair of left and right eigenspaces, (deflating subspaces) $0 \le M \le N$.

#### PL `[out]`

_DOUBLE PRECISION_

#### PR `[out]`

_DOUBLE PRECISION_

If `IJOB = 1`, 4 or 5, `PL`, `PR` are lower bounds on the reciprocal of the norm of "projections" onto left and right eigenspace with respect to the selected cluster. $0 < \mathrm{PL}$, $\mathrm{PR} \le 1$. If $M = 0$ or $M = N$, `PL = PR = 1`. If `IJOB = 0`, 2 or 3 `PL`, `PR` are not referenced.

#### DIF `[out]`

_DOUBLE PRECISION array, dimension (2)_

If $\mathrm{IJOB} \ge 2$, `DIF(1:2)` store the estimates of Difu and Difl. If `IJOB = 2` or 4, `DIF(1:2)` are F-norm-based upper bounds on Difu and Difl. If `IJOB = 3` or 5, `DIF(1:2)` are 1-norm-based estimates of Difu and Difl, computed using reversed communication with ZLACN2. If $M = 0$ or N, $\mathrm{DIF}(1:2) = F-\operatorname{norm}([A, B])$. If `IJOB = 0` or 1, `DIF` is not referenced.

#### WORK `[out]`

_COMPLEX\*16 array, dimension (MAX(1,LWORK))_

On exit, if `INFO = 0`, `WORK(1)` returns the optimal `LWORK`.

#### LWORK `[in]`

_INTEGER_

The dimension of the array `WORK`. $\mathrm{LWORK} \ge 1$ If `IJOB = 1`, 2 or 4, $\mathrm{LWORK} \ge 2 \, M \, (N-M)$ If `IJOB = 3` or 5, $\mathrm{LWORK} \ge 4 \, M \, (N-M)$

If `LWORK = -1`, then a workspace query is assumed; the routine only calculates the optimal size of the `WORK` array, returns this value as the first entry of the `WORK` array, and no error message related to `LWORK` is issued by XERBLA.

#### IWORK `[out]`

_INTEGER array, dimension (MAX(1,LIWORK))_

On exit, if `INFO = 0`, `IWORK(1)` returns the optimal `LIWORK`.

#### LIWORK `[in]`

_INTEGER_

The dimension of the array `IWORK`. $\mathrm{LIWORK} \ge 1$. If `IJOB = 1`, 2 or 4, $\mathrm{LIWORK} \ge N+2$; If `IJOB = 3` or 5, $\mathrm{LIWORK} \ge \max (N+2, 2 \, M \, (N-M))$;

If `LIWORK = -1`, then a workspace query is assumed; the routine only calculates the optimal size of the `IWORK` array, returns this value as the first entry of the `IWORK` array, and no error message related to `LIWORK` is issued by XERBLA.

#### INFO `[out]`

_INTEGER_

-   `=0`: Successful exit.
-   `<0`: If `INFO = -i`, the i-th argument had an illegal value.
-   `=1`: Reordering of (A, B) failed because the transformed matrix pair (A, B) would be too far from generalized Schur form; the problem is very ill-conditioned. (A, B) may have been partially reordered. If requested, 0 is returned in `DIF(*)`, `PL` and `PR`.

### Further Details

ZTGSEN first collects the selected eigenvalues by computing unitary U and W that move them to the top left corner of (A, B). In other words, the selected eigenvalues are the eigenvalues of (A11, B11) in

```text
U**H*(A, B)*W = (A11 A12) (B11 B12) n1
                ( 0  A22),( 0  B22) n2
                  n1  n2    n1  n2
```

where $N = n_{1}+n_{2}$ and $U^H$ means the conjugate transpose of U. The first n1 columns of U and W span the specified pair of left and right eigenspaces (deflating subspaces) of (A, B).

If (A, B) has been obtained from the generalized real Schur decomposition of a matrix pair $(C, D) = Q \, (A, B) \, Z^H$, then the reordered generalized Schur form of (C, D) is given by

$$
(C, D) = (Q \, U) \, (U^H \, (A, B) \, W) \, (Z \, W)^H
$$

and the first n1 columns of $Q \, U$ and $Z \, W$ span the corresponding deflating subspaces of (C, D) (Q and Z store $Q \, U$ and $Z \, W$, resp.).

Note that if the selected eigenvalue is sufficiently ill-conditioned, then its value may differ significantly from its value before reordering.

The reciprocal condition numbers of the left and right eigenspaces spanned by the first n1 columns of U and W (or $Q \, U$ and $Z \, W$) may be returned in `DIF(1:2)`, corresponding to Difu and Difl, resp.

The Difu and Difl are defined as:

Difu\[(A11, B11), (A22, B22)\] = $\sigma$-min( Zu ) and Difl\[(A11, B11), (A22, B22)\] = Difu\[(A22, B22), (A11, B11)\],

where $\sigma$-min(Zu) is the smallest singular value of the (2\*n1\*n2)-by-(2\*n1\*n2) matrix

Zu = \[ kron(In2, A11) -kron($A_{22}^H$, In1) \]

\[ kron(In2, B11) -kron($B_{22}^H$, In1) \].

Here, Inx is the identity matrix of size nx and $A_{22}^H$ is the conjugate transpose of A22. kron(X, Y) is the Kronecker product between the matrices X and Y.

When `DIF(2)` is small, small changes in (A, B) can cause large changes in the deflating subspace. An approximate (asymptotic) bound on the maximum angular error in the computed deflating subspaces is

$$
\mathrm{EPS} \, \operatorname{norm}((A, B)) / \mathrm{DIF}(2)
$$

where EPS is the machine precision.

The reciprocal norm of the projectors on the left and right eigenspaces associated with (A11, B11) may be returned in `PL` and `PR`. They are computed as follows. First we compute L and R so that $P \, (A, B) \, Q$ is block diagonal, where

```text
P = ( I -L ) n1           Q = ( I R ) n1
    ( 0  I ) n2    and        ( 0 I ) n2
      n1 n2                    n1 n2
```

and (L, R) is the solution to the generalized Sylvester equation

$$
A_{11} \, R - L \, A_{22} = -A_{12}
$$

$$
B_{11} \, R - L \, B_{22} = -B_{12}
$$

Then $\mathrm{PL} = (F-\operatorname{norm}(L)^2+1)^{-1/2}$ and $\mathrm{PR} = (F-\operatorname{norm}(R)^2+1)^{-1/2}$. An approximate (asymptotic) bound on the average absolute error of the selected eigenvalues is

$$
\mathrm{EPS} \, \operatorname{norm}((A, B)) / \mathrm{PL}
$$

There are also global error bounds which valid for perturbations up to a certain restriction: A lower bound (x) on the smallest F-norm(E,F) for which an eigenvalue of (A11, B11) may move and coalesce with an eigenvalue of (A22, B22) under perturbation (E,F), (i.e. (A + E, B + F), is

x = min(Difu,Difl)/$((1/(\mathrm{PL} \, \mathrm{PL})+1/(\mathrm{PR} \, \mathrm{PR}))^{1/2}+2 \, \max (1/\mathrm{PL},1/\mathrm{PR}))$.

An approximate bound on x can be computed from `DIF(1:2)`, `PL` and `PR`.

If $y = ( F-\operatorname{norm}(E,F) / x) \le 1$, the angles between the perturbed (L', R') and unperturbed (L, R) left and right deflating subspaces associated with the selected cluster in the (1,1)-blocks can be bounded as

max-angle(L, L') \<= arctan( $y \, \mathrm{PL} / (1 - y \, (1 - \mathrm{PL} \, \mathrm{PL})^{1/2})$ max-angle(R, R') \<= arctan( $y \, \mathrm{PR} / (1 - y \, (1 - \mathrm{PR} \, \mathrm{PR})^{1/2})$

See LAPACK User's Guide section 4.11 or the following references for more information.

Note that if the default method for computing the Frobenius-norm- based estimate `DIF` is not wanted (see ZLATDF), then the parameter IDIFJB (see below) should be changed from 3 to 4 (routine ZLATDF (`IJOB = 2` will be used)). See ZTGSYL for more details.

</section>

<!-- fortran-docs:end -->

<!-- Section for related `stdlib` packages. Do not manually edit this section, as it is automatically populated. -->

<section class="related">

</section>

<!-- /.related -->

<!-- Section for all links. Make sure to keep an empty line after the `section` element and another before the `/section` close. -->

<section class="links">

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array
[mdn-float32array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float32Array
[mdn-int32array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Int32Array
[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->
