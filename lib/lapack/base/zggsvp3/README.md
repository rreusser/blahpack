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

# zggsvp3

> Computes unitary matrices for generalized SVD pre-processing of a complex matrix pair

<section class="usage">

## Usage

```javascript
var zggsvp3 = require( '@stdlib/lapack/base/zggsvp3' );
```

#### zggsvp3( order, jobu, jobv, jobq, M, p, N, A, LDA, B, LDB, tola, tolb, K, l, U, LDU, V, LDV, Q, LDQ, IWORK, strideIWORK, offsetIWORK, RWORK, strideRWORK, TAU, strideTAU, WORK, strideWORK, lwork )

Computes unitary matrices for generalized SVD pre-processing of a complex matrix pair

```javascript
var Complex128Array = require( '@stdlib/array/complex128' );
var Float64Array = require( '@stdlib/array/float64' );
var Int32Array = require( '@stdlib/array/int32' );

var A = new Complex128Array( [ 1.0, 0.0, 2.0, 0.0, 3.0, 0.0, 4.0, 0.0 ] );
var B = new Complex128Array( [ 5.0, 0.0, 0.0, 0.0, 0.0, 0.0, 5.0, 0.0 ] );
var U = new Complex128Array( 4 );
var V = new Complex128Array( 4 );
var Q = new Complex128Array( 4 );
var IWORK = new Int32Array( 2 );
var RWORK = new Float64Array( 4 );
var TAU = new Complex128Array( 2 );
var WORK = new Complex128Array( 100 );
var K = [ 0 ];
var L = [ 0 ];

zggsvp3.ndarray( 'compute-U', 'compute-V', 'compute-Q', 2, 2, 2, A, 1, 2, 0, B, 1, 2, 0, 1e-8, 1e-8, K, L, U, 1, 2, 0, V, 1, 2, 0, Q, 1, 2, 0, IWORK, 1, 0, RWORK, 1, 0, TAU, 1, 0, WORK, 1, 0, 100 );
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **jobu**: specifies the operation type.
-   **jobv**: specifies the operation type.
-   **jobq**: specifies the operation type.
-   **M**: number of rows.
-   **p**: p.
-   **N**: number of columns.
-   **A**: input matrix.
-   **LDA**: leading dimension of `A`.
-   **B**: input matrix.
-   **LDB**: leading dimension of `B`.
-   **tola**: tola.
-   **tolb**: tolb.
-   **K**: number of superdiagonals.
-   **l**: l.
-   **U**: input matrix.
-   **LDU**: leading dimension of `U`.
-   **V**: input matrix.
-   **LDV**: leading dimension of `V`.
-   **Q**: input matrix.
-   **LDQ**: leading dimension of `Q`.
-   **IWORK**: input array.
-   **strideIWORK**: stride length for `IWORK`.
-   **offsetIWORK**: starting index for `IWORK`.
-   **RWORK**: input array.
-   **strideRWORK**: stride length for `RWORK`.
-   **TAU**: input array.
-   **strideTAU**: stride length for `TAU`.
-   **WORK**: output array.
-   **strideWORK**: stride length for `WORK`.
-   **lwork**: lwork.

#### zggsvp3.ndarray( jobu, jobv, jobq, M, p, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, tola, tolb, K, l, U, strideU1, strideU2, offsetU, V, strideV1, strideV2, offsetV, Q, strideQ1, strideQ2, offsetQ, IWORK, strideIWORK, offsetIWORK, RWORK, strideRWORK, offsetRWORK, TAU, strideTAU, offsetTAU, WORK, strideWORK, offsetWORK, lwork )

Computes unitary matrices for generalized SVD pre-processing of a complex matrix pair, using alternative indexing semantics.

```javascript
var Complex128Array = require( '@stdlib/array/complex128' );
var Float64Array = require( '@stdlib/array/float64' );
var Int32Array = require( '@stdlib/array/int32' );

var A = new Complex128Array( [ 1.0, 0.0, 2.0, 0.0, 3.0, 0.0, 4.0, 0.0 ] );
var B = new Complex128Array( [ 5.0, 0.0, 0.0, 0.0, 0.0, 0.0, 5.0, 0.0 ] );
var U = new Complex128Array( 4 );
var V = new Complex128Array( 4 );
var Q = new Complex128Array( 4 );
var IWORK = new Int32Array( 2 );
var RWORK = new Float64Array( 4 );
var TAU = new Complex128Array( 2 );
var WORK = new Complex128Array( 100 );
var K = [ 0 ];
var L = [ 0 ];

zggsvp3.ndarray( 'compute-U', 'compute-V', 'compute-Q', 2, 2, 2, A, 1, 2, 0, B, 1, 2, 0, 1e-8, 1e-8, K, L, U, 1, 2, 0, V, 1, 2, 0, Q, 1, 2, 0, IWORK, 1, 0, RWORK, 1, 0, TAU, 1, 0, WORK, 1, 0, 100 );
```

The function has the following additional parameters:

-   **jobu**: specifies the operation type.
-   **jobv**: specifies the operation type.
-   **jobq**: specifies the operation type.
-   **M**: number of rows.
-   **p**: p.
-   **N**: number of columns.
-   **A**: input matrix.
-   **strideA1**: stride of dimension 1 of `A`.
-   **strideA2**: stride of dimension 2 of `A`.
-   **offsetA**: starting index for `A`.
-   **B**: input matrix.
-   **strideB1**: stride of dimension 1 of `B`.
-   **strideB2**: stride of dimension 2 of `B`.
-   **offsetB**: starting index for `B`.
-   **tola**: tola.
-   **tolb**: tolb.
-   **K**: number of superdiagonals.
-   **l**: l.
-   **U**: input matrix.
-   **strideU1**: stride of dimension 1 of `U`.
-   **strideU2**: stride of dimension 2 of `U`.
-   **offsetU**: starting index for `U`.
-   **V**: input matrix.
-   **strideV1**: stride of dimension 1 of `V`.
-   **strideV2**: stride of dimension 2 of `V`.
-   **offsetV**: starting index for `V`.
-   **Q**: input matrix.
-   **strideQ1**: stride of dimension 1 of `Q`.
-   **strideQ2**: stride of dimension 2 of `Q`.
-   **offsetQ**: starting index for `Q`.
-   **IWORK**: input array.
-   **strideIWORK**: stride length for `IWORK`.
-   **offsetIWORK**: starting index for `IWORK`.
-   **RWORK**: input array.
-   **strideRWORK**: stride length for `RWORK`.
-   **offsetRWORK**: starting index for `RWORK`.
-   **TAU**: input array.
-   **strideTAU**: stride length for `TAU`.
-   **offsetTAU**: starting index for `TAU`.
-   **WORK**: output array.
-   **strideWORK**: stride length for `WORK`.
-   **offsetWORK**: starting index for `WORK`.
-   **lwork**: lwork.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `jobu`, `jobv`, `jobq` accept either `'compute-U'`/`'compute-V'`/`'compute-Q'` to compute the corresponding unitary matrix, or `'none'` to skip.
-   On exit, `K[0]` and `L[0]` hold the numerical ranks that define the GSVD block structure.
-   `RWORK` must have length at least `2*N`; `TAU` must have length at least `min(M,N)`; `WORK` must have length `lwork` as returned by the workspace query path in reference LAPACK.

</section>

<!-- /.notes -->

<section class="examples">

## Examples

```javascript
var Complex128Array = require( '@stdlib/array/complex128' );
var Float64Array = require( '@stdlib/array/float64' );
var Int32Array = require( '@stdlib/array/int32' );
var zggsvp3 = require( '@stdlib/lapack/base/zggsvp3' );

var A = new Complex128Array( [ 1.0, 0.5, 2.0, 0.0, 3.0, -0.5, 4.0, 1.0 ] );
var B = new Complex128Array( [ 5.0, 0.0, 1.0, 0.5, 1.0, -0.5, 5.0, 0.0 ] );
var U = new Complex128Array( 4 );
var V = new Complex128Array( 4 );
var Q = new Complex128Array( 4 );
var IWORK = new Int32Array( 2 );
var RWORK = new Float64Array( 4 );
var TAU = new Complex128Array( 2 );
var WORK = new Complex128Array( 200 );
var K = [ 0 ];
var L = [ 0 ];

var info = zggsvp3.ndarray( 'compute-U', 'compute-V', 'compute-Q', 2, 2, 2, A, 1, 2, 0, B, 1, 2, 0, 1e-8, 1e-8, K, L, U, 1, 2, 0, V, 1, 2, 0, Q, 1, 2, 0, IWORK, 1, 0, RWORK, 1, 0, TAU, 1, 0, WORK, 1, 0, 200 );

console.log( 'info: %d, K: %d, L: %d', info, K[ 0 ], L[ 0 ] );
```

</section>

<!-- /.examples -->

<!-- fortran-docs:start (generated by bin/fortran-docs.mjs from data/lapack-3.12.0/SRC/zggsvp3.f; do not edit) -->

<section class="fortran-docs">

## Reference documentation

From the reference LAPACK 3.12.0 source of `ZGGSVP3`, converted to Markdown with KaTeX math. Indices are the 1-based Fortran indices of the source.

### Purpose

ZGGSVP3 computes unitary matrices U, V and Q such that

```text
                  N-K-L  K    L
U**H*A*Q =     K ( 0    A12  A13 )  if M-K-L >= 0;
               L ( 0     0   A23 )
           M-K-L ( 0     0    0  )
```

```text
         N-K-L  K    L
=     K ( 0    A12  A13 )  if M-K-L < 0;
    M-K ( 0     0   A23 )
```

```text
                N-K-L  K    L
V**H*B*Q =   L ( 0     0   B13 )
           P-L ( 0     0    0  )
```

where the K-by-K matrix A12 and L-by-L matrix B13 are nonsingular upper triangular; A23 is L-by-L upper triangular if $M-K-L \ge 0$, otherwise A23 is (M-K)-by-L upper trapezoidal. K+L = the effective numerical rank of the (M+P)-by-N matrix $(A^H,B^H)^H$.

This decomposition is the preprocessing step for computing the Generalized Singular Value Decomposition (GSVD), see subroutine ZGGSVD3.

### Arguments

#### JOBU `[in]`

_CHARACTER\*1_

-   `= 'U'`: Unitary matrix U is computed;
-   `= 'N'`: U is not computed.

#### JOBV `[in]`

_CHARACTER\*1_

-   `= 'V'`: Unitary matrix V is computed;
-   `= 'N'`: V is not computed.

#### JOBQ `[in]`

_CHARACTER\*1_

-   `= 'Q'`: Unitary matrix Q is computed;
-   `= 'N'`: Q is not computed.

#### M `[in]`

_INTEGER_

The number of rows of the matrix A. $M \ge 0$.

#### P `[in]`

_INTEGER_

The number of rows of the matrix B. $P \ge 0$.

#### N `[in]`

_INTEGER_

The number of columns of the matrices A and B. $N \ge 0$.

#### A `[in,out]`

_COMPLEX\*16 array, dimension (LDA,N)_

On entry, the M-by-N matrix A. On exit, A contains the triangular (or trapezoidal) matrix described in the Purpose section.

#### LDA `[in]`

_INTEGER_

The leading dimension of the array A. $\mathrm{LDA} \ge \max (1,M)$.

#### B `[in,out]`

_COMPLEX\*16 array, dimension (LDB,N)_

On entry, the P-by-N matrix B. On exit, B contains the triangular matrix described in the Purpose section.

#### LDB `[in]`

_INTEGER_

The leading dimension of the array B. $\mathrm{LDB} \ge \max (1,P)$.

#### TOLA `[in]`

_DOUBLE PRECISION_

#### TOLB `[in]`

_DOUBLE PRECISION_

`TOLA` and `TOLB` are the thresholds to determine the effective numerical rank of matrix B and a subblock of A. Generally, they are set to

$$
\mathrm{TOLA} = \max (M,N) \, \operatorname{norm}(A) \, \mathrm{MAZHEPS}
$$

$$
\mathrm{TOLB} = \max (P,N) \, \operatorname{norm}(B) \, \mathrm{MAZHEPS}
$$

The size of `TOLA` and `TOLB` may affect the size of backward errors of the decomposition.

#### K `[out]`

_INTEGER_

#### L `[out]`

_INTEGER_

On exit, K and L specify the dimension of the subblocks described in Purpose section. K + L = effective numerical rank of $(A^H,B^H)^H$.

#### U `[out]`

_COMPLEX\*16 array, dimension (LDU,M)_

If `JOBU = 'U'`, U contains the unitary matrix U. If `JOBU = 'N'`, U is not referenced.

#### LDU `[in]`

_INTEGER_

The leading dimension of the array U. $\mathrm{LDU} \ge \max (1,M)$ if `JOBU = 'U'`; $\mathrm{LDU} \ge 1$ otherwise.

#### V `[out]`

_COMPLEX\*16 array, dimension (LDV,P)_

If `JOBV = 'V'`, V contains the unitary matrix V. If `JOBV = 'N'`, V is not referenced.

#### LDV `[in]`

_INTEGER_

The leading dimension of the array V. $\mathrm{LDV} \ge \max (1,P)$ if `JOBV = 'V'`; $\mathrm{LDV} \ge 1$ otherwise.

#### Q `[out]`

_COMPLEX\*16 array, dimension (LDQ,N)_

If `JOBQ = 'Q'`, Q contains the unitary matrix Q. If `JOBQ = 'N'`, Q is not referenced.

#### LDQ `[in]`

_INTEGER_

The leading dimension of the array Q. $\mathrm{LDQ} \ge \max (1,N)$ if `JOBQ = 'Q'`; $\mathrm{LDQ} \ge 1$ otherwise.

#### IWORK `[out]`

_INTEGER array, dimension (N)_

#### RWORK `[out]`

_DOUBLE PRECISION array, dimension (2\*N)_

#### TAU `[out]`

_COMPLEX\*16 array, dimension (N)_

#### WORK `[out]`

_COMPLEX\*16 array, dimension (MAX(1,LWORK))_

On exit, if `INFO = 0`, `WORK(1)` returns the optimal `LWORK`.

#### LWORK `[in]`

_INTEGER_

The dimension of the array `WORK`.

If `LWORK = -1`, then a workspace query is assumed; the routine only calculates the optimal size of the `WORK` array, returns this value as the first entry of the `WORK` array, and no error message related to `LWORK` is issued by XERBLA.

#### INFO `[out]`

_INTEGER_

-   `= 0`: successful exit
-   `< 0`: if `INFO = -i`, the i-th argument had an illegal value.

### Further Details

The subroutine uses LAPACK subroutine ZGEQP3 for the QR factorization with column pivoting to detect the effective numerical rank of the a matrix. It may be replaced by a better rank determination strategy.

ZGGSVP3 replaces the deprecated subroutine ZGGSVP.

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
