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

# dtprfb

> Applies a real triangular-pentagonal block reflector to a matrix

<section class="usage">

## Usage

```javascript
var dtprfb = require( '@stdlib/lapack/base/dtprfb' );
```

#### dtprfb( order, side, trans, direct, storev, M, N, K, l, V, LDV, T, LDT, A, LDA, B, LDB, WORK, LDWORK )

Applies a real triangular-pentagonal block reflector to a matrix

```javascript
var Float64Array = require( '@stdlib/array/float64' );

var V = new Float64Array( [ 1.0, 0.0, 0.0, 0.2, 0.3, 1.0, 0.0, 1.0 ] );
var T = new Float64Array( [ 1.2, 0.0, -0.3, 0.8 ] );
var A = new Float64Array( [ 1.0, 4.0, 2.0, 5.0, 3.0, 6.0 ] );
var B = new Float64Array( [ 7.0, 10.0, 13.0, 16.0, 8.0, 11.0, 14.0, 17.0, 9.0, 12.0, 15.0, 18.0 ] );
var WORK = new Float64Array( 6 );

dtprfb( 'column-major', 'left', 'no-transpose', 'forward', 'columnwise', 4, 3, 2, 1, V, 4, T, 2, A, 2, B, 4, WORK, 2 );
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **side**: specifies the operation type.
-   **trans**: specifies the operation type.
-   **direct**: specifies the operation type.
-   **storev**: specifies the operation type.
-   **M**: number of rows.
-   **N**: number of columns.
-   **K**: number of superdiagonals.
-   **l**: l.
-   **V**: input matrix.
-   **LDV**: leading dimension of `V`.
-   **T**: input matrix.
-   **LDT**: leading dimension of `T`.
-   **A**: input matrix.
-   **LDA**: leading dimension of `A`.
-   **B**: input matrix.
-   **LDB**: leading dimension of `B`.
-   **WORK**: output matrix.
-   **LDWORK**: leading dimension of `WORK`.

#### dtprfb.ndarray( side, trans, direct, storev, M, N, K, l, V, strideV1, strideV2, offsetV, T, strideT1, strideT2, offsetT, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, WORK, strideWORK1, strideWORK2, offsetWORK )

Applies a real triangular-pentagonal block reflector to a matrix, using alternative indexing semantics.

```javascript
var Float64Array = require( '@stdlib/array/float64' );

var V = new Float64Array( [ 1.0, 0.0, 0.0, 0.2, 0.3, 1.0, 0.0, 1.0 ] );
var T = new Float64Array( [ 1.2, 0.0, -0.3, 0.8 ] );
var A = new Float64Array( [ 1.0, 4.0, 2.0, 5.0, 3.0, 6.0 ] );
var B = new Float64Array( [ 7.0, 10.0, 13.0, 16.0, 8.0, 11.0, 14.0, 17.0, 9.0, 12.0, 15.0, 18.0 ] );
var WORK = new Float64Array( 6 );

dtprfb.ndarray( 'left', 'no-transpose', 'forward', 'columnwise', 4, 3, 2, 1, V, 1, 4, 0, T, 1, 2, 0, A, 1, 2, 0, B, 1, 4, 0, WORK, 1, 2, 0 );
```

The function has the following additional parameters:

-   **side**: specifies the operation type.
-   **trans**: specifies the operation type.
-   **direct**: specifies the operation type.
-   **storev**: specifies the operation type.
-   **M**: number of rows.
-   **N**: number of columns.
-   **K**: number of superdiagonals.
-   **l**: l.
-   **V**: input matrix.
-   **strideV1**: stride of dimension 1 of `V`.
-   **strideV2**: stride of dimension 2 of `V`.
-   **offsetV**: starting index for `V`.
-   **T**: input matrix.
-   **strideT1**: stride of dimension 1 of `T`.
-   **strideT2**: stride of dimension 2 of `T`.
-   **offsetT**: starting index for `T`.
-   **A**: input matrix.
-   **strideA1**: stride of dimension 1 of `A`.
-   **strideA2**: stride of dimension 2 of `A`.
-   **offsetA**: starting index for `A`.
-   **B**: input matrix.
-   **strideB1**: stride of dimension 1 of `B`.
-   **strideB2**: stride of dimension 2 of `B`.
-   **offsetB**: starting index for `B`.
-   **WORK**: output matrix.
-   **strideWORK1**: stride of dimension 1 of `WORK`.
-   **strideWORK2**: stride of dimension 2 of `WORK`.
-   **offsetWORK**: starting index for `WORK`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   The routine implements all eight combinations of `side`, `direct`, and `storev`.
-   When `l === 0`, `V` has no trapezoidal block and `dtprfb` behaves like `dlarfb`.

</section>

<!-- /.notes -->

<section class="examples">

## Examples

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var dtprfb = require( '@stdlib/lapack/base/dtprfb' );

var V = new Float64Array( [ 1.0, 0.0, 0.0, 0.2, 0.3, 1.0, 0.0, 1.0 ] );
var T = new Float64Array( [ 1.2, 0.0, -0.3, 0.8 ] );
var A = new Float64Array( [ 1.0, 4.0, 2.0, 5.0, 3.0, 6.0 ] );
var B = new Float64Array( [ 7.0, 10.0, 13.0, 16.0, 8.0, 11.0, 14.0, 17.0, 9.0, 12.0, 15.0, 18.0 ] );
var WORK = new Float64Array( 6 );

dtprfb( 'column-major', 'left', 'no-transpose', 'forward', 'columnwise', 4, 3, 2, 1, V, 4, T, 2, A, 2, B, 4, WORK, 2 );
console.log( A );
console.log( B );
```

</section>

<!-- /.examples -->

<!-- fortran-docs:start (generated by bin/fortran-docs.mjs from data/lapack-3.12.0/SRC/dtprfb.f; do not edit) -->

<section class="fortran-docs">

## Reference documentation

From the reference LAPACK 3.12.0 source of `DTPRFB`, converted to Markdown with KaTeX math. Indices are the 1-based Fortran indices of the source.

> Applies a real "triangular-pentagonal" block reflector to a real matrix, which is composed of two blocks.

### Purpose

DTPRFB applies a real "triangular-pentagonal" block reflector H or its transpose $H^T$ to a real matrix C, which is composed of two blocks A and B, either from the left or right.

### Arguments

#### SIDE `[in]`

_CHARACTER\*1_

-   `= 'L'`: apply H or $H^T$ from the Left
-   `= 'R'`: apply H or $H^T$ from the Right

#### TRANS `[in]`

_CHARACTER\*1_

-   `= 'N'`: apply H (No transpose)
-   `= 'T'`: apply $H^T$ (Transpose)

#### DIRECT `[in]`

_CHARACTER\*1_

Indicates how H is formed from a product of elementary reflectors

-   `= 'F'`: $H = H(1)$ H(2) . . . H(k) (Forward)
-   `= 'B'`: $H = H(k)$ . . . H(2) H(1) (Backward)

#### STOREV `[in]`

_CHARACTER\*1_

Indicates how the vectors which define the elementary reflectors are stored:

-   `= 'C'`: Columns
-   `= 'R'`: Rows

#### M `[in]`

_INTEGER_

The number of rows of the matrix B. $M \ge 0$.

#### N `[in]`

_INTEGER_

The number of columns of the matrix B. $N \ge 0$.

#### K `[in]`

_INTEGER_

The order of the matrix T, i.e. the number of elementary reflectors whose product defines the block reflector. $K \ge 0$.

#### L `[in]`

_INTEGER_

The order of the trapezoidal part of V. $K \ge L \ge 0$. See Further Details.

#### V `[in]`

_DOUBLE PRECISION array, dimension (LDV,K) if STOREV = 'C'_

(`LDV`,M) if `STOREV = 'R'` and `SIDE = 'L'` (`LDV`,N) if `STOREV = 'R'` and `SIDE = 'R'` The pentagonal matrix V, which contains the elementary reflectors H(1), H(2), ..., H(K). See Further Details.

#### LDV `[in]`

_INTEGER_

The leading dimension of the array V. If `STOREV = 'C'` and `SIDE = 'L'`, $\mathrm{LDV} \ge \max (1,M)$; if `STOREV = 'C'` and `SIDE = 'R'`, $\mathrm{LDV} \ge \max (1,N)$; if `STOREV = 'R'`, $\mathrm{LDV} \ge K$.

#### T `[in]`

_DOUBLE PRECISION array, dimension (LDT,K)_

The triangular K-by-K matrix T in the representation of the block reflector.

#### LDT `[in]`

_INTEGER_

The leading dimension of the array T. $\mathrm{LDT} \ge K$.

#### A `[in,out]`

_DOUBLE PRECISION array, dimension (LDA,N) if SIDE = 'L' or (LDA,K) if SIDE = 'R'_

On entry, the K-by-N or M-by-K matrix A. On exit, A is overwritten by the corresponding block of $H \, C$ or $H^T \, C$ or $C \, H$ or $C \, H^T$. See Further Details.

#### LDA `[in]`

_INTEGER_

The leading dimension of the array A. If `SIDE = 'L'`, $\mathrm{LDA} \ge \max (1,K)$; If `SIDE = 'R'`, $\mathrm{LDA} \ge \max (1,M)$.

#### B `[in,out]`

_DOUBLE PRECISION array, dimension (LDB,N)_

On entry, the M-by-N matrix B. On exit, B is overwritten by the corresponding block of $H \, C$ or $H^T \, C$ or $C \, H$ or $C \, H^T$. See Further Details.

#### LDB `[in]`

_INTEGER_

The leading dimension of the array B. $\mathrm{LDB} \ge \max (1,M)$.

#### WORK `[out]`

_DOUBLE PRECISION array, dimension (LDWORK,N) if SIDE = 'L'_

(`LDWORK`,K) if `SIDE = 'R'`.

#### LDWORK `[in]`

_INTEGER_

The leading dimension of the array `WORK`. If `SIDE = 'L'`, $\mathrm{LDWORK} \ge K$; if `SIDE = 'R'`, $\mathrm{LDWORK} \ge M$.

### Further Details

The matrix C is a composite matrix formed from blocks A and B. The block B is of size M-by-N; if `SIDE = 'R'`, A is of size M-by-K, and if `SIDE = 'L'`, A is of size K-by-N.

If `SIDE = 'R'` and `DIRECT = 'F'`, C = \[A B\].

If `SIDE = 'L'` and `DIRECT = 'F'`, C = \[A\]

\[B\].

If `SIDE = 'R'` and `DIRECT = 'B'`, C = \[B A\].

If `SIDE = 'L'` and `DIRECT = 'B'`, C = \[B\]

\[A\].

The pentagonal matrix V is composed of a rectangular block V1 and a trapezoidal block V2. The size of the trapezoidal block is determined by the parameter L, where $0 \le L \le K$. If $L=K$, the V2 block of V is triangular; if $L=0$, there is no trapezoidal block, thus $V = V_{1}$ is rectangular.

If `DIRECT = 'F'` and `STOREV = 'C'`: V = \[V1\]

\[V2\] - V2 is upper trapezoidal (first L rows of K-by-K upper triangular)

If `DIRECT = 'F'` and `STOREV = 'R'`: V = \[V1 V2\]

- V2 is lower trapezoidal (first L columns of K-by-K lower triangular)

If `DIRECT = 'B'` and `STOREV = 'C'`: V = \[V2\]

\[V1\] - V2 is lower trapezoidal (last L rows of K-by-K lower triangular)

If `DIRECT = 'B'` and `STOREV = 'R'`: V = \[V2 V1\]

- V2 is upper trapezoidal (last L columns of K-by-K upper triangular)

If `STOREV = 'C'` and `SIDE = 'L'`, V is M-by-K with V2 L-by-K.

If `STOREV = 'C'` and `SIDE = 'R'`, V is N-by-K with V2 L-by-K.

If `STOREV = 'R'` and `SIDE = 'L'`, V is K-by-M with V2 K-by-L.

If `STOREV = 'R'` and `SIDE = 'R'`, V is K-by-N with V2 K-by-L.

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
