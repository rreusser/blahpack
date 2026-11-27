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

# dtgsna

> Estimates reciprocal condition numbers for eigenvalues and eigenvectors of a generalized Schur form

<section class="usage">

## Usage

```javascript
var dtgsna = require( '@stdlib/lapack/base/dtgsna' );
```

#### dtgsna( order, job, howmny, SELECT, strideSELECT, N, A, LDA, B, LDB, VL, LDVL, VR, LDVR, s, strideS, DIF, strideDIF, mm, M, WORK, strideWORK, lwork, IWORK, strideIWORK, offsetIWORK )

Estimates reciprocal condition numbers for eigenvalues and eigenvectors of a generalized Schur form

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Int32Array = require( '@stdlib/array/int32' );
var Uint8Array = require( '@stdlib/array/uint8' );

var A = new Float64Array( [ 1.0, 0.0, 0.5, 2.0 ] );
var B = new Float64Array( [ 1.0, 0.0, 0.2, 1.5 ] );
var VL = new Float64Array( [ 1.0, 0.0, 0.0, 1.0 ] );
var VR = new Float64Array( [ 1.0, 0.0, 0.0, 1.0 ] );
var s = new Float64Array( 2 );
var DIF = new Float64Array( 2 );
var WORK = new Float64Array( 64 );
var IWORK = new Int32Array( 16 );
var SELECT = new Uint8Array( 2 );
var M = new Int32Array( 1 );

dtgsna( 'column-major', 'both', 'all', SELECT, 1, 2, A, 2, B, 2, VL, 2, VR, 2, s, 1, DIF, 1, 2, M, WORK, 1, WORK.length, IWORK, 1, 0 );
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **job**: specifies the operation type.
-   **howmny**: specifies the operation type.
-   **SELECT**: input array.
-   **strideSELECT**: stride length for `SELECT`.
-   **N**: number of columns.
-   **A**: input matrix.
-   **LDA**: leading dimension of `A`.
-   **B**: input matrix.
-   **LDB**: leading dimension of `B`.
-   **VL**: input matrix.
-   **LDVL**: leading dimension of `VL`.
-   **VR**: input matrix.
-   **LDVR**: leading dimension of `VR`.
-   **s**: input array.
-   **strideS**: stride length for `s`.
-   **DIF**: input array.
-   **strideDIF**: stride length for `DIF`.
-   **mm**: mm.
-   **M**: number of rows.
-   **WORK**: input array.
-   **strideWORK**: stride length for `WORK`.
-   **lwork**: lwork.
-   **IWORK**: output array.
-   **strideIWORK**: stride length for `IWORK`.
-   **offsetIWORK**: starting index for `IWORK`.

#### dtgsna.ndarray( job, howmny, SELECT, strideSELECT, offsetSELECT, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR, s, strideS, offsetS, DIF, strideDIF, offsetDIF, mm, M, WORK, strideWORK, offsetWORK, lwork, IWORK, strideIWORK, offsetIWORK )

Estimates reciprocal condition numbers for eigenvalues and eigenvectors of a generalized Schur form, using alternative indexing semantics.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Int32Array = require( '@stdlib/array/int32' );
var Uint8Array = require( '@stdlib/array/uint8' );

var A = new Float64Array( [ 1.0, 0.0, 0.5, 2.0 ] );
var B = new Float64Array( [ 1.0, 0.0, 0.2, 1.5 ] );
var VL = new Float64Array( [ 1.0, 0.0, 0.0, 1.0 ] );
var VR = new Float64Array( [ 1.0, 0.0, 0.0, 1.0 ] );
var s = new Float64Array( 2 );
var DIF = new Float64Array( 2 );
var WORK = new Float64Array( 64 );
var IWORK = new Int32Array( 16 );
var SELECT = new Uint8Array( 2 );
var M = new Int32Array( 1 );

dtgsna.ndarray( 'both', 'all', SELECT, 1, 0, 2, A, 1, 2, 0, B, 1, 2, 0, VL, 1, 2, 0, VR, 1, 2, 0, s, 1, 0, DIF, 1, 0, 2, M, WORK, 1, 0, WORK.length, IWORK, 1, 0 );
```

The function has the following additional parameters:

-   **job**: specifies the operation type.
-   **howmny**: specifies the operation type.
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
-   **VL**: input matrix.
-   **strideVL1**: stride of dimension 1 of `VL`.
-   **strideVL2**: stride of dimension 2 of `VL`.
-   **offsetVL**: starting index for `VL`.
-   **VR**: input matrix.
-   **strideVR1**: stride of dimension 1 of `VR`.
-   **strideVR2**: stride of dimension 2 of `VR`.
-   **offsetVR**: starting index for `VR`.
-   **s**: input array.
-   **strideS**: stride length for `s`.
-   **offsetS**: starting index for `S`.
-   **DIF**: input array.
-   **strideDIF**: stride length for `DIF`.
-   **offsetDIF**: starting index for `DIF`.
-   **mm**: mm.
-   **M**: number of rows.
-   **WORK**: input array.
-   **strideWORK**: stride length for `WORK`.
-   **offsetWORK**: starting index for `WORK`.
-   **lwork**: lwork.
-   **IWORK**: output array.
-   **strideIWORK**: stride length for `IWORK`.
-   **offsetIWORK**: starting index for `IWORK`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   The routine assumes the matrix pair `(A,B)` is already in generalized real Schur canonical form (upper quasi-triangular `A`, upper triangular `B`).
-   For `job='eigenvalues'` or `'both'`, the left and right eigenvectors `VL` and `VR` must be provided (e.g. from `dtgevc`).
-   The workspace must satisfy `lwork >= 2*N*(N+2)+16` when `job='eigenvectors'` or `'both'`; otherwise `lwork >= N` suffices.

</section>

<!-- /.notes -->

<section class="examples">

## Examples

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Int32Array = require( '@stdlib/array/int32' );
var Uint8Array = require( '@stdlib/array/uint8' );
var dtgsna = require( '@stdlib/lapack/base/dtgsna' );

var N = 3;
var A = new Float64Array( [ 1.0, 0.0, 0.0, 0.5, 2.0, 0.0, 0.3, 0.4, 3.0 ] );
var B = new Float64Array( [ 1.0, 0.0, 0.0, 0.2, 1.5, 0.0, 0.1, 0.3, 2.0 ] );
var VL = new Float64Array( [ 1, 0, 0, 0, 1, 0, 0, 0, 1 ] );
var VR = new Float64Array( [ 1, 0, 0, 0, 1, 0, 0, 0, 1 ] );
var s = new Float64Array( N );
var DIF = new Float64Array( N );
var WORK = new Float64Array( 2 * N * ( N + 2 ) + 16 );
var IWORK = new Int32Array( N + 6 );
var SELECT = new Uint8Array( N );
var M = new Int32Array( 1 );

dtgsna.ndarray( 'both', 'all', SELECT, 1, 0, N, A, 1, N, 0, B, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, s, 1, 0, DIF, 1, 0, N, M, WORK, 1, 0, WORK.length, IWORK, 1, 0 );
console.log( s );
console.log( DIF );
```

</section>

<!-- /.examples -->

<!-- fortran-docs:start (generated by bin/fortran-docs.mjs from data/lapack-3.12.0/SRC/dtgsna.f; do not edit) -->

<section class="fortran-docs">

## Reference documentation

From the reference LAPACK 3.12.0 source of `DTGSNA`, converted to Markdown with KaTeX math. Indices are the 1-based Fortran indices of the source.

### Purpose

DTGSNA estimates reciprocal condition numbers for specified eigenvalues and/or eigenvectors of a matrix pair (A, B) in generalized real Schur canonical form (or of any matrix pair $(Q \, A \, Z^T, Q \, B \, Z^T)$ with orthogonal matrices Q and Z, where $Z^T$ denotes the transpose of Z.

(A, B) must be in generalized real Schur form (as returned by DGGES), i.e. A is block upper triangular with 1-by-1 and 2-by-2 diagonal blocks. B is upper triangular.

### Arguments

#### JOB `[in]`

_CHARACTER\*1_

Specifies whether condition numbers are required for eigenvalues (S) or eigenvectors (`DIF`):

-   `= 'E'`: for eigenvalues only (S);
-   `= 'V'`: for eigenvectors only (`DIF`);
-   `= 'B'`: for both eigenvalues and eigenvectors (S and `DIF`).

#### HOWMNY `[in]`

_CHARACTER\*1_

-   `= 'A'`: compute condition numbers for all eigenpairs;
-   `= 'S'`: compute condition numbers for selected eigenpairs specified by the array `SELECT`.

#### SELECT `[in]`

_LOGICAL array, dimension (N)_

If `HOWMNY = 'S'`, `SELECT` specifies the eigenpairs for which condition numbers are required. To select condition numbers for the eigenpair corresponding to a real eigenvalue w(j), `SELECT(j)` must be set to .TRUE.. To select condition numbers corresponding to a complex conjugate pair of eigenvalues w(j) and w(j+1), either `SELECT(j)` or `SELECT(j+1)` or both, must be set to .TRUE.. If `HOWMNY = 'A'`, `SELECT` is not referenced.

#### N `[in]`

_INTEGER_

The order of the square matrix pair (A, B). $N \ge 0$.

#### A `[in]`

_DOUBLE PRECISION array, dimension (LDA,N)_

The upper quasi-triangular matrix A in the pair (A,B).

#### LDA `[in]`

_INTEGER_

The leading dimension of the array A. $\mathrm{LDA} \ge \max (1,N)$.

#### B `[in]`

_DOUBLE PRECISION array, dimension (LDB,N)_

The upper triangular matrix B in the pair (A,B).

#### LDB `[in]`

_INTEGER_

The leading dimension of the array B. $\mathrm{LDB} \ge \max (1,N)$.

#### VL `[in]`

_DOUBLE PRECISION array, dimension (LDVL,M)_

If `JOB = 'E'` or 'B', `VL` must contain left eigenvectors of (A, B), corresponding to the eigenpairs specified by `HOWMNY` and `SELECT`. The eigenvectors must be stored in consecutive columns of `VL`, as returned by DTGEVC. If `JOB = 'V'`, `VL` is not referenced.

#### LDVL `[in]`

_INTEGER_

The leading dimension of the array `VL`. $\mathrm{LDVL} \ge 1$. If `JOB = 'E'` or 'B', $\mathrm{LDVL} \ge N$.

#### VR `[in]`

_DOUBLE PRECISION array, dimension (LDVR,M)_

If `JOB = 'E'` or 'B', `VR` must contain right eigenvectors of (A, B), corresponding to the eigenpairs specified by `HOWMNY` and `SELECT`. The eigenvectors must be stored in consecutive columns ov `VR`, as returned by DTGEVC. If `JOB = 'V'`, `VR` is not referenced.

#### LDVR `[in]`

_INTEGER_

The leading dimension of the array `VR`. $\mathrm{LDVR} \ge 1$. If `JOB = 'E'` or 'B', $\mathrm{LDVR} \ge N$.

#### S `[out]`

_DOUBLE PRECISION array, dimension (MM)_

If `JOB = 'E'` or 'B', the reciprocal condition numbers of the selected eigenvalues, stored in consecutive elements of the array. For a complex conjugate pair of eigenvalues two consecutive elements of S are set to the same value. Thus `S(j)`, `DIF(j)`, and the j-th columns of `VL` and `VR` all correspond to the same eigenpair (but not in general the j-th eigenpair, unless all eigenpairs are selected). If `JOB = 'V'`, S is not referenced.

#### DIF `[out]`

_DOUBLE PRECISION array, dimension (MM)_

If `JOB = 'V'` or 'B', the estimated reciprocal condition numbers of the selected eigenvectors, stored in consecutive elements of the array. For a complex eigenvector two consecutive elements of `DIF` are set to the same value. If the eigenvalues cannot be reordered to compute `DIF(j)`, `DIF(j)` is set to 0; this can only occur when the true value would be very small anyway. If `JOB = 'E'`, `DIF` is not referenced.

#### MM `[in]`

_INTEGER_

The number of elements in the arrays S and `DIF`. $\mathrm{MM} \ge M$.

#### M `[out]`

_INTEGER_

The number of elements of the arrays S and `DIF` used to store the specified condition numbers; for each selected real eigenvalue one element is used, and for each selected complex conjugate pair of eigenvalues, two elements are used. If `HOWMNY = 'A'`, M is set to N.

#### WORK `[out]`

_DOUBLE PRECISION array, dimension (MAX(1,LWORK))_

On exit, if `INFO = 0`, `WORK(1)` returns the optimal `LWORK`.

#### LWORK `[in]`

_INTEGER_

The dimension of the array `WORK`. $\mathrm{LWORK} \ge \max (1,N)$. If `JOB = 'V'` or 'B' $\mathrm{LWORK} \ge 2 \, N \, (N+2)+16$.

If `LWORK = -1`, then a workspace query is assumed; the routine only calculates the optimal size of the `WORK` array, returns this value as the first entry of the `WORK` array, and no error message related to `LWORK` is issued by XERBLA.

#### IWORK `[out]`

_INTEGER array, dimension (N + 6)_

If `JOB = 'E'`, `IWORK` is not referenced.

#### INFO `[out]`

_INTEGER_

-   `=0`: Successful exit
-   `<0`: If `INFO = -i`, the i-th argument had an illegal value

### Further Details

The reciprocal of the condition number of a generalized eigenvalue $w = (a, b)$ is defined as

`S(w)` = (\|$u^{\mathrm{TAv}}$\|\*\*2 + \|$u^{\mathrm{TBv}}$\|\*\*2)\*\*(1/2) / (norm(u)\*norm(v))

where u and v are the left and right eigenvectors of (A, B) corresponding to w; \|z\| denotes the absolute value of the complex number, and norm(u) denotes the 2-norm of the vector u. The pair (a, b) corresponds to an eigenvalue $w = a/b$ (= $u^{\mathrm{TAv}}/u^{\mathrm{TBv}}$) of the matrix pair (A, B). If both a and b equal zero, then (A B) is singular and $S(I) = -1$ is returned.

An approximate error bound on the chordal distance between the i-th computed generalized eigenvalue w and the corresponding exact eigenvalue $\lambda$ is

chord(w, $\lambda$) \<= $\mathrm{EPS} \, \operatorname{norm}(A, B) / S(I)$

where EPS is the machine precision.

The reciprocal of the condition number `DIF(i)` of right eigenvector u and left eigenvector v corresponding to the generalized eigenvalue w is defined as follows:

a) If the i-th eigenvalue $w = (a,b)$ is real

Suppose U and V are orthogonal transformations such that

```text
U**T*(A, B)*V  = (S, T) = ( a   *  ) ( b  *  )  1
                          ( 0  S22 ),( 0 T22 )  n-1
                            1  n-1     1 n-1
```

Then the reciprocal condition number `DIF(i)` is

Difl((a, b), (S22, T22)) = $\sigma$-min( Zl ),

where $\sigma$-min(Zl) denotes the smallest singular value of the 2(n-1)-by-2(n-1) matrix

Zl = \[ kron(a, In-1) -kron(1, S22) \]

\[ kron(b, In-1) -kron(1, T22) \] .

Here In-1 is the identity matrix of size n-1. kron(X, Y) is the Kronecker product between the matrices X and Y.

Note that if the default method for computing `DIF(i)` is wanted (see DLATDF), then the parameter DIFDRI (see below) should be changed from 3 to 4 (routine DLATDF($\mathrm{IJOB} = 2$ will be used)). See DTGSYL for more details.

b) If the i-th and (i+1)-th eigenvalues are complex conjugate pair,

Suppose U and V are orthogonal transformations such that

$U^T \, (A, B) \, V = (S, T) = ( S_{11} \, )$ ( T11 \* ) 2

```text
( 0    S22 ),( 0    T22) n-2
  2    n-2     2    n-2
```

and (S11, T11) corresponds to the complex conjugate eigenvalue pair (w, conjg(w)). There exist unitary matrices U1 and V1 such that

$$
U_{1}^T \, S_{11} \, V_{1} = \begin{pmatrix} s_{11} & s_{12} \\ 0 & s_{22} \end{pmatrix} \quad\text{and}\quad U_{1}^T \, T_{11} \, V_{1} = \begin{pmatrix} t_{11} & t_{12} \\ 0 & t_{22} \end{pmatrix}
$$

```text
where the generalized eigenvalues w = s11/t11 and
conjg(w) = s22/t22.
```

Then the reciprocal condition number `DIF(i)` is bounded by

$$
\min ( d_{1}, \max ( 1, |\operatorname{real}(s_{11})/\operatorname{real}(s_{22})| ) \, d_{2} )
$$

where, d1 = Difl((s11, t11), (s22, t22)) = $\sigma$-min(Z1), where Z1 is the complex 2-by-2 matrix

$$
Z_{1} = \begin{bmatrix} s_{11} & -s_{22} \\ t_{11} & -t_{22} \end{bmatrix}
$$

This is done by computing (using real arithmetic) the roots of the characteristical polynomial $\det (Z_{1}^T \, Z_{1} - \lambda I)$, where $Z_{1}^T$ denotes the transpose of Z1 and det(X) denotes the determinant of X.

and d2 is an upper bound on Difl((S11, T11), (S22, T22)), i.e. an upper bound on $\sigma$-min(Z2), where Z2 is (2n-2)-by-(2n-2)

Z2 = \[ kron($S_{11}^T$, In-2) -kron(I2, S22) \]

\[ kron($T_{11}^T$, In-2) -kron(I2, T22) \]

Note that if the default method for computing `DIF` is wanted (see DLATDF), then the parameter DIFDRI (see below) should be changed from 3 to 4 (routine DLATDF($\mathrm{IJOB} = 2$ will be used)). See DTGSYL for more details.

For each eigenvalue/vector specified by `SELECT`, `DIF` stores a Frobenius norm-based estimate of Difl.

An approximate error bound for the i-th computed eigenvector `VL(i)` or `VR(i)` is given by

$$
\mathrm{EPS} \, \operatorname{norm}(A, B) / \mathrm{DIF}(i)
$$

See ref. \[2-3\] for more details and further references.

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
-   Note 75. To appear in ACM Trans. on Math. Software, Vol 22,
-   No 1, 1996.

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
