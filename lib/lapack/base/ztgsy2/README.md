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

# ztgsy2

> Solves the generalized Sylvester matrix equation for small subsystems.

<section class="usage">

## Usage

```javascript
var ztgsy2 = require( '@stdlib/lapack/base/ztgsy2' );
```

#### ztgsy2( trans, ijob, M, N, A, LDA, B, LDB, C, LDC, D, LDD, E, LDE, F, LDF, scale, rdsum, rdscal )

Solves the generalized Sylvester matrix equation for small subsystems.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Complex128Array = require( '@stdlib/array/complex128' );
var ztgsy2 = require( '@stdlib/lapack/base/ztgsy2' );

var A = new Complex128Array( [ 1.0, 0.5, 0.0, 0.0, 0.5, 0.2, 2.0, -0.3 ] );
var B = new Complex128Array( [ 3.0, 0.1, 0.0, 0.0, 0.3, -0.1, 4.0, 0.2 ] );
var C = new Complex128Array( [ 1.0, 0.5, 3.0, 1.0, 2.0, -0.5, 4.0, 0.3 ] );
var D = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.2, 0.1, 1.5, -0.1 ] );
var E = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.1, 0.05, 2.0, 0.1 ] );
var F = new Complex128Array( [ 5.0, 1.0, 7.0, 0.5, 6.0, -1.0, 8.0, 0.2 ] );
var scale = new Float64Array( 1 );
var rdsum = new Float64Array( [ 0.0 ] );
var rdscal = new Float64Array( [ 1.0 ] );

ztgsy2.ndarray( 'no-transpose', 0, 2, 2, A, 1, 2, 0, B, 1, 2, 0, C, 1, 2, 0, D, 1, 2, 0, E, 1, 2, 0, F, 1, 2, 0, scale, rdsum, rdscal );
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
-   **rdsum**: `rdsum`.
-   **rdscal**: `rdscal`.

#### ztgsy2.ndarray( trans, ijob, M, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, C, strideC1, strideC2, offsetC, D, strideD1, strideD2, offsetD, E, strideE1, strideE2, offsetE, F, strideF1, strideF2, offsetF, scale, rdsum, rdscal )

Solves the generalized Sylvester matrix equation for small subsystems, using alternative indexing semantics.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Complex128Array = require( '@stdlib/array/complex128' );
var ztgsy2 = require( '@stdlib/lapack/base/ztgsy2' );

var A = new Complex128Array( [ 1.0, 0.5, 0.0, 0.0, 0.5, 0.2, 2.0, -0.3 ] );
var B = new Complex128Array( [ 3.0, 0.1, 0.0, 0.0, 0.3, -0.1, 4.0, 0.2 ] );
var C = new Complex128Array( [ 1.0, 0.5, 3.0, 1.0, 2.0, -0.5, 4.0, 0.3 ] );
var D = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.2, 0.1, 1.5, -0.1 ] );
var E = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.1, 0.05, 2.0, 0.1 ] );
var F = new Complex128Array( [ 5.0, 1.0, 7.0, 0.5, 6.0, -1.0, 8.0, 0.2 ] );
var scale = new Float64Array( 1 );
var rdsum = new Float64Array( [ 0.0 ] );
var rdscal = new Float64Array( [ 1.0 ] );

ztgsy2.ndarray( 'no-transpose', 0, 2, 2, A, 1, 2, 0, B, 1, 2, 0, C, 1, 2, 0, D, 1, 2, 0, E, 1, 2, 0, F, 1, 2, 0, scale, rdsum, rdscal );
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

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `ztgsy2()` corresponds to the [LAPACK][lapack] level routine [`ztgsy2`][lapack-ztgsy2].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Complex128Array = require( '@stdlib/array/complex128' );
var ztgsy2 = require( '@stdlib/lapack/base/ztgsy2' );

var A = new Complex128Array( [ 1.0, 0.5, 0.0, 0.0, 0.5, 0.2, 2.0, -0.3 ] );
var B = new Complex128Array( [ 3.0, 0.1, 0.0, 0.0, 0.3, -0.1, 4.0, 0.2 ] );
var C = new Complex128Array( [ 1.0, 0.5, 3.0, 1.0, 2.0, -0.5, 4.0, 0.3 ] );
var D = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.2, 0.1, 1.5, -0.1 ] );
var E = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.1, 0.05, 2.0, 0.1 ] );
var F = new Complex128Array( [ 5.0, 1.0, 7.0, 0.5, 6.0, -1.0, 8.0, 0.2 ] );
var scale = new Float64Array( 1 );
var rdsum = new Float64Array( [ 0.0 ] );
var rdscal = new Float64Array( [ 1.0 ] );

ztgsy2.ndarray( 'no-transpose', 0, 2, 2, A, 1, 2, 0, B, 1, 2, 0, C, 1, 2, 0, D, 1, 2, 0, E, 1, 2, 0, F, 1, 2, 0, scale, rdsum, rdscal );
```

</section>

<!-- /.examples -->

<!-- fortran-docs:start (generated by bin/fortran-docs.mjs from data/lapack-3.12.0/SRC/ztgsy2.f; do not edit) -->

<section class="fortran-docs">

## Reference documentation

From the reference LAPACK 3.12.0 source of `ZTGSY2`, converted to Markdown with KaTeX math. Indices are the 1-based Fortran indices of the source.

> Solves the generalized Sylvester equation (unblocked algorithm).

### Purpose

ZTGSY2 solves the generalized Sylvester equation

$A \, R - L \, B$ = scale \* C (1) $D \, R - L \, E$ = scale \* F

using Level 1 and 2 BLAS, where R and L are unknown M-by-N matrices, (A, D), (B, E) and (C, F) are given matrix pairs of size M-by-M, N-by-N and M-by-N, respectively. A, B, D and E are upper triangular (i.e., (A,D) and (B,E) in generalized Schur form).

The solution (R, L) overwrites (C, F). $0 \le \mathrm{SCALE} \le 1$ is an output scaling factor chosen to avoid overflow.

In matrix notation solving equation (1) corresponds to solve Zx = scale \* b, where Z is defined as

```text
Z = [ kron(In, A)  -kron(B**H, Im) ]             (2)
    [ kron(In, D)  -kron(E**H, Im) ],
```

Ik is the identity matrix of size k and $X^H$ is the conjugate transpose of X. kron(X, Y) is the Kronecker product between the matrices X and Y.

If `TRANS = 'C'`, y in the conjugate transposed system $Z^H \, y$ = scale\*b is solved for, which is equivalent to solve for R and L in

$A^H \, R + D^H \, L$ = scale \* C (3) $R \, B^H + L \, E^H$ = scale \* -F

This case is used to compute an estimate of Dif\[(A, D), (B, E)\] = = sigma\_min(Z) using reverse communication with ZLACON.

ZTGSY2 also (`IJOB` \>= 1) contributes to the computation in ZTGSYL of an upper bound on the separation between to matrix pairs. Then the input (A, D), (B, E) are sub-pencils of two matrix pairs in ZTGSYL.

### Arguments

#### TRANS `[in]`

_CHARACTER\*1_

-   `= 'N'`: solve the generalized Sylvester equation (1).
-   `= 'T'`: solve the 'transposed' system (3).

#### IJOB `[in]`

_INTEGER_

Specifies what kind of functionality to be performed.

-   `=0`: solve (1) only.
-   `=1`: A contribution from this subsystem to a Frobenius norm-based estimate of the separation between two matrix pairs is computed. (look ahead strategy is used).
-   `=2`: A contribution from this subsystem to a Frobenius norm-based estimate of the separation between two matrix pairs is computed. (DGECON on sub-systems is used.) Not referenced if `TRANS = 'T'`.

#### M `[in]`

_INTEGER_

On entry, M specifies the order of A and D, and the row dimension of C, F, R and L.

#### N `[in]`

_INTEGER_

On entry, N specifies the order of B and E, and the column dimension of C, F, R and L.

#### A `[in]`

_COMPLEX\*16 array, dimension (LDA, M)_

On entry, A contains an upper triangular matrix.

#### LDA `[in]`

_INTEGER_

The leading dimension of the matrix A. $\mathrm{LDA} \ge \max (1, M)$.

#### B `[in]`

_COMPLEX\*16 array, dimension (LDB, N)_

On entry, B contains an upper triangular matrix.

#### LDB `[in]`

_INTEGER_

The leading dimension of the matrix B. $\mathrm{LDB} \ge \max (1, N)$.

#### C `[in,out]`

_COMPLEX\*16 array, dimension (LDC, N)_

On entry, C contains the right-hand-side of the first matrix equation in (1). On exit, if `IJOB = 0`, C has been overwritten by the solution R.

#### LDC `[in]`

_INTEGER_

The leading dimension of the matrix C. $\mathrm{LDC} \ge \max (1, M)$.

#### D `[in]`

_COMPLEX\*16 array, dimension (LDD, M)_

On entry, D contains an upper triangular matrix.

#### LDD `[in]`

_INTEGER_

The leading dimension of the matrix D. $\mathrm{LDD} \ge \max (1, M)$.

#### E `[in]`

_COMPLEX\*16 array, dimension (LDE, N)_

On entry, E contains an upper triangular matrix.

#### LDE `[in]`

_INTEGER_

The leading dimension of the matrix E. $\mathrm{LDE} \ge \max (1, N)$.

#### F `[in,out]`

_COMPLEX\*16 array, dimension (LDF, N)_

On entry, F contains the right-hand-side of the second matrix equation in (1). On exit, if `IJOB = 0`, F has been overwritten by the solution L.

#### LDF `[in]`

_INTEGER_

The leading dimension of the matrix F. $\mathrm{LDF} \ge \max (1, M)$.

#### SCALE `[out]`

_DOUBLE PRECISION_

On exit, $0 \le \mathrm{SCALE} \le 1$. If $0 < \mathrm{SCALE} < 1$, the solutions R and L (C and F on entry) will hold the solutions to a slightly perturbed system but the input matrices A, B, D and E have not been changed. If `SCALE = 0`, R and L will hold the solutions to the homogeneous system with $C = F = 0$. Normally, `SCALE = 1`.

#### RDSUM `[in,out]`

_DOUBLE PRECISION_

On entry, the sum of squares of computed contributions to the Dif-estimate under computation by ZTGSYL, where the scaling factor `RDSCAL` (see below) has been factored out. On exit, the corresponding sum of squares updated with the contributions from the current sub-system. If `TRANS = 'T'` `RDSUM` is not touched. NOTE: `RDSUM` only makes sense when ZTGSY2 is called by ZTGSYL.

#### RDSCAL `[in,out]`

_DOUBLE PRECISION_

On entry, scaling factor used to prevent overflow in `RDSUM`. On exit, `RDSCAL` is updated w.r.t. the current contributions in `RDSUM`. If `TRANS = 'T'`, `RDSCAL` is not touched. NOTE: `RDSCAL` only makes sense when ZTGSY2 is called by ZTGSYL.

#### INFO `[out]`

_INTEGER_

On exit, if `INFO` is set to

-   `=0`: Successful exit
-   `<0`: If `INFO = -i`, input argument number i is illegal.
-   `>0`: The matrix pairs (A, D) and (B, E) have common or very close eigenvalues.

</section>

<!-- fortran-docs:end -->

<!-- Section for related `stdlib` packages. Do not manually edit this section, as it is automatically populated. -->

<section class="related">

</section>

<!-- /.related -->

<!-- Section for all links. Make sure to keep an empty line after the `section` element and another before the `/section` close. -->

<section class="links">

[lapack]: https://www.netlib.org/lapack/explore-html/

[lapack-ztgsy2]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__ztgsy2.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->