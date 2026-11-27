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

# ztgsja

> Computes the generalized singular value decomposition (GSVD) of two complex upper triangular (or trapezoidal) matrices A and B.

<section class="usage">

## Usage

```javascript
var ztgsja = require( '@stdlib/lapack/base/ztgsja' );
```

#### ztgsja( jobu, jobv, jobq, M, p, N, K, l, A, LDA, B, LDB, tola, tolb, ALPHA, BETA, U, LDU, V, LDV, Q, LDQ, WORK, ncycle )

Computes the generalized singular value decomposition (GSVD) of two complex upper triangular (or trapezoidal) matrices A and B.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Complex128Array = require( '@stdlib/array/complex128' );
var Int32Array = require( '@stdlib/array/int32' );
var ztgsja = require( '@stdlib/lapack/base/ztgsja' );

var M = 2;
var P = 2;
var N = 2;
var K = 0;
var L = 2;
var A = new Complex128Array( M * N );
var B = new Complex128Array( P * N );
var ALPHA = new Float64Array( N );
var BETA = new Float64Array( N );
var U = new Complex128Array( M * M );
var V = new Complex128Array( P * P );
var Q = new Complex128Array( N * N );
var WORK = new Complex128Array( 2 * N );
var ncycle = new Int32Array( 1 );

ztgsja.ndarray( 'initialize', 'initialize', 'initialize', M, P, N, K, L, A, 1, M, 0, B, 1, P, 0, 1e-14, 1e-14, ALPHA, 1, 0, BETA, 1, 0, U, 1, M, 0, V, 1, P, 0, Q, 1, N, 0, WORK, 1, 0, ncycle );
```

The function has the following parameters:

-   **jobu**: `jobu`.
-   **jobv**: `jobv`.
-   **jobq**: `jobq`.
-   **M**: number of rows.
-   **p**: `p`.
-   **N**: number of columns.
-   **K**: inner dimension.
-   **l**: `l`.
-   **A**: input array `A`.
-   **LDA**: leading dimension of `A`.
-   **B**: input array `B`.
-   **LDB**: leading dimension of `B`.
-   **tola**: `tola`.
-   **tolb**: `tolb`.
-   **ALPHA**: input array `ALPHA`.
-   **BETA**: input array `BETA`.
-   **U**: input array `U`.
-   **LDU**: leading dimension of `U`.
-   **V**: input array `V`.
-   **LDV**: leading dimension of `V`.
-   **Q**: input array `Q`.
-   **LDQ**: leading dimension of `Q`.
-   **WORK**: input array `WORK`.
-   **ncycle**: `ncycle`.

#### ztgsja.ndarray( jobu, jobv, jobq, M, p, N, K, l, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, tola, tolb, ALPHA, strideALPHA, offsetALPHA, BETA, strideBETA, offsetBETA, U, strideU1, strideU2, offsetU, V, strideV1, strideV2, offsetV, Q, strideQ1, strideQ2, offsetQ, WORK, strideWORK, offsetWORK, ncycle )

Computes the generalized singular value decomposition (GSVD) of two complex upper triangular (or trapezoidal) matrices A and B, using alternative indexing semantics.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Complex128Array = require( '@stdlib/array/complex128' );
var Int32Array = require( '@stdlib/array/int32' );
var ztgsja = require( '@stdlib/lapack/base/ztgsja' );

var M = 2;
var P = 2;
var N = 2;
var K = 0;
var L = 2;
var A = new Complex128Array( M * N );
var B = new Complex128Array( P * N );
var ALPHA = new Float64Array( N );
var BETA = new Float64Array( N );
var U = new Complex128Array( M * M );
var V = new Complex128Array( P * P );
var Q = new Complex128Array( N * N );
var WORK = new Complex128Array( 2 * N );
var ncycle = new Int32Array( 1 );

ztgsja.ndarray( 'initialize', 'initialize', 'initialize', M, P, N, K, L, A, 1, M, 0, B, 1, P, 0, 1e-14, 1e-14, ALPHA, 1, 0, BETA, 1, 0, U, 1, M, 0, V, 1, P, 0, Q, 1, N, 0, WORK, 1, 0, ncycle );
```

The function has the following additional parameters:

-   **strideA1**: stride of dimension 1 of `A`.
-   **strideA2**: stride of dimension 2 of `A`.
-   **offsetA**: starting index for `A`.
-   **strideB1**: stride of dimension 1 of `B`.
-   **strideB2**: stride of dimension 2 of `B`.
-   **offsetB**: starting index for `B`.
-   **strideALPHA**: stride length for `ALPHA`.
-   **offsetALPHA**: starting index for `ALPHA`.
-   **strideBETA**: stride length for `BETA`.
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
-   **strideWORK**: stride length for `WORK`.
-   **offsetWORK**: starting index for `WORK`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `ztgsja()` corresponds to the [LAPACK][lapack] level routine [`ztgsja`][lapack-ztgsja].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Complex128Array = require( '@stdlib/array/complex128' );
var Int32Array = require( '@stdlib/array/int32' );
var ztgsja = require( '@stdlib/lapack/base/ztgsja' );

var M = 2;
var P = 2;
var N = 2;
var K = 0;
var L = 2;
var A = new Complex128Array( M * N );
var B = new Complex128Array( P * N );
var ALPHA = new Float64Array( N );
var BETA = new Float64Array( N );
var U = new Complex128Array( M * M );
var V = new Complex128Array( P * P );
var Q = new Complex128Array( N * N );
var WORK = new Complex128Array( 2 * N );
var ncycle = new Int32Array( 1 );

ztgsja.ndarray( 'initialize', 'initialize', 'initialize', M, P, N, K, L, A, 1, M, 0, B, 1, P, 0, 1e-14, 1e-14, ALPHA, 1, 0, BETA, 1, 0, U, 1, M, 0, V, 1, P, 0, Q, 1, N, 0, WORK, 1, 0, ncycle );
```

</section>

<!-- /.examples -->

<!-- fortran-docs:start (generated by bin/fortran-docs.mjs from data/lapack-3.12.0/SRC/ztgsja.f; do not edit) -->

<section class="fortran-docs">

## Reference notes

The mathematical description from the reference LAPACK 3.12.0 source of `ZTGSJA`. Indices are the 1-based Fortran indices of the source.

### Purpose

ZTGSJA computes the generalized singular value decomposition (GSVD) of two complex upper triangular (or trapezoidal) matrices A and B.

On entry, it is assumed that matrices A and B have the following forms, which may be obtained by the preprocessing subroutine ZGGSVP from a general M-by-N matrix A and P-by-N matrix B:

```text
          N-K-L  K    L
A =    K ( 0    A12  A13 ) if M-K-L >= 0;
       L ( 0     0   A23 )
   M-K-L ( 0     0    0  )
```

```text
        N-K-L  K    L
A =  K ( 0    A12  A13 ) if M-K-L < 0;
   M-K ( 0     0   A23 )
```

```text
        N-K-L  K    L
B =  L ( 0     0   B13 )
   P-L ( 0     0    0  )
```

where the K-by-K matrix A12 and L-by-L matrix B13 are nonsingular upper triangular; A23 is L-by-L upper triangular if $M-K-L \ge 0$, otherwise A23 is (M-K)-by-L upper trapezoidal.

On exit,

$$
U^H \, A \, Q = D_{1} \, ( 0 R ), V^H \, B \, Q = D_{2} \, ( 0 R )
$$

where U, V and Q are unitary matrices. R is a nonsingular upper triangular matrix, and D1 and D2 are \`\`diagonal'' matrices, which are of the following structures:

If $M-K-L \ge 0$,

```text
             K  L
D1 =     K ( I  0 )
         L ( 0  C )
     M-K-L ( 0  0 )
```

```text
            K  L
D2 = L   ( 0  S )
     P-L ( 0  0 )
```

```text
             N-K-L  K    L
( 0 R ) = K (  0   R11  R12 ) K
          L (  0    0   R22 ) L
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
D2 =   M-K ( 0  S    0   )
     K+L-M ( 0  0    I   )
       P-L ( 0  0    0   )
```

```text
               N-K-L  K   M-K  K+L-M
( 0 R ) =    K ( 0    R11  R12  R13  )
          M-K ( 0     0   R22  R23  )
        K+L-M ( 0     0    0   R33  )
```

where $C = \operatorname{diag}( \mathrm{ALPHA}(K+1), \cdots , \mathrm{ALPHA}(M) )$, $S = \operatorname{diag}( \mathrm{BETA}(K+1), \cdots , \mathrm{BETA}(M) )$, $C^2 + S^2 = I$.

$R = ( R_{11} R_{12} R_{13} )$ is stored in A(1:M, N-K-L+1:N) and R33 is stored

( 0 R22 R23 )

in `B(M-K+1:L,N+M-K-L+1:N)` on exit.

The computation of the unitary transformation matrices U, V or Q is optional. These matrices may either be formed explicitly, or they may be postmultiplied into input matrices U1, V1, or Q1.

### Further Details

ZTGSJA essentially uses a variant of Kogbetliantz algorithm to reduce min(L,M-K)-by-L triangular (or trapezoidal) matrix A23 and L-by-L matrix B13 to the form:

$$
U_{1}^H \, A_{13} \, Q_{1} = C_{1} \, R_{1}; V_{1}^H \, B_{13} \, Q_{1} = S_{1} \, R_{1}
$$

where U1, V1 and Q1 are unitary matrix. C1 and S1 are diagonal matrices satisfying

$$
C_{1}^2 + S_{1}^2 = I
$$

and R1 is an L-by-L nonsingular upper triangular matrix.

</section>

<!-- fortran-docs:end -->

<!-- Section for related `stdlib` packages. Do not manually edit this section, as it is automatically populated. -->

<section class="related">

</section>

<!-- /.related -->

<!-- Section for all links. Make sure to keep an empty line after the `section` element and another before the `/section` close. -->

<section class="links">

[lapack]: https://www.netlib.org/lapack/explore-html/

[lapack-ztgsja]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__ztgsja.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->