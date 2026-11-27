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

# dggsvd3

> Computes the singular value decomposition (SVD).

<section class="usage">

## Usage

```javascript
var dggsvd3 = require( '@stdlib/lapack/base/dggsvd3' );
```

#### dggsvd3( jobu, jobv, jobq, M, N, p, K, l, A, LDA, B, LDB, ALPHA, strideALPHA, BETA, strideBETA, U, LDU, V, LDV, Q, LDQ, WORK, strideWORK, lwork, IWORK, strideIWORK )

Computes the singular value decomposition (SVD).

```javascript
var dggsvd3 = require( '@stdlib/lapack/base/dggsvd3' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var B = discreteUniform( N * N, -10, 10, opts );
var U = discreteUniform( N * N, -10, 10, opts );
var V = discreteUniform( N * N, -10, 10, opts );
var Q = discreteUniform( N * N, -10, 10, opts );
var ALPHA = discreteUniform( N, -10, 10, opts );
var BETA = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );
var IWORK = discreteUniform( N, -10, 10, opts );

dggsvd3.ndarray( 'compute-U', 'compute-V', 'compute-Q', N, N, 1, N, 1, A, N, 1, 0, B, N, 1, 0, ALPHA, 1, 0, BETA, 1, 0, U, N, 1, 0, V, N, 1, 0, Q, N, 1, 0, WORK, 1, 0, N, IWORK, 1, 0 );
```

The function has the following parameters:

-   **jobu**: `jobu`.
-   **jobv**: `jobv`.
-   **jobq**: `jobq`.
-   **M**: number of rows.
-   **N**: number of columns.
-   **p**: `p`.
-   **K**: inner dimension.
-   **l**: `l`.
-   **A**: input array `A`.
-   **LDA**: leading dimension of `A`.
-   **B**: input array `B`.
-   **LDB**: leading dimension of `B`.
-   **ALPHA**: input array `ALPHA`.
-   **strideALPHA**: stride length for `ALPHA`.
-   **BETA**: input array `BETA`.
-   **strideBETA**: stride length for `BETA`.
-   **U**: input array `U`.
-   **LDU**: leading dimension of `U`.
-   **V**: input array `V`.
-   **LDV**: leading dimension of `V`.
-   **Q**: input array `Q`.
-   **LDQ**: leading dimension of `Q`.
-   **WORK**: input array `WORK`.
-   **strideWORK**: stride length for `WORK`.
-   **lwork**: `lwork`.
-   **IWORK**: input array `IWORK`.
-   **strideIWORK**: stride length for `IWORK`.

#### dggsvd3.ndarray( jobu, jobv, jobq, M, N, p, K, l, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, ALPHA, strideALPHA, offsetALPHA, BETA, strideBETA, offsetBETA, U, strideU1, strideU2, offsetU, V, strideV1, strideV2, offsetV, Q, strideQ1, strideQ2, offsetQ, WORK, strideWORK, offsetWORK, lwork, IWORK, strideIWORK, offsetIWORK )

Computes the singular value decomposition (SVD), using alternative indexing semantics.

```javascript
var dggsvd3 = require( '@stdlib/lapack/base/dggsvd3' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var B = discreteUniform( N * N, -10, 10, opts );
var U = discreteUniform( N * N, -10, 10, opts );
var V = discreteUniform( N * N, -10, 10, opts );
var Q = discreteUniform( N * N, -10, 10, opts );
var ALPHA = discreteUniform( N, -10, 10, opts );
var BETA = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );
var IWORK = discreteUniform( N, -10, 10, opts );

dggsvd3.ndarray( 'compute-U', 'compute-V', 'compute-Q', N, N, 1, N, 1, A, N, 1, 0, B, N, 1, 0, ALPHA, 1, 0, BETA, 1, 0, U, N, 1, 0, V, N, 1, 0, Q, N, 1, 0, WORK, 1, 0, N, IWORK, 1, 0 );
```

The function has the following additional parameters:

-   **strideA1**: stride of dimension 1 of `A`.
-   **strideA2**: stride of dimension 2 of `A`.
-   **offsetA**: starting index for `A`.
-   **strideB1**: stride of dimension 1 of `B`.
-   **strideB2**: stride of dimension 2 of `B`.
-   **offsetB**: starting index for `B`.
-   **offsetALPHA**: starting index for `ALPHA`.
-   **offsetBETA**: starting index for `BETA`.
-   **strideU1**: stride of dimension 1 of `U`.
-   **strideU2**: stride of dimension 2 of `U`.
-   **offsetU**: starting index for `U`.
-   **strideV1**: stride of dimension 1 of `V`.
-   **strideV2**: stride of dimension 2 of `V`.
-   **offsetV**: starting index for `V`.
-   **strideQ1**: stride of dimension 1 of `Q`.
-   **strideQ2**: stride of dimension 2 of `Q`.
-   **offsetQ**: starting index for `Q`.
-   **offsetWORK**: starting index for `WORK`.
-   **offsetIWORK**: starting index for `IWORK`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `dggsvd3()` corresponds to the [LAPACK][lapack] level routine [`dggsvd3`][lapack-dggsvd3].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var dggsvd3 = require( '@stdlib/lapack/base/dggsvd3' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var B = discreteUniform( N * N, -10, 10, opts );
var U = discreteUniform( N * N, -10, 10, opts );
var V = discreteUniform( N * N, -10, 10, opts );
var Q = discreteUniform( N * N, -10, 10, opts );
var ALPHA = discreteUniform( N, -10, 10, opts );
var BETA = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );
var IWORK = discreteUniform( N, -10, 10, opts );

dggsvd3.ndarray( 'compute-U', 'compute-V', 'compute-Q', N, N, 1, N, 1, A, N, 1, 0, B, N, 1, 0, ALPHA, 1, 0, BETA, 1, 0, U, N, 1, 0, V, N, 1, 0, Q, N, 1, 0, WORK, 1, 0, N, IWORK, 1, 0 );
```

</section>

<!-- /.examples -->

<!-- fortran-docs:start (generated by bin/fortran-docs.mjs from data/lapack-3.12.0/SRC/dggsvd3.f; do not edit) -->

<section class="fortran-docs">

## Reference notes

The mathematical description from the reference LAPACK 3.12.0 source of `DGGSVD3`. Indices are the 1-based Fortran indices of the source.

### Purpose

DGGSVD3 computes the generalized singular value decomposition (GSVD) of an M-by-N real matrix A and P-by-N real matrix B:

$$
U^T \, A \, Q = D_{1} \, ( 0 R ), V^T \, B \, Q = D_{2} \, ( 0 R )
$$

where U, V and Q are orthogonal matrices. Let K+L = the effective numerical rank of the matrix $(A^T,B^T)^T$, then R is a K+L-by-K+L nonsingular upper triangular matrix, D1 and D2 are M-by-(K+L) and P-by-(K+L) "diagonal" matrices and of the following structures, respectively:

If $M-K-L \ge 0$,

```text
             K  L
D1 =     K ( I  0 )
         L ( 0  C )
     M-K-L ( 0  0 )
```

```text
           K  L
D2 =   L ( 0  S )
     P-L ( 0  0 )
```

```text
              N-K-L  K    L
( 0 R ) = K (  0   R11  R12 )
          L (  0    0   R22 )
```

where

$$
C = \operatorname{diag}( \mathrm{ALPHA}(K+1), \cdots , \mathrm{ALPHA}(K+L) )
$$

$$
S = \operatorname{diag}( \mathrm{BETA}(K+1), \cdots , \mathrm{BETA}(K+L) )
$$

$$
C^2 + S^2 = I
$$

R is stored in `A(1:K+L,N-K-L+1:N)` on exit.

If $M-K-L < 0$,

```text
           K M-K K+L-M
D1 =   K ( I  0    0   )
     M-K ( 0  C    0   )
```

```text
             K M-K K+L-M
D2 =   M-K ( 0  S    0  )
     K+L-M ( 0  0    I  )
       P-L ( 0  0    0  )
```

```text
                 N-K-L  K   M-K  K+L-M
( 0 R ) =     K ( 0    R11  R12  R13  )
            M-K ( 0     0   R22  R23  )
          K+L-M ( 0     0    0   R33  )
```

where

$$
C = \operatorname{diag}( \mathrm{ALPHA}(K+1), \cdots , \mathrm{ALPHA}(M) )
$$

$$
S = \operatorname{diag}( \mathrm{BETA}(K+1), \cdots , \mathrm{BETA}(M) )
$$

$$
C^2 + S^2 = I
$$

(R11 R12 R13 ) is stored in A(1:M, N-K-L+1:N), and R33 is stored ( 0 R22 R23 ) in `B(M-K+1:L,N+M-K-L+1:N)` on exit.

The routine computes C, S, R, and optionally the orthogonal transformation matrices U, V and Q.

In particular, if B is an N-by-N nonsingular matrix, then the GSVD of A and B implicitly gives the SVD of $A \, \operatorname{inv}(B)$:

$$
A \, \operatorname{inv}(B) = U \, (D_{1} \, \operatorname{inv}(D_{2})) \, V^T
$$

If $( A^T,B^T)^T$ has orthonormal columns, then the GSVD of A and B is also equal to the CS decomposition of A and B. Furthermore, the GSVD can be used to derive the solution of the eigenvalue problem:

$$
A^T \, A x = \lambda \, B^T \, B x
$$

In some literature, the GSVD of A and B is presented in the form

$$
U^T \, A \, X = ( 0 D_{1} ), V^T \, B \, X = ( 0 D_{2} )
$$

where U and V are orthogonal and X is nonsingular, D1 and D2 are \`\`diagonal''. The former GSVD form can be converted to the latter form by taking the nonsingular matrix X as

$$
X = Q \, \begin{pmatrix} I & 0 \\ 0 & \operatorname{inv}(R) \end{pmatrix}
$$

### Further Details

DGGSVD3 replaces the deprecated subroutine DGGSVD.

</section>

<!-- fortran-docs:end -->

<!-- Section for related `stdlib` packages. Do not manually edit this section, as it is automatically populated. -->

<section class="related">

</section>

<!-- /.related -->

<!-- Section for all links. Make sure to keep an empty line after the `section` element and another before the `/section` close. -->

<section class="links">

[lapack]: https://www.netlib.org/lapack/explore-html/

[lapack-dggsvd3]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__dggsvd3.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->