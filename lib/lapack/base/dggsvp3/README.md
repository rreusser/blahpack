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

# dggsvp3

> Computes orthogonal matrices U, V, and Q that reduce a matrix pair to triangular form for the generalized SVD.

<section class="usage">

## Usage

```javascript
var dggsvp3 = require( '@stdlib/lapack/base/dggsvp3' );
```

#### dggsvp3( jobu, jobv, jobq, M, p, N, A, LDA, B, LDB, tola, tolb, K, l, U, LDU, V, LDV, Q, LDQ, IWORK, strideIWORK, TAU, strideTAU, WORK, strideWORK, lwork )

Computes orthogonal matrices U, V, and Q that reduce a matrix pair to triangular form for the generalized SVD.

```javascript
var dggsvp3 = require( '@stdlib/lapack/base/dggsvp3' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var B = discreteUniform( N * N, -10, 10, opts );
var U = discreteUniform( N * N, -10, 10, opts );
var V = discreteUniform( N * N, -10, 10, opts );
var Q = discreteUniform( N * N, -10, 10, opts );
var IWORK = discreteUniform( N, -10, 10, opts );
var TAU = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );

dggsvp3.ndarray( 'compute-U', 'compute-V', 'compute-Q', N, 1, N, A, N, 1, 0, B, N, 1, 0, 1, 1, N, 1, U, N, 1, 0, V, N, 1, 0, Q, N, 1, 0, IWORK, 1, 0, TAU, 1, 0, WORK, 1, 0, N );
```

The function has the following parameters:

-   **jobu**: `jobu`.
-   **jobv**: `jobv`.
-   **jobq**: `jobq`.
-   **M**: number of rows.
-   **p**: `p`.
-   **N**: number of columns.
-   **A**: input array `A`.
-   **LDA**: leading dimension of `A`.
-   **B**: input array `B`.
-   **LDB**: leading dimension of `B`.
-   **tola**: `tola`.
-   **tolb**: `tolb`.
-   **K**: inner dimension.
-   **l**: `l`.
-   **U**: input array `U`.
-   **LDU**: leading dimension of `U`.
-   **V**: input array `V`.
-   **LDV**: leading dimension of `V`.
-   **Q**: input array `Q`.
-   **LDQ**: leading dimension of `Q`.
-   **IWORK**: input array `IWORK`.
-   **strideIWORK**: stride length for `IWORK`.
-   **TAU**: input array `TAU`.
-   **strideTAU**: stride length for `TAU`.
-   **WORK**: input array `WORK`.
-   **strideWORK**: stride length for `WORK`.
-   **lwork**: `lwork`.

#### dggsvp3.ndarray( jobu, jobv, jobq, M, p, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, tola, tolb, K, l, U, strideU1, strideU2, offsetU, V, strideV1, strideV2, offsetV, Q, strideQ1, strideQ2, offsetQ, IWORK, strideIWORK, offsetIWORK, TAU, strideTAU, offsetTAU, WORK, strideWORK, offsetWORK, lwork )

Computes orthogonal matrices U, V, and Q that reduce a matrix pair to triangular form for the generalized SVD, using alternative indexing semantics.

```javascript
var dggsvp3 = require( '@stdlib/lapack/base/dggsvp3' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var B = discreteUniform( N * N, -10, 10, opts );
var U = discreteUniform( N * N, -10, 10, opts );
var V = discreteUniform( N * N, -10, 10, opts );
var Q = discreteUniform( N * N, -10, 10, opts );
var IWORK = discreteUniform( N, -10, 10, opts );
var TAU = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );

dggsvp3.ndarray( 'compute-U', 'compute-V', 'compute-Q', N, 1, N, A, N, 1, 0, B, N, 1, 0, 1, 1, N, 1, U, N, 1, 0, V, N, 1, 0, Q, N, 1, 0, IWORK, 1, 0, TAU, 1, 0, WORK, 1, 0, N );
```

The function has the following additional parameters:

-   **strideA1**: stride of dimension 1 of `A`.
-   **strideA2**: stride of dimension 2 of `A`.
-   **offsetA**: starting index for `A`.
-   **strideB1**: stride of dimension 1 of `B`.
-   **strideB2**: stride of dimension 2 of `B`.
-   **offsetB**: starting index for `B`.
-   **strideU1**: stride of dimension 1 of `U`.
-   **strideU2**: stride of dimension 2 of `U`.
-   **offsetU**: starting index for `U`.
-   **strideV1**: stride of dimension 1 of `V`.
-   **strideV2**: stride of dimension 2 of `V`.
-   **offsetV**: starting index for `V`.
-   **strideQ1**: stride of dimension 1 of `Q`.
-   **strideQ2**: stride of dimension 2 of `Q`.
-   **offsetQ**: starting index for `Q`.
-   **offsetIWORK**: starting index for `IWORK`.
-   **offsetTAU**: starting index for `TAU`.
-   **offsetWORK**: starting index for `WORK`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `dggsvp3()` corresponds to the [LAPACK][lapack] level routine [`dggsvp3`][lapack-dggsvp3].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var dggsvp3 = require( '@stdlib/lapack/base/dggsvp3' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var B = discreteUniform( N * N, -10, 10, opts );
var U = discreteUniform( N * N, -10, 10, opts );
var V = discreteUniform( N * N, -10, 10, opts );
var Q = discreteUniform( N * N, -10, 10, opts );
var IWORK = discreteUniform( N, -10, 10, opts );
var TAU = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );

dggsvp3.ndarray( 'compute-U', 'compute-V', 'compute-Q', N, 1, N, A, N, 1, 0, B, N, 1, 0, 1, 1, N, 1, U, N, 1, 0, V, N, 1, 0, Q, N, 1, 0, IWORK, 1, 0, TAU, 1, 0, WORK, 1, 0, N );
```

</section>

<!-- /.examples -->

<!-- fortran-docs:start (generated by bin/fortran-docs.mjs from data/lapack-3.12.0/SRC/dggsvp3.f; do not edit) -->

<section class="fortran-docs">

## Reference documentation

From the reference LAPACK 3.12.0 source of `DGGSVP3`, converted to Markdown with KaTeX math. Indices are the 1-based Fortran indices of the source.

### Purpose

DGGSVP3 computes orthogonal matrices U, V and Q such that

```text
                  N-K-L  K    L
U**T*A*Q =     K ( 0    A12  A13 )  if M-K-L >= 0;
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
V**T*B*Q =   L ( 0     0   B13 )
           P-L ( 0     0    0  )
```

where the K-by-K matrix A12 and L-by-L matrix B13 are nonsingular upper triangular; A23 is L-by-L upper triangular if $M-K-L \ge 0$, otherwise A23 is (M-K)-by-L upper trapezoidal. K+L = the effective numerical rank of the (M+P)-by-N matrix $(A^T,B^T)^T$.

This decomposition is the preprocessing step for computing the Generalized Singular Value Decomposition (GSVD), see subroutine DGGSVD3.

### Arguments

#### JOBU `[in]`

_CHARACTER\*1_

-   `= 'U'`: Orthogonal matrix U is computed;
-   `= 'N'`: U is not computed.

#### JOBV `[in]`

_CHARACTER\*1_

-   `= 'V'`: Orthogonal matrix V is computed;
-   `= 'N'`: V is not computed.

#### JOBQ `[in]`

_CHARACTER\*1_

-   `= 'Q'`: Orthogonal matrix Q is computed;
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

_DOUBLE PRECISION array, dimension (LDA,N)_

On entry, the M-by-N matrix A. On exit, A contains the triangular (or trapezoidal) matrix described in the Purpose section.

#### LDA `[in]`

_INTEGER_

The leading dimension of the array A. $\mathrm{LDA} \ge \max (1,M)$.

#### B `[in,out]`

_DOUBLE PRECISION array, dimension (LDB,N)_

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
\mathrm{TOLA} = \max (M,N) \, \operatorname{norm}(A) \, \mathrm{MACHEPS}
$$

$$
\mathrm{TOLB} = \max (P,N) \, \operatorname{norm}(B) \, \mathrm{MACHEPS}
$$

The size of `TOLA` and `TOLB` may affect the size of backward errors of the decomposition.

#### K `[out]`

_INTEGER_

#### L `[out]`

_INTEGER_

On exit, K and L specify the dimension of the subblocks described in Purpose section. K + L = effective numerical rank of $(A^T,B^T)^T$.

#### U `[out]`

_DOUBLE PRECISION array, dimension (LDU,M)_

If `JOBU = 'U'`, U contains the orthogonal matrix U. If `JOBU = 'N'`, U is not referenced.

#### LDU `[in]`

_INTEGER_

The leading dimension of the array U. $\mathrm{LDU} \ge \max (1,M)$ if `JOBU = 'U'`; $\mathrm{LDU} \ge 1$ otherwise.

#### V `[out]`

_DOUBLE PRECISION array, dimension (LDV,P)_

If `JOBV = 'V'`, V contains the orthogonal matrix V. If `JOBV = 'N'`, V is not referenced.

#### LDV `[in]`

_INTEGER_

The leading dimension of the array V. $\mathrm{LDV} \ge \max (1,P)$ if `JOBV = 'V'`; $\mathrm{LDV} \ge 1$ otherwise.

#### Q `[out]`

_DOUBLE PRECISION array, dimension (LDQ,N)_

If `JOBQ = 'Q'`, Q contains the orthogonal matrix Q. If `JOBQ = 'N'`, Q is not referenced.

#### LDQ `[in]`

_INTEGER_

The leading dimension of the array Q. $\mathrm{LDQ} \ge \max (1,N)$ if `JOBQ = 'Q'`; $\mathrm{LDQ} \ge 1$ otherwise.

#### IWORK `[out]`

_INTEGER array, dimension (N)_

#### TAU `[out]`

_DOUBLE PRECISION array, dimension (N)_

#### WORK `[out]`

_DOUBLE PRECISION array, dimension (MAX(1,LWORK))_

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

The subroutine uses LAPACK subroutine DGEQP3 for the QR factorization with column pivoting to detect the effective numerical rank of the a matrix. It may be replaced by a better rank determination strategy.

DGGSVP3 replaces the deprecated subroutine DGGSVP.

</section>

<!-- fortran-docs:end -->

<!-- Section for related `stdlib` packages. Do not manually edit this section, as it is automatically populated. -->

<section class="related">

</section>

<!-- /.related -->

<!-- Section for all links. Make sure to keep an empty line after the `section` element and another before the `/section` close. -->

<section class="links">

[lapack]: https://www.netlib.org/lapack/explore-html/

[lapack-dggsvp3]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__dggsvp3.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->