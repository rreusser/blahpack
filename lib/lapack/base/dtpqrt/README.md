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

# dtpqrt

> Compute a blocked QR factorization of a real triangular-pentagonal matrix using the compact WY representation for `Q`.

<section class="usage">

## Usage

```javascript
var dtpqrt = require( '@stdlib/lapack/base/dtpqrt' );
```

#### dtpqrt( order, M, N, l, nb, A, LDA, B, LDB, T, LDT, WORK )

Computes a blocked QR factorization of a real triangular-pentagonal matrix `C = [ A; B ]` using the compact WY representation for `Q`.

```javascript
var Float64Array = require( '@stdlib/array/float64' );

var A = new Float64Array( [ 2.0, 0.0, 0.5, 3.0 ] );
var B = new Float64Array( [ 1.0, 0.3, 0.5, 1.1 ] );
var T = new Float64Array( 4 );
var WORK = new Float64Array( 4 );
var info = dtpqrt( 'column-major', 2, 2, 0, 2, A, 2, B, 2, T, 2, WORK );
// info => 0
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **M**: number of rows of `B`.
-   **N**: number of columns of `B` and order of `A`.
-   **l**: number of rows of the upper trapezoidal part of `B` (`0 <= l <= min(M,N)`).
-   **nb**: block size (`1 <= nb`; if `N > 0`, also `nb <= N`).
-   **A**: input/output matrix; on exit contains the upper triangular factor `R`.
-   **LDA**: leading dimension of `A`.
-   **B**: input/output pentagonal matrix; on exit contains the Householder reflectors `V`.
-   **LDB**: leading dimension of `B`.
-   **T**: output matrix of upper triangular block reflector factors.
-   **LDT**: leading dimension of `T` (`LDT >= nb` for column-major).
-   **WORK**: workspace array of length at least `nb*N`.

#### dtpqrt.ndarray( M, N, l, nb, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, T, strideT1, strideT2, offsetT, WORK, strideWORK, offsetWORK )

Computes a blocked QR factorization of a real triangular-pentagonal matrix `C = [ A; B ]` using the compact WY representation for `Q`, using alternative indexing semantics.

```javascript
var Float64Array = require( '@stdlib/array/float64' );

var A = new Float64Array( [ 2.0, 0.0, 0.5, 3.0 ] );
var B = new Float64Array( [ 1.0, 0.3, 0.5, 1.1 ] );
var T = new Float64Array( 4 );
var WORK = new Float64Array( 4 );
var info = dtpqrt.ndarray( 2, 2, 0, 2, A, 1, 2, 0, B, 1, 2, 0, T, 1, 2, 0, WORK, 1, 0 );
// info => 0
```

The function has the following additional parameters:

-   **M**: number of rows of `B`.
-   **N**: number of columns of `B` and order of `A`.
-   **l**: number of rows of the upper trapezoidal part of `B`.
-   **nb**: block size.
-   **A**: input/output matrix.
-   **strideA1**: stride of dimension 1 of `A`.
-   **strideA2**: stride of dimension 2 of `A`.
-   **offsetA**: starting index for `A`.
-   **B**: input/output pentagonal matrix.
-   **strideB1**: stride of dimension 1 of `B`.
-   **strideB2**: stride of dimension 2 of `B`.
-   **offsetB**: starting index for `B`.
-   **T**: output matrix of block reflector factors.
-   **strideT1**: stride of dimension 1 of `T`.
-   **strideT2**: stride of dimension 2 of `T`.
-   **offsetT**: starting index for `T`.
-   **WORK**: workspace array.
-   **strideWORK**: stride length for `WORK`.
-   **offsetWORK**: starting index for `WORK`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `A` is an `N`-by-`N` upper triangular matrix; on exit it contains the upper triangular factor `R` of the QR factorization of `[ A; B ]`.
-   `B` is an `M`-by-`N` pentagonal matrix whose first `M - l` rows are rectangular and whose last `l` rows form an upper trapezoidal block; on exit it contains the Householder reflector representation `V`.
-   `T` stores the `ib`-by-`ib` upper triangular block reflector factors `T1, T2, ..., TB` for each panel, packed side-by-side as an `nb`-by-`N` matrix `T = [T1 T2 ... TB]`.
-   `nb` partitions the columns of `A` into panels of width `nb` (the last panel may be smaller). Each panel is factored by the unblocked kernel `dtpqrt2`, then the resulting block reflector is applied to the trailing columns via `dtprfb`.
-   `WORK` must be sized for at least `nb*N` doubles.

</section>

<!-- /.notes -->

<section class="examples">

## Examples

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var dtpqrt = require( '@stdlib/lapack/base/dtpqrt' );

var A = new Float64Array( [ 2.0, 0.0, 0.0, 0.0, 0.5, 3.0, 0.0, 0.0, 0.25, 0.75, 4.0, 0.0, 0.1, 0.2, 0.3, 5.0 ] );
var B = new Float64Array( [ 1.0, 0.3, 0.7, 0.0, 0.5, 1.1, 0.4, 1.3, 0.25, 0.6, 1.2, 0.5, 0.1, 0.2, 0.9, 0.6 ] );
var T = new Float64Array( 8 );
var WORK = new Float64Array( 8 );
var info = dtpqrt( 'column-major', 4, 4, 2, 2, A, 4, B, 4, T, 2, WORK );
console.log( 'info: ' + info );
console.log( T );
```

</section>

<!-- /.examples -->

<!-- fortran-docs:start (generated by bin/fortran-docs.mjs from data/lapack-3.12.0/SRC/dtpqrt.f; do not edit) -->

<section class="fortran-docs">

## Reference notes

The mathematical description from the reference LAPACK 3.12.0 source of `DTPQRT`. Indices are the 1-based Fortran indices of the source.

### Purpose

DTPQRT computes a blocked QR factorization of a real "triangular-pentagonal" matrix C, which is composed of a triangular block A and pentagonal block B, using the compact WY representation for Q.

### Further Details

The input matrix C is a (N+M)-by-N matrix

$$
C = \begin{bmatrix} A \\ B \end{bmatrix}
$$

where A is an upper triangular N-by-N matrix, and B is M-by-N pentagonal matrix consisting of a (M-L)-by-N rectangular matrix B1 on top of a L-by-N upper trapezoidal matrix B2:

B = \[ B1 \] \<- (M-L)-by-N rectangular

\[ B2 \] \<- L-by-N upper trapezoidal.

The upper trapezoidal matrix B2 consists of the first L rows of a N-by-N upper triangular matrix, where $0 \le L \le \min (M,N)$. If $L=0$, B is rectangular M-by-N; if $M=L=N$, B is upper triangular.

The matrix W stores the elementary reflectors H(i) in the i-th column below the diagonal (of A) in the (N+M)-by-N input matrix C

C = \[ A \] \<- upper triangular N-by-N

\[ B \] \<- M-by-N pentagonal

so that W can be represented as

W = \[ I \] \<- identity, N-by-N

\[ V \] \<- M-by-N, same form as B.

Thus, all of information needed for W is contained on exit in B, which we call V above. Note that V has the same form as B; that is,

V = \[ V1 \] \<- (M-L)-by-N rectangular

\[ V2 \] \<- L-by-N upper trapezoidal.

The columns of V represent the vectors which define the H(i)'s.

The number of blocks is B = ceiling(N/`NB`), where each block is of order `NB` except for the last block, which is of order $\mathrm{IB} = N - (B-1) \, \mathrm{NB}$. For each of the B blocks, a upper triangular block reflector factor is computed: T1, T2, ..., TB. The `NB`-by-`NB` (and IB-by-IB for the last block) T's are stored in the `NB`-by-N matrix T as

$$
T = [T_{1} T_{2} \cdots \mathrm{TB}]
$$

</section>

<!-- fortran-docs:end -->

<!-- Section for related `stdlib` packages. Do not manually edit this section, as it is automatically populated. -->

<section class="related">

</section>

<!-- /.related -->

<!-- Section for all links. Make sure to keep an empty line after the `section` element and another before the `/section` close. -->

<section class="links">

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

</section>

<!-- /.links -->
