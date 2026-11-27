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

## Reference notes

The mathematical description from the reference LAPACK 3.12.0 source of `DTGSNA`. Indices are the 1-based Fortran indices of the source.

### Purpose

DTGSNA estimates reciprocal condition numbers for specified eigenvalues and/or eigenvectors of a matrix pair (A, B) in generalized real Schur canonical form (or of any matrix pair $(Q \, A \, Z^T, Q \, B \, Z^T)$ with orthogonal matrices Q and Z, where $Z^T$ denotes the transpose of Z.

(A, B) must be in generalized real Schur form (as returned by DGGES), i.e. A is block upper triangular with 1-by-1 and 2-by-2 diagonal blocks. B is upper triangular.

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
