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

# dtgsen

> Reorders the generalized real Schur decomposition of a real matrix pair (A, B) (in terms of an orthonormal equivalence transformation Qᵀ·(A, B)·Z), so that a selected cluster of eigenvalues appears in the leading diagonal blocks of the upper quasi-triangular matrix A and the upper triangular B

<section class="usage">

## Usage

```javascript
var dtgsen = require( '@stdlib/lapack/base/dtgsen' );
```

#### dtgsen( order, ijob, wantq, wantz, SELECT, strideSELECT, N, A, LDA, B, LDB, ALPHAR, strideALPHAR, ALPHAI, strideALPHAI, BETA, strideBETA, Q, LDQ, Z, LDZ, M, pl, pr, DIF, strideDIF, WORK, strideWORK, lwork, IWORK, strideIWORK, offsetIWORK, liwork )

Reorders the generalized real Schur decomposition of a real matrix pair (A, B) (in terms of an orthonormal equivalence transformation Qᵀ·(A, B)·Z), so that a selected cluster of eigenvalues appears in the leading diagonal blocks of the upper quasi-triangular matrix A and the upper triangular B

```javascript
var Float64Array = require( '@stdlib/array/float64' );

var A = new Float64Array( [ 1.0, 0.0, 0.5, 2.0 ] );
var B = new Float64Array( [ 1.0, 0.0, 0.2, 1.5 ] );
// ...call dtgsen with appropriate parameters...
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **ijob**: job selector (0-5) controlling condition estimation.
-   **wantq**: whether to update Q.
-   **wantz**: wantz.
-   **SELECT**: input array.
-   **strideSELECT**: stride length for `SELECT`.
-   **N**: number of columns.
-   **A**: input matrix.
-   **LDA**: leading dimension of `A`.
-   **B**: input matrix.
-   **LDB**: leading dimension of `B`.
-   **ALPHAR**: input array.
-   **strideALPHAR**: stride length for `ALPHAR`.
-   **ALPHAI**: input array.
-   **strideALPHAI**: stride length for `ALPHAI`.
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
-   **lwork**: lwork.
-   **IWORK**: output array.
-   **strideIWORK**: stride length for `IWORK`.
-   **offsetIWORK**: starting index for `IWORK`.
-   **liwork**: liwork.

#### dtgsen.ndarray( ijob, wantq, wantz, SELECT, strideSELECT, offsetSELECT, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, ALPHAR, strideALPHAR, offsetALPHAR, ALPHAI, strideALPHAI, offsetALPHAI, BETA, strideBETA, offsetBETA, Q, strideQ1, strideQ2, offsetQ, Z, strideZ1, strideZ2, offsetZ, M, pl, pr, DIF, strideDIF, offsetDIF, WORK, strideWORK, offsetWORK, lwork, IWORK, strideIWORK, offsetIWORK, liwork )

Reorders the generalized real Schur decomposition of a real matrix pair (A, B) (in terms of an orthonormal equivalence transformation Qᵀ·(A, B)·Z), so that a selected cluster of eigenvalues appears in the leading diagonal blocks of the upper quasi-triangular matrix A and the upper triangular B, using alternative indexing semantics.

```javascript
var Float64Array = require( '@stdlib/array/float64' );

var A = new Float64Array( [ 1.0, 0.0, 0.5, 2.0 ] );
var B = new Float64Array( [ 1.0, 0.0, 0.2, 1.5 ] );
// ...call dtgsen.ndarray with appropriate parameters...
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
-   **ALPHAR**: input array.
-   **strideALPHAR**: stride length for `ALPHAR`.
-   **offsetALPHAR**: starting index for `ALPHAR`.
-   **ALPHAI**: input array.
-   **strideALPHAI**: stride length for `ALPHAI`.
-   **offsetALPHAI**: starting index for `ALPHAI`.
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
-   **lwork**: lwork.
-   **IWORK**: output array.
-   **strideIWORK**: stride length for `IWORK`.
-   **offsetIWORK**: starting index for `IWORK`.
-   **liwork**: liwork.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   (A,B) must be in generalized real Schur canonical form (as returned by `dgges`).

</section>

<!-- /.notes -->

<section class="examples">

## Examples

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Int32Array = require( '@stdlib/array/int32' );
var Uint8Array = require( '@stdlib/array/uint8' );
var dtgsen = require( '@stdlib/lapack/base/dtgsen' );

var A = new Float64Array( [ 1.0, 0.0, 0.5, 2.0 ] );
var B = new Float64Array( [ 1.0, 0.0, 0.2, 1.5 ] );
var Q = new Float64Array( [ 1.0, 0.0, 0.0, 1.0 ] );
var Z = new Float64Array( [ 1.0, 0.0, 0.0, 1.0 ] );
var SELECT = new Uint8Array( [ 0, 1 ] );
var ALPHAR = new Float64Array( 2 );
var ALPHAI = new Float64Array( 2 );
var BETA = new Float64Array( 2 );
var M = new Int32Array( 1 );
var pl = new Float64Array( 1 );
var pr = new Float64Array( 1 );
var DIF = new Float64Array( 2 );
var WORK = new Float64Array( 100 );
var IWORK = new Int32Array( 100 );

var info = dtgsen.ndarray( 0, true, true, SELECT, 1, 0, 2, A, 1, 2, 0, B, 1, 2, 0, ALPHAR, 1, 0, ALPHAI, 1, 0, BETA, 1, 0, Q, 1, 2, 0, Z, 1, 2, 0, M, pl, pr, DIF, 1, 0, WORK, 1, 0, 100, IWORK, 1, 0, 100 );
console.log( info );
// => 0
```

</section>

<!-- /.examples -->

<!-- fortran-docs:start (generated by bin/fortran-docs.mjs from data/lapack-3.12.0/SRC/dtgsen.f; do not edit) -->

<section class="fortran-docs">

## Reference notes

The mathematical description from the reference LAPACK 3.12.0 source of `DTGSEN`. Indices are the 1-based Fortran indices of the source.

### Purpose

DTGSEN reorders the generalized real Schur decomposition of a real matrix pair (A, B) (in terms of an orthonormal equivalence trans- formation $Q^T \, (A, B) \, Z$), so that a selected cluster of eigenvalues appears in the leading diagonal blocks of the upper quasi-triangular matrix A and the upper triangular B. The leading columns of Q and Z form orthonormal bases of the corresponding left and right eigen- spaces (deflating subspaces). (A, B) must be in generalized real Schur canonical form (as returned by DGGES), i.e. A is block upper triangular with 1-by-1 and 2-by-2 diagonal blocks. B is upper triangular.

DTGSEN also computes the generalized eigenvalues

$$
w(j) = (\mathrm{ALPHAR}(j) + i \, \mathrm{ALPHAI}(j))/\mathrm{BETA}(j)
$$

of the reordered matrix pair (A, B).

Optionally, DTGSEN computes the estimates of reciprocal condition numbers for eigenvalues and eigenspaces. These are Difu\[(A11,B11), (A22,B22)\] and Difl\[(A11,B11), (A22,B22)\], i.e. the separation(s) between the matrix pairs (A11, B11) and (A22,B22) that correspond to the selected cluster and the eigenvalues outside the cluster, resp., and norms of "projections" onto left and right eigenspaces w.r.t. the selected cluster in the (1,1)-block.

### Further Details

DTGSEN first collects the selected eigenvalues by computing orthogonal U and W that move them to the top left corner of (A, B). In other words, the selected eigenvalues are the eigenvalues of (A11, B11) in:

```text
U**T*(A, B)*W = (A11 A12) (B11 B12) n1
                ( 0  A22),( 0  B22) n2
                  n1  n2    n1  n2
```

where $N = n_{1}+n_{2}$ and $U^T$ means the transpose of U. The first n1 columns of U and W span the specified pair of left and right eigenspaces (deflating subspaces) of (A, B).

If (A, B) has been obtained from the generalized real Schur decomposition of a matrix pair $(C, D) = Q \, (A, B) \, Z^T$, then the reordered generalized real Schur form of (C, D) is given by

$$
(C, D) = (Q \, U) \, (U^T \, (A, B) \, W) \, (Z \, W)^T
$$

and the first n1 columns of $Q \, U$ and $Z \, W$ span the corresponding deflating subspaces of (C, D) (Q and Z store $Q \, U$ and $Z \, W$, resp.).

Note that if the selected eigenvalue is sufficiently ill-conditioned, then its value may differ significantly from its value before reordering.

The reciprocal condition numbers of the left and right eigenspaces spanned by the first n1 columns of U and W (or $Q \, U$ and $Z \, W$) may be returned in `DIF(1:2)`, corresponding to Difu and Difl, resp.

The Difu and Difl are defined as:

Difu\[(A11, B11), (A22, B22)\] = $\sigma$-min( Zu ) and Difl\[(A11, B11), (A22, B22)\] = Difu\[(A22, B22), (A11, B11)\],

where $\sigma$-min(Zu) is the smallest singular value of the (2\*n1\*n2)-by-(2\*n1\*n2) matrix

Zu = \[ kron(In2, A11) -kron($A_{22}^T$, In1) \]

\[ kron(In2, B11) -kron($B_{22}^T$, In1) \].

Here, Inx is the identity matrix of size nx and $A_{22}^T$ is the transpose of A22. kron(X, Y) is the Kronecker product between the matrices X and Y.

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

Note that if the default method for computing the Frobenius-norm- based estimate `DIF` is not wanted (see DLATDF), then the parameter IDIFJB (see below) should be changed from 3 to 4 (routine DLATDF (`IJOB = 2` will be used)). See DTGSYL for more details.

### References

\[1\] B. Kagstrom; A Direct Method for Reordering Eigenvalues in the

-   Generalized Real Schur Form of a Regular Matrix Pair (A, B), in
-   M.S. Moonen et al (eds), Linear Algebra for Large Scale and
-   Real-Time Applications, Kluwer Academic Publ. 1993, pp 195-218.

\[2\] B. Kagstrom and P. Poromaa; Computing Eigenspaces with Specified

-   Eigenvalues of a Regular Matrix Pair (A, B) and Condition
-   Estimation: Theory, Algorithms and Software,
-   Report UMINF - 94.04, Department of Computing Science, Umea
-   University, S-901 87 Umea, Sweden, 1994. Also as LAPACK Working
-   Note 87. To appear in Numerical Algorithms, 1996.

\[3\] B. Kagstrom and P. Poromaa, LAPACK-Style Algorithms and Software

-   for Solving the Generalized Sylvester Equation and Estimating the
-   Separation between Regular Matrix Pairs, Report UMINF - 93.23,
-   Department of Computing Science, Umea University, S-901 87 Umea,
-   Sweden, December 1993, Revised April 1994, Also as LAPACK Working
-   Note 75. To appear in ACM Trans. on Math. Software, Vol 22, No 1,
-   1996.

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
