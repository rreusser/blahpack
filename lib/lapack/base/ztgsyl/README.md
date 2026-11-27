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

# ztgsyl

> Solves the generalized Sylvester equation using a level-3 blocked algorithm.

<section class="usage">

## Usage

```javascript
var ztgsyl = require( '@stdlib/lapack/base/ztgsyl' );
```

#### ztgsyl( trans, ijob, M, N, A, LDA, B, LDB, C, LDC, D, LDD, E, LDE, F, LDF, scale, dif, WORK, strideWORK, IWORK, strideIWORK )

Solves the generalized Sylvester equation using a level-3 blocked algorithm.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Complex128Array = require( '@stdlib/array/complex128' );
var Int32Array = require( '@stdlib/array/int32' );
var ztgsyl = require( '@stdlib/lapack/base/ztgsyl' );

var A = new Complex128Array( [ 1.0, 0.5, 0.0, 0.0, 0.5, 0.2, 2.0, -0.3 ] );
var B = new Complex128Array( [ 3.0, 0.1, 0.0, 0.0, 0.3, -0.1, 4.0, 0.2 ] );
var C = new Complex128Array( [ 1.0, 0.5, 3.0, 1.0, 2.0, -0.5, 4.0, 0.3 ] );
var D = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.2, 0.1, 1.5, -0.1 ] );
var E = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.1, 0.05, 2.0, 0.1 ] );
var F = new Complex128Array( [ 5.0, 1.0, 7.0, 0.5, 6.0, -1.0, 8.0, 0.2 ] );
var scale = new Float64Array( 1 );
var dif = new Float64Array( 1 );
var IWORK = new Int32Array( 10 );

ztgsyl.ndarray( 'no-transpose', 0, 2, 2, A, 1, 2, 0, B, 1, 2, 0, C, 1, 2, 0, D, 1, 2, 0, E, 1, 2, 0, F, 1, 2, 0, scale, dif, null, 1, 0, -1, IWORK, 1, 0 );
```

The function has the following parameters:

-   **trans**: specifies whether the matrix should be transposed.
-   **ijob**: `ijob`.
-   **M**: number of rows.
-   **N**: number of columns.
-   **A**: input array `A`.
-   **LDA**: leading dimension of `A`.
-   **B**: input array `B`.
-   **LDB**: leading dimension of `B`.
-   **C**: input array `C`.
-   **LDC**: leading dimension of `C`.
-   **D**: input array `D`.
-   **LDD**: leading dimension of `D`.
-   **E**: input array `E`.
-   **LDE**: leading dimension of `E`.
-   **F**: input array `F`.
-   **LDF**: leading dimension of `F`.
-   **scale**: `scale`.
-   **dif**: `dif`.
-   **WORK**: input array `WORK`.
-   **strideWORK**: stride length for `WORK`.
-   **IWORK**: input array `IWORK`.
-   **strideIWORK**: stride length for `IWORK`.

#### ztgsyl.ndarray( trans, ijob, M, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, C, strideC1, strideC2, offsetC, D, strideD1, strideD2, offsetD, E, strideE1, strideE2, offsetE, F, strideF1, strideF2, offsetF, scale, dif, WORK, strideWORK, offsetWORK, IWORK, strideIWORK, offsetIWORK )

Solves the generalized Sylvester equation using a level-3 blocked algorithm, using alternative indexing semantics.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Complex128Array = require( '@stdlib/array/complex128' );
var Int32Array = require( '@stdlib/array/int32' );
var ztgsyl = require( '@stdlib/lapack/base/ztgsyl' );

var A = new Complex128Array( [ 1.0, 0.5, 0.0, 0.0, 0.5, 0.2, 2.0, -0.3 ] );
var B = new Complex128Array( [ 3.0, 0.1, 0.0, 0.0, 0.3, -0.1, 4.0, 0.2 ] );
var C = new Complex128Array( [ 1.0, 0.5, 3.0, 1.0, 2.0, -0.5, 4.0, 0.3 ] );
var D = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.2, 0.1, 1.5, -0.1 ] );
var E = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.1, 0.05, 2.0, 0.1 ] );
var F = new Complex128Array( [ 5.0, 1.0, 7.0, 0.5, 6.0, -1.0, 8.0, 0.2 ] );
var scale = new Float64Array( 1 );
var dif = new Float64Array( 1 );
var IWORK = new Int32Array( 10 );

ztgsyl.ndarray( 'no-transpose', 0, 2, 2, A, 1, 2, 0, B, 1, 2, 0, C, 1, 2, 0, D, 1, 2, 0, E, 1, 2, 0, F, 1, 2, 0, scale, dif, null, 1, 0, -1, IWORK, 1, 0 );
```

The function has the following additional parameters:

-   **strideA1**: stride of dimension 1 of `A`.
-   **strideA2**: stride of dimension 2 of `A`.
-   **offsetA**: starting index for `A`.
-   **strideB1**: stride of dimension 1 of `B`.
-   **strideB2**: stride of dimension 2 of `B`.
-   **offsetB**: starting index for `B`.
-   **strideC1**: stride of dimension 1 of `C`.
-   **strideC2**: stride of dimension 2 of `C`.
-   **offsetC**: starting index for `C`.
-   **strideD1**: stride of dimension 1 of `D`.
-   **strideD2**: stride of dimension 2 of `D`.
-   **offsetD**: starting index for `D`.
-   **strideE1**: stride of dimension 1 of `E`.
-   **strideE2**: stride of dimension 2 of `E`.
-   **offsetE**: starting index for `E`.
-   **strideF1**: stride of dimension 1 of `F`.
-   **strideF2**: stride of dimension 2 of `F`.
-   **offsetF**: starting index for `F`.
-   **offsetWORK**: starting index for `WORK`.
-   **offsetIWORK**: starting index for `IWORK`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `ztgsyl()` corresponds to the [LAPACK][lapack] level routine [`ztgsyl`][lapack-ztgsyl].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Complex128Array = require( '@stdlib/array/complex128' );
var Int32Array = require( '@stdlib/array/int32' );
var ztgsyl = require( '@stdlib/lapack/base/ztgsyl' );

var A = new Complex128Array( [ 1.0, 0.5, 0.0, 0.0, 0.5, 0.2, 2.0, -0.3 ] );
var B = new Complex128Array( [ 3.0, 0.1, 0.0, 0.0, 0.3, -0.1, 4.0, 0.2 ] );
var C = new Complex128Array( [ 1.0, 0.5, 3.0, 1.0, 2.0, -0.5, 4.0, 0.3 ] );
var D = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.2, 0.1, 1.5, -0.1 ] );
var E = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.1, 0.05, 2.0, 0.1 ] );
var F = new Complex128Array( [ 5.0, 1.0, 7.0, 0.5, 6.0, -1.0, 8.0, 0.2 ] );
var scale = new Float64Array( 1 );
var dif = new Float64Array( 1 );
var IWORK = new Int32Array( 10 );

ztgsyl.ndarray( 'no-transpose', 0, 2, 2, A, 1, 2, 0, B, 1, 2, 0, C, 1, 2, 0, D, 1, 2, 0, E, 1, 2, 0, F, 1, 2, 0, scale, dif, null, 1, 0, -1, IWORK, 1, 0 );
```

</section>

<!-- /.examples -->

<!-- fortran-docs:start (generated by bin/fortran-docs.mjs from data/lapack-3.12.0/SRC/ztgsyl.f; do not edit) -->

<section class="fortran-docs">

## Reference documentation

From the reference LAPACK 3.12.0 source of `ZTGSYL`, converted to Markdown with KaTeX math. Indices are the 1-based Fortran indices of the source.

### Purpose

ZTGSYL solves the generalized Sylvester equation:

$A \, R - L \, B$ = scale \* C (1) $D \, R - L \, E$ = scale \* F

where R and L are unknown m-by-n matrices, (A, D), (B, E) and (C, F) are given matrix pairs of size m-by-m, n-by-n and m-by-n, respectively, with complex entries. A, B, D and E are upper triangular (i.e., (A,D) and (B,E) in generalized Schur form).

The solution (R, L) overwrites (C, F). $0 \le \mathrm{SCALE} \le 1$ is an output scaling factor chosen to avoid overflow.

In matrix notation (1) is equivalent to solve Zx = scale\*b, where Z is defined as

```text
Z = [ kron(In, A)  -kron(B**H, Im) ]        (2)
    [ kron(In, D)  -kron(E**H, Im) ],
```

Here Ix is the identity matrix of size x and $X^H$ is the conjugate transpose of X. Kron(X, Y) is the Kronecker product between the matrices X and Y.

If `TRANS = 'C'`, y in the conjugate transposed system $Z^H \, y$ = scale\*b is solved for, which is equivalent to solve for R and L in

$A^H \, R + D^H \, L$ = scale \* C (3) $R \, B^H + L \, E^H$ = scale \* -F

This case (`TRANS` = 'C') is used to compute an one-norm-based estimate of Dif\[(A,D), (B,E)\], the separation between the matrix pairs (A,D) and (B,E), using ZLACON.

If $\mathrm{IJOB} \ge 1$, ZTGSYL computes a Frobenius norm-based estimate of Dif\[(A,D),(B,E)\]. That is, the reciprocal of a lower bound on the reciprocal of the smallest singular value of Z.

This is a level-3 BLAS algorithm.

### Arguments

#### TRANS `[in]`

_CHARACTER\*1_

-   `= 'N'`: solve the generalized sylvester equation (1).
-   `= 'C'`: solve the "conjugate transposed" system (3).

#### IJOB `[in]`

_INTEGER_

Specifies what kind of functionality to be performed.

-   `=0`: solve (1) only.
-   `=1`: The functionality of 0 and 3.
-   `=2`: The functionality of 0 and 4.
-   `=3`: Only an estimate of Dif\[(A,D), (B,E)\] is computed. (look ahead strategy is used).
-   `=4`: Only an estimate of Dif\[(A,D), (B,E)\] is computed. (ZGECON on sub-systems is used). Not referenced if `TRANS = 'C'`.

#### M `[in]`

_INTEGER_

The order of the matrices A and D, and the row dimension of the matrices C, F, R and L.

#### N `[in]`

_INTEGER_

The order of the matrices B and E, and the column dimension of the matrices C, F, R and L.

#### A `[in]`

_COMPLEX\*16 array, dimension (LDA, M)_

The upper triangular matrix A.

#### LDA `[in]`

_INTEGER_

The leading dimension of the array A. $\mathrm{LDA} \ge \max (1, M)$.

#### B `[in]`

_COMPLEX\*16 array, dimension (LDB, N)_

The upper triangular matrix B.

#### LDB `[in]`

_INTEGER_

The leading dimension of the array B. $\mathrm{LDB} \ge \max (1, N)$.

#### C `[in,out]`

_COMPLEX\*16 array, dimension (LDC, N)_

On entry, C contains the right-hand-side of the first matrix equation in (1) or (3). On exit, if `IJOB = 0`, 1 or 2, C has been overwritten by the solution R. If `IJOB = 3` or 4 and `TRANS = 'N'`, C holds R, the solution achieved during the computation of the Dif-estimate.

#### LDC `[in]`

_INTEGER_

The leading dimension of the array C. $\mathrm{LDC} \ge \max (1, M)$.

#### D `[in]`

_COMPLEX\*16 array, dimension (LDD, M)_

The upper triangular matrix D.

#### LDD `[in]`

_INTEGER_

The leading dimension of the array D. $\mathrm{LDD} \ge \max (1, M)$.

#### E `[in]`

_COMPLEX\*16 array, dimension (LDE, N)_

The upper triangular matrix E.

#### LDE `[in]`

_INTEGER_

The leading dimension of the array E. $\mathrm{LDE} \ge \max (1, N)$.

#### F `[in,out]`

_COMPLEX\*16 array, dimension (LDF, N)_

On entry, F contains the right-hand-side of the second matrix equation in (1) or (3). On exit, if `IJOB = 0`, 1 or 2, F has been overwritten by the solution L. If `IJOB = 3` or 4 and `TRANS = 'N'`, F holds L, the solution achieved during the computation of the Dif-estimate.

#### LDF `[in]`

_INTEGER_

The leading dimension of the array F. $\mathrm{LDF} \ge \max (1, M)$.

#### DIF `[out]`

_DOUBLE PRECISION_

On exit `DIF` is the reciprocal of a lower bound of the reciprocal of the Dif-function, i.e. `DIF` is an upper bound of Dif\[(A,D), (B,E)\] = $\sigma$-min(Z), where Z as in (2). IF `IJOB = 0` or `TRANS = 'C'`, `DIF` is not referenced.

#### SCALE `[out]`

_DOUBLE PRECISION_

On exit `SCALE` is the scaling factor in (1) or (3). If $0 < \mathrm{SCALE} < 1$, C and F hold the solutions R and L, resp., to a slightly perturbed system but the input matrices A, B, D and E have not been changed. If `SCALE = 0`, R and L will hold the solutions to the homogeneous system with $C = F = 0$.

#### WORK `[out]`

_COMPLEX\*16 array, dimension (MAX(1,LWORK))_

On exit, if `INFO = 0`, `WORK(1)` returns the optimal `LWORK`.

#### LWORK `[in]`

_INTEGER_

The dimension of the array `WORK`. `LWORK` \> = 1. If `IJOB = 1` or 2 and `TRANS = 'N'`, $\mathrm{LWORK} \ge \max (1,2 \, M \, N)$.

If `LWORK = -1`, then a workspace query is assumed; the routine only calculates the optimal size of the `WORK` array, returns this value as the first entry of the `WORK` array, and no error message related to `LWORK` is issued by XERBLA.

#### IWORK `[out]`

_INTEGER array, dimension (M+N+2)_

#### INFO `[out]`

_INTEGER_

-   `=0`: successful exit
-   `<0`: If `INFO = -i`, the i-th argument had an illegal value.
-   `>0`: (A, D) and (B, E) have common or very close eigenvalues.

</section>

<!-- fortran-docs:end -->

<!-- Section for related `stdlib` packages. Do not manually edit this section, as it is automatically populated. -->

<section class="related">

</section>

<!-- /.related -->

<!-- Section for all links. Make sure to keep an empty line after the `section` element and another before the `/section` close. -->

<section class="links">

[lapack]: https://www.netlib.org/lapack/explore-html/

[lapack-ztgsyl]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__ztgsyl.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->