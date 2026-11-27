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

# zlamtsqr

> Apply a complex unitary matrix `Q` (or its conjugate-transpose `Q^H`) from a Tall-Skinny QR factorization (`zlatsqr`) to a complex `M`-by-`N` matrix `C`.

<section class="usage">

## Usage

```javascript
var zlamtsqr = require( '@stdlib/lapack/base/zlamtsqr' );
```

#### zlamtsqr( order, side, trans, M, N, K, mb, nb, A, LDA, T, LDT, C, LDC, WORK, strideWORK, lwork )

Overwrites a complex `M`-by-`N` matrix `C` with `op(Q)*C` or `C*op(Q)`, where `Q` is the complex unitary matrix from a Tall-Skinny QR factorization (`zlatsqr`).

```javascript
var Complex128Array = require( '@stdlib/array/complex128' );

// After computing A, T from zlatsqr, apply Q^H * C in place:
var M = 4;
var N = 2;
var K = 2;
var MB = 8;
var NB = 1;
var A = new Complex128Array( M * K );
var T = new Complex128Array( NB * K );
var C = new Complex128Array( M * N );
var WORK = new Complex128Array( N * NB );
var info = zlamtsqr( 'column-major', 'left', 'conjugate-transpose', M, N, K, MB, NB, A, M, T, NB, C, M, WORK, 1, WORK.length );
// returns 0
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **side**: `'left'` to apply `Q` from the left, `'right'` from the right.
-   **trans**: `'no-transpose'` for `Q`, `'conjugate-transpose'` for `Q^H` (plain `'transpose'` is rejected because `Q` is unitary).
-   **M**: number of rows of `C`.
-   **N**: number of columns of `C`.
-   **K**: number of elementary reflectors. Must satisfy `K <= M` (left) or `K <= N` (right).
-   **mb**: row block size used by `zlatsqr` (must equal the value used to factor).
-   **nb**: inner block size used by the compact-WY representation.
-   **A**: reflector vectors from `zlatsqr` (`Complex128Array`).
-   **LDA**: leading dimension of `A`.
-   **T**: block triangular factors from `zlatsqr` (`Complex128Array`).
-   **LDT**: leading dimension of `T`.
-   **C**: input/output matrix (`Complex128Array`).
-   **LDC**: leading dimension of `C`.
-   **WORK**: workspace (`Complex128Array`).
-   **strideWORK**: element stride for `WORK` (in complex elements).
-   **lwork**: declared length of `WORK`.

#### zlamtsqr.ndarray( side, trans, M, N, K, mb, nb, A, strideA1, strideA2, offsetA, T, strideT1, strideT2, offsetT, C, strideC1, strideC2, offsetC, WORK, strideWORK, offsetWORK, lwork )

Same operation, exposing strides and offsets for each array.

```javascript
var Complex128Array = require( '@stdlib/array/complex128' );

var M = 4;
var N = 2;
var K = 2;
var MB = 8;
var NB = 1;
var A = new Complex128Array( M * K );
var T = new Complex128Array( NB * K );
var C = new Complex128Array( M * N );
var WORK = new Complex128Array( N * NB );
var info = zlamtsqr.ndarray( 'left', 'conjugate-transpose', M, N, K, MB, NB, A, 1, M, 0, T, 1, NB, 0, C, 1, M, 0, WORK, 1, 0, WORK.length );
// returns 0
```

The function has the following additional parameters:

-   **strideA1**: stride of the first dimension of `A` (in complex elements).
-   **strideA2**: stride of the second dimension of `A` (in complex elements).
-   **offsetA**: starting index for `A` (in complex elements).
-   **strideT1**: stride of the first dimension of `T` (in complex elements).
-   **strideT2**: stride of the second dimension of `T` (in complex elements).
-   **offsetT**: starting index for `T` (in complex elements).
-   **strideC1**: stride of the first dimension of `C` (in complex elements).
-   **strideC2**: stride of the second dimension of `C` (in complex elements).
-   **offsetC**: starting index for `C` (in complex elements).
-   **offsetWORK**: starting index for `WORK` (in complex elements).

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   The four `(side, trans)` combinations:

    ```text
                                          SIDE = 'left'   SIDE = 'right'
    TRANS = 'no-transpose':                    Q*C            C*Q
    TRANS = 'conjugate-transpose':           Q^H*C          C*Q^H
    ```

-   When `mb <= K` or `mb >= max(M, N, K)` the routine defers to `zgemqrt` on the whole panel (no pentagonal blocks).

-   When `WORK` is undersized (or empty) the underlying `zgemqrt`/`ztpmqrt` allocate an internal buffer; correctness is preserved, only performance is affected.

</section>

<!-- /.notes -->

<section class="examples">

## Examples

```javascript
var Complex128Array = require( '@stdlib/array/complex128' );
var zlamtsqr = require( '@stdlib/lapack/base/zlamtsqr' );

var M = 4;
var N = 3;
var K = 2;
var MB = 8;
var NB = 1;
var A = new Complex128Array( M * K );
var T = new Complex128Array( NB * K );
var C = new Complex128Array( M * N );
var WORK = new Complex128Array( N * NB );

var info = zlamtsqr( 'column-major', 'left', 'no-transpose', M, N, K, MB, NB, A, M, T, NB, C, M, WORK, 1, WORK.length );
console.log( info );
```

</section>

<!-- /.examples -->

<!-- fortran-docs:start (generated by bin/fortran-docs.mjs from data/lapack-3.12.0/SRC/zlamtsqr.f; do not edit) -->

<section class="fortran-docs">

## Reference notes

The mathematical description from the reference LAPACK 3.12.0 source of `ZLAMTSQR`. Indices are the 1-based Fortran indices of the source.

### Purpose

ZLAMTSQR overwrites the general complex M-by-N matrix C with

```text
                SIDE = 'L'     SIDE = 'R'
TRANS = 'N':      Q * C          C * Q
TRANS = 'C':      Q**H * C       C * Q**H
     where Q is a complex unitary matrix defined as the product
     of blocked elementary reflectors computed by tall skinny
     QR factorization (ZLATSQR)
```

### Further Details

Tall-Skinny QR (TSQR) performs QR by a sequence of unitary transformations, representing Q as a product of other unitary matrices

$$
Q = Q(1) \, Q(2) \, \cdots \, Q(k)
$$

where each Q(i) zeros out subdiagonal entries of a block of `MB` rows of A:

-   Q(1) zeros out the subdiagonal entries of rows 1:`MB` of A
-   Q(2) zeros out the bottom `MB`-N rows of rows \[1:N,`MB`+1:$2 \, \mathrm{MB}-N$\] of A
-   Q(3) zeros out the bottom `MB`-N rows of rows \[1:N,$2 \, \mathrm{MB}-N+1$:$3 \, \mathrm{MB}-2 \, N$\] of A
-   . . .

Q(1) is computed by GEQRT, which represents Q(1) by Householder vectors stored under the diagonal of rows 1:`MB` of A, and by upper triangular block reflectors, stored in array `T(1:LDT,1:N)`. For more information see Further Details in GEQRT.

Q(i) for $i>1$ is computed by TPQRT, which represents Q(i) by Householder vectors stored in rows \[$(i-1) \, (\mathrm{MB}-N)+N+1$:$i \, (\mathrm{MB}-N)+N$\] of A, and by upper triangular block reflectors, stored in array `T(1:LDT,(i-1)*N+1:i*N)`. The last Q(k) may use fewer rows. For more information see Further Details in TPQRT.

For more details of the overall algorithm, see the description of Sequential TSQR in Section 2.2 of \[1\].

\[1\] “Communication-Optimal Parallel and Sequential QR and LU Factorizations,”

-   J. Demmel, L. Grigori, M. Hoemmen, J. Langou,
-   SIAM J. Sci. Comput, vol. 34, no. 1, 2012

</section>

<!-- fortran-docs:end -->

<!-- Section for related `stdlib` packages. Do not manually edit this section, as it is automatically populated. -->

<section class="related">

</section>

<!-- /.related -->

<!-- Section for all links. Make sure to keep an empty line after the `section` element and another before the `/section` close. -->

<section class="links">

</section>

<!-- /.links -->
