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

# ztgsna

> Estimates reciprocal condition numbers for eigenvalues and eigenvectors of a complex generalized Schur form

<section class="usage">

## Usage

```javascript
var ztgsna = require( '@stdlib/lapack/base/ztgsna' );
```

#### ztgsna( order, job, howmny, SELECT, strideSELECT, N, A, LDA, B, LDB, VL, LDVL, VR, LDVR, s, strideS, DIF, strideDIF, mm, M, WORK, strideWORK, lwork, IWORK, strideIWORK, offsetIWORK )

Estimates reciprocal condition numbers for eigenvalues and eigenvectors of a complex generalized Schur form

```javascript
var Complex128Array = require( '@stdlib/array/complex128' );
var Float64Array = require( '@stdlib/array/float64' );
var Uint8Array = require( '@stdlib/array/uint8' );
var Int32Array = require( '@stdlib/array/int32' );

var N = 1;
var A = new Complex128Array( [ 3.0, 2.0 ] );
var B = new Complex128Array( [ 1.0, 0.5 ] );
var VL = new Complex128Array( [ 1.0, 0.0 ] );
var VR = new Complex128Array( [ 1.0, 0.0 ] );
var SELECT = new Uint8Array( N );
var s = new Float64Array( N );
var DIF = new Float64Array( N );
var WORK = new Complex128Array( 2 * N * N );
var IWORK = new Int32Array( N + 2 );
var res = ztgsna( 'column-major', 'both', 'all', SELECT, 1, N, A, N, B, N, VL, N, VR, N, s, 1, DIF, 1, N, N, WORK, 1, 0, IWORK, 1, 0 );
// res.m => 1
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

#### ztgsna.ndarray( job, howmny, SELECT, strideSELECT, offsetSELECT, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR, s, strideS, offsetS, DIF, strideDIF, offsetDIF, mm, M, WORK, strideWORK, offsetWORK, lwork, IWORK, strideIWORK, offsetIWORK )

Estimates reciprocal condition numbers for eigenvalues and eigenvectors of a complex generalized Schur form, using alternative indexing semantics.

```javascript
// See main function example above; ndarray() uses strides + offsets for A, B, VL, VR, s, DIF, WORK, IWORK.
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

-   `job` is one of `'eigenvalues'`, `'eigenvectors'`, or `'both'`.
-   `howmny` is one of `'all'` or `'selected'`.
-   `A`, `B`, `VL`, `VR`, and `WORK` are `Complex128Array`s; `s` and `DIF` are `Float64Array`s.
-   The `WORK`, `IWORK`, and `lwork` arguments are currently unused: workspace is allocated internally.
-   Returns an object `{ info, m }`.

</section>

<!-- /.notes -->

<section class="examples">

## Examples

```javascript
var Complex128Array = require( '@stdlib/array/complex128' );
var Float64Array = require( '@stdlib/array/float64' );
var Uint8Array = require( '@stdlib/array/uint8' );
var Int32Array = require( '@stdlib/array/int32' );
var ztgsna = require( '@stdlib/lapack/base/ztgsna' );

var N = 1;
var res = ztgsna( 'column-major', 'both', 'all', new Uint8Array( N ), 1, N, new Complex128Array( [ 3.0, 2.0 ] ), N, new Complex128Array( [ 1.0, 0.5 ] ), N, new Complex128Array( [ 1.0, 0.0 ] ), N, new Complex128Array( [ 1.0, 0.0 ] ), N, new Float64Array( N ), 1, new Float64Array( N ), 1, N, N, new Complex128Array( 1 ), 1, 0, new Int32Array( N + 2 ), 1, 0 );
console.log( res.m );
```

</section>

<!-- /.examples -->

<!-- fortran-docs:start (generated by bin/fortran-docs.mjs from data/lapack-3.12.0/SRC/ztgsna.f; do not edit) -->

<section class="fortran-docs">

## Reference documentation

From the reference LAPACK 3.12.0 source of `ZTGSNA`, converted to Markdown with KaTeX math. Indices are the 1-based Fortran indices of the source.

### Purpose

ZTGSNA estimates reciprocal condition numbers for specified eigenvalues and/or eigenvectors of a matrix pair (A, B).

(A, B) must be in generalized Schur canonical form, that is, A and B are both upper triangular.

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

If `HOWMNY = 'S'`, `SELECT` specifies the eigenpairs for which condition numbers are required. To select condition numbers for the corresponding j-th eigenvalue and/or eigenvector, `SELECT(j)` must be set to .TRUE.. If `HOWMNY = 'A'`, `SELECT` is not referenced.

#### N `[in]`

_INTEGER_

The order of the square matrix pair (A, B). $N \ge 0$.

#### A `[in]`

_COMPLEX\*16 array, dimension (LDA,N)_

The upper triangular matrix A in the pair (A,B).

#### LDA `[in]`

_INTEGER_

The leading dimension of the array A. $\mathrm{LDA} \ge \max (1,N)$.

#### B `[in]`

_COMPLEX\*16 array, dimension (LDB,N)_

The upper triangular matrix B in the pair (A, B).

#### LDB `[in]`

_INTEGER_

The leading dimension of the array B. $\mathrm{LDB} \ge \max (1,N)$.

#### VL `[in]`

_COMPLEX\*16 array, dimension (LDVL,M)_

IF `JOB = 'E'` or 'B', `VL` must contain left eigenvectors of (A, B), corresponding to the eigenpairs specified by `HOWMNY` and `SELECT`. The eigenvectors must be stored in consecutive columns of `VL`, as returned by ZTGEVC. If `JOB = 'V'`, `VL` is not referenced.

#### LDVL `[in]`

_INTEGER_

The leading dimension of the array `VL`. $\mathrm{LDVL} \ge 1$; and If `JOB = 'E'` or 'B', $\mathrm{LDVL} \ge N$.

#### VR `[in]`

_COMPLEX\*16 array, dimension (LDVR,M)_

IF `JOB = 'E'` or 'B', `VR` must contain right eigenvectors of (A, B), corresponding to the eigenpairs specified by `HOWMNY` and `SELECT`. The eigenvectors must be stored in consecutive columns of `VR`, as returned by ZTGEVC. If `JOB = 'V'`, `VR` is not referenced.

#### LDVR `[in]`

_INTEGER_

The leading dimension of the array `VR`. $\mathrm{LDVR} \ge 1$; If `JOB = 'E'` or 'B', $\mathrm{LDVR} \ge N$.

#### S `[out]`

_DOUBLE PRECISION array, dimension (MM)_

If `JOB = 'E'` or 'B', the reciprocal condition numbers of the selected eigenvalues, stored in consecutive elements of the array. If `JOB = 'V'`, S is not referenced.

#### DIF `[out]`

_DOUBLE PRECISION array, dimension (MM)_

If `JOB = 'V'` or 'B', the estimated reciprocal condition numbers of the selected eigenvectors, stored in consecutive elements of the array. If the eigenvalues cannot be reordered to compute `DIF(j)`, `DIF(j)` is set to 0; this can only occur when the true value would be very small anyway. For each eigenvalue/vector specified by `SELECT`, `DIF` stores a Frobenius norm-based estimate of Difl. If `JOB = 'E'`, `DIF` is not referenced.

#### MM `[in]`

_INTEGER_

The number of elements in the arrays S and `DIF`. $\mathrm{MM} \ge M$.

#### M `[out]`

_INTEGER_

The number of elements of the arrays S and `DIF` used to store the specified condition numbers; for each selected eigenvalue one element is used. If `HOWMNY = 'A'`, M is set to N.

#### WORK `[out]`

_COMPLEX\*16 array, dimension (MAX(1,LWORK))_

On exit, if `INFO = 0`, `WORK(1)` returns the optimal `LWORK`.

#### LWORK `[in]`

_INTEGER_

The dimension of the array `WORK`. $\mathrm{LWORK} \ge \max (1,N)$. If `JOB = 'V'` or 'B', $\mathrm{LWORK} \ge \max (1,2 \, N \, N)$.

#### IWORK `[out]`

_INTEGER array, dimension (N+2)_

If `JOB = 'E'`, `IWORK` is not referenced.

#### INFO `[out]`

_INTEGER_

-   `= 0`: Successful exit
-   `< 0`: If `INFO = -i`, the i-th argument had an illegal value

### Further Details

The reciprocal of the condition number of the i-th generalized eigenvalue $w = (a, b)$ is defined as

`S(I)` = (\|$v^{\mathrm{HAu}}$\|\*\*2 + \|$v^{\mathrm{HBu}}$\|\*\*2)\*\*(1/2) / (norm(u)\*norm(v))

where u and v are the right and left eigenvectors of (A, B) corresponding to w; \|z\| denotes the absolute value of the complex number, and norm(u) denotes the 2-norm of the vector u. The pair (a, b) corresponds to an eigenvalue $w = a/b$ (= $v^{\mathrm{HAu}}/v^{\mathrm{HBu}}$) of the matrix pair (A, B). If both a and b equal zero, then (A,B) is singular and $S(I) = -1$ is returned.

An approximate error bound on the chordal distance between the i-th computed generalized eigenvalue w and the corresponding exact eigenvalue $\lambda$ is

chord(w, $\lambda$) \<= $\mathrm{EPS} \, \operatorname{norm}(A, B) / S(I)$,

where EPS is the machine precision.

The reciprocal of the condition number of the right eigenvector u and left eigenvector v corresponding to the generalized eigenvalue w is defined as follows. Suppose

```text
(A, B) = ( a   *  ) ( b  *  )  1
         ( 0  A22 ),( 0 B22 )  n-1
           1  n-1     1 n-1
```

Then the reciprocal condition number `DIF(I)` is

Difl\[(a, b), (A22, B22)\] = $\sigma$-min( Zl )

where $\sigma$-min(Zl) denotes the smallest singular value of

Zl = \[ kron(a, In-1) -kron(1, A22) \]

\[ kron(b, In-1) -kron(1, B22) \].

Here In-1 is the identity matrix of size n-1 and $X^H$ is the conjugate transpose of X. kron(X, Y) is the Kronecker product between the matrices X and Y.

We approximate the smallest singular value of Zl with an upper bound. This is done by ZLATDF.

An approximate error bound for a computed eigenvector `VL(i)` or `VR(i)` is given by

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
-   Estimation: Theory, Algorithms and Software, Report
-   UMINF - 94.04, Department of Computing Science, Umea University,
-   S-901 87 Umea, Sweden, 1994. Also as LAPACK Working Note 87.
-   To appear in Numerical Algorithms, 1996.

\[3\] B. Kagstrom and P. Poromaa, LAPACK-Style Algorithms and Software

-   for Solving the Generalized Sylvester Equation and Estimating the
-   Separation between Regular Matrix Pairs, Report UMINF - 93.23,
-   Department of Computing Science, Umea University, S-901 87 Umea,
-   Sweden, December 1993, Revised April 1994, Also as LAPACK Working
-   Note 75.
-   To appear in ACM Trans. on Math. Software, Vol 22, No 1, 1996.

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
