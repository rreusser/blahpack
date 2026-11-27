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

# zggsvd3

> Computes the generalized SVD of a pair of complex matrices

<section class="usage">

## Usage

```javascript
var zggsvd3 = require( '@stdlib/lapack/base/zggsvd3' );
```

#### zggsvd3( order, jobu, jobv, jobq, M, N, p, K, l, A, LDA, B, LDB, ALPHA, strideALPHA, BETA, strideBETA, U, LDU, V, LDV, Q, LDQ, WORK, strideWORK, lwork, RWORK, strideRWORK, IWORK, strideIWORK, offsetIWORK )

Computes the generalized SVD of a pair of complex matrices

```javascript
var Complex128Array = require( '@stdlib/array/complex128' );
var Float64Array = require( '@stdlib/array/float64' );
var Int32Array = require( '@stdlib/array/int32' );

var A = new Complex128Array( 9 );
var B = new Complex128Array( 6 );
var ALPHA = new Float64Array( 3 );
var BETA = new Float64Array( 3 );
var U = new Complex128Array( 9 );
var V = new Complex128Array( 4 );
var Q = new Complex128Array( 9 );
var WORK = new Complex128Array( 500 );
var RWORK = new Float64Array( 12 );
var IWORK = new Int32Array( 3 );
var K = new Int32Array( 1 );
var L = new Int32Array( 1 );
// populate A and B, then:
// zggsvd3( 'compute-U', 'compute-V', 'compute-Q', 3, 3, 2, K, L, A, 3, B, 2, ALPHA, 1, BETA, 1, U, 3, V, 2, Q, 3, WORK, 1, 500, RWORK, 1, IWORK, 1 );
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **jobu**: specifies the operation type.
-   **jobv**: specifies the operation type.
-   **jobq**: specifies the operation type.
-   **M**: number of rows.
-   **N**: number of columns.
-   **p**: p.
-   **K**: number of superdiagonals.
-   **l**: l.
-   **A**: input matrix.
-   **LDA**: leading dimension of `A`.
-   **B**: input matrix.
-   **LDB**: leading dimension of `B`.
-   **ALPHA**: input array.
-   **strideALPHA**: stride length for `ALPHA`.
-   **BETA**: input array.
-   **strideBETA**: stride length for `BETA`.
-   **U**: input matrix.
-   **LDU**: leading dimension of `U`.
-   **V**: input matrix.
-   **LDV**: leading dimension of `V`.
-   **Q**: input matrix.
-   **LDQ**: leading dimension of `Q`.
-   **WORK**: input array.
-   **strideWORK**: stride length for `WORK`.
-   **lwork**: lwork.
-   **RWORK**: input array.
-   **strideRWORK**: stride length for `RWORK`.
-   **IWORK**: output array.
-   **strideIWORK**: stride length for `IWORK`.
-   **offsetIWORK**: starting index for `IWORK`.

#### zggsvd3.ndarray( jobu, jobv, jobq, M, N, p, K, l, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, ALPHA, strideALPHA, offsetALPHA, BETA, strideBETA, offsetBETA, U, strideU1, strideU2, offsetU, V, strideV1, strideV2, offsetV, Q, strideQ1, strideQ2, offsetQ, WORK, strideWORK, offsetWORK, lwork, RWORK, strideRWORK, offsetRWORK, IWORK, strideIWORK, offsetIWORK )

Computes the generalized SVD of a pair of complex matrices, using alternative indexing semantics.

```javascript
var Complex128Array = require( '@stdlib/array/complex128' );
var Float64Array = require( '@stdlib/array/float64' );
var Int32Array = require( '@stdlib/array/int32' );

var A = new Complex128Array( 9 );
var B = new Complex128Array( 6 );
var ALPHA = new Float64Array( 3 );
var BETA = new Float64Array( 3 );
var U = new Complex128Array( 9 );
var V = new Complex128Array( 4 );
var Q = new Complex128Array( 9 );
var WORK = new Complex128Array( 500 );
var RWORK = new Float64Array( 12 );
var IWORK = new Int32Array( 3 );
var K = new Int32Array( 1 );
var L = new Int32Array( 1 );
// populate A and B, then:
// zggsvd3( 'compute-U', 'compute-V', 'compute-Q', 3, 3, 2, K, L, A, 3, B, 2, ALPHA, 1, BETA, 1, U, 3, V, 2, Q, 3, WORK, 1, 500, RWORK, 1, IWORK, 1 );
```

The function has the following additional parameters:

-   **jobu**: specifies the operation type.
-   **jobv**: specifies the operation type.
-   **jobq**: specifies the operation type.
-   **M**: number of rows.
-   **N**: number of columns.
-   **p**: p.
-   **K**: number of superdiagonals.
-   **l**: l.
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
-   **WORK**: input array.
-   **strideWORK**: stride length for `WORK`.
-   **offsetWORK**: starting index for `WORK`.
-   **lwork**: lwork.
-   **RWORK**: input array.
-   **strideRWORK**: stride length for `RWORK`.
-   **offsetRWORK**: starting index for `RWORK`.
-   **IWORK**: output array.
-   **strideIWORK**: stride length for `IWORK`.
-   **offsetIWORK**: starting index for `IWORK`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `zggsvd3()` corresponds to the [LAPACK][lapack] level routine [`zggsvd3`][lapack-zggsvd3].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

```javascript
var zggsvd3 = require( '@stdlib/lapack/base/zggsvd3' );

// See examples/index.js for a complete example.
```

</section>

<!-- /.examples -->

<!-- fortran-docs:start (generated by bin/fortran-docs.mjs from data/lapack-3.12.0/SRC/zggsvd3.f; do not edit) -->

<section class="fortran-docs">

## Reference notes

The mathematical description from the reference LAPACK 3.12.0 source of `ZGGSVD3`. Indices are the 1-based Fortran indices of the source.

### Purpose

ZGGSVD3 computes the generalized singular value decomposition (GSVD) of an M-by-N complex matrix A and P-by-N complex matrix B:

$$
U^H \, A \, Q = D_{1} \, ( 0 R ), V^H \, B \, Q = D_{2} \, ( 0 R )
$$

where U, V and Q are unitary matrices. Let K+L = the effective numerical rank of the matrix $(A^H,B^H)^H$, then R is a (K+L)-by-(K+L) nonsingular upper triangular matrix, D1 and D2 are M-by-(K+L) and P-by-(K+L) "diagonal" matrices and of the following structures, respectively:

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

The routine computes C, S, R, and optionally the unitary transformation matrices U, V and Q.

In particular, if B is an N-by-N nonsingular matrix, then the GSVD of A and B implicitly gives the SVD of $A \, \operatorname{inv}(B)$:

$$
A \, \operatorname{inv}(B) = U \, (D_{1} \, \operatorname{inv}(D_{2})) \, V^H
$$

If $( A^H,B^H)^H$ has orthonormal columns, then the GSVD of A and B is also equal to the CS decomposition of A and B. Furthermore, the GSVD can be used to derive the solution of the eigenvalue problem:

$$
A^H \, A x = \lambda \, B^H \, B x
$$

In some literature, the GSVD of A and B is presented in the form

$$
U^H \, A \, X = ( 0 D_{1} ), V^H \, B \, X = ( 0 D_{2} )
$$

where U and V are orthogonal and X is nonsingular, and D1 and D2 are \`\`diagonal''. The former GSVD form can be converted to the latter form by taking the nonsingular matrix X as

$$
X = Q \, \begin{pmatrix} I & 0 \\ 0 & \operatorname{inv}(R) \end{pmatrix}
$$

### Further Details

ZGGSVD3 replaces the deprecated subroutine ZGGSVD.

</section>

<!-- fortran-docs:end -->

<!-- Section for related `stdlib` packages. Do not manually edit this section, as it is automatically populated. -->

<section class="related">

</section>

<!-- /.related -->

<!-- Section for all links. Make sure to keep an empty line after the `section` element and another before the `/section` close. -->

<section class="links">

[lapack]: https://www.netlib.org/lapack/explore-html/

[lapack-zggsvd3]: https://www.netlib.org/lapack/explore-html/dd/db4/group__ggsvd3.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array
[mdn-float32array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float32Array
[mdn-int32array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Int32Array
[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->
