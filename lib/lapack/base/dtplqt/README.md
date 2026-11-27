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

# dtplqt

> Compute a blocked LQ factorization of a real triangular-pentagonal matrix using the compact WY representation for `Q`.

<section class="usage">

## Usage

```javascript
var dtplqt = require( '@stdlib/lapack/base/dtplqt' );
```

#### dtplqt( order, M, N, l, mb, A, LDA, B, LDB, T, LDT, WORK )

Computes a blocked LQ factorization of a real triangular-pentagonal matrix `C = [A, B]` using the compact WY representation for `Q`.

```javascript
var Float64Array = require( '@stdlib/array/float64' );

var A = new Float64Array( [ 2.0, 0.5, 0.0, 3.0 ] );
var B = new Float64Array( [ 1.0, 0.3, 0.5, 1.1 ] );
var T = new Float64Array( 4 );
var WORK = new Float64Array( 4 );
var info = dtplqt( 'column-major', 2, 2, 0, 2, A, 2, B, 2, T, 2, WORK );
// info => 0
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **M**: number of rows of `B` and order of `A`.
-   **N**: number of columns of `B`.
-   **l**: number of rows of the lower trapezoidal part of `B` (`0 <= l <= min(M,N)`).
-   **mb**: block size (`1 <= mb`; if `M > 0`, also `mb <= M`).
-   **A**: input/output matrix; on exit contains the lower triangular factor `L`.
-   **LDA**: leading dimension of `A`.
-   **B**: input/output pentagonal matrix; on exit contains the Householder reflectors `V`.
-   **LDB**: leading dimension of `B`.
-   **T**: output matrix of upper triangular block reflector factors.
-   **LDT**: leading dimension of `T` (`LDT >= mb`).
-   **WORK**: workspace array of length at least `mb*M`.

#### dtplqt.ndarray( M, N, l, mb, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, T, strideT1, strideT2, offsetT, WORK, strideWORK, offsetWORK )

Computes a blocked LQ factorization of a real triangular-pentagonal matrix `C = [A, B]` using the compact WY representation for `Q`, using alternative indexing semantics.

```javascript
var Float64Array = require( '@stdlib/array/float64' );

var A = new Float64Array( [ 2.0, 0.5, 0.0, 3.0 ] );
var B = new Float64Array( [ 1.0, 0.3, 0.5, 1.1 ] );
var T = new Float64Array( 4 );
var WORK = new Float64Array( 4 );
var info = dtplqt.ndarray( 2, 2, 0, 2, A, 1, 2, 0, B, 1, 2, 0, T, 1, 2, 0, WORK, 1, 0 );
// info => 0
```

The function has the following additional parameters:

-   **M**: number of rows of `B` and order of `A`.
-   **N**: number of columns of `B`.
-   **l**: number of rows of the lower trapezoidal part of `B`.
-   **mb**: block size.
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

-   `A` is an `M`-by-`M` lower triangular matrix; on exit it contains the lower triangular factor `L` of the LQ factorization of `[A, B]`.
-   `B` is an `M`-by-`N` pentagonal matrix whose first `N - l` columns are rectangular and whose last `l` columns form a lower trapezoidal block; on exit it contains the Householder reflector representation `V`.
-   `T` stores the `mb`-by-`mb` upper triangular block reflector factors `T1, T2, ..., TB` for each panel, packed side-by-side as an `mb`-by-`M` matrix `T = [T1 T2 ... TB]`.
-   `mb` partitions the rows of `A` into panels of size `mb` (the last panel may be smaller). Each panel is factored by the unblocked kernel `dtplqt2`, then the resulting block reflector is applied to the trailing rows via `dtprfb`.
-   `WORK` must be sized for at least `mb*M` doubles.

</section>

<!-- /.notes -->

<section class="examples">

## Examples

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var dtplqt = require( '@stdlib/lapack/base/dtplqt' );

var A = new Float64Array( [ 2.0, 0.5, 0.25, 0.1, 0.0, 3.0, 0.75, 0.2, 0.0, 0.0, 4.0, 0.3, 0.0, 0.0, 0.0, 5.0 ] );
var B = new Float64Array( [ 1.0, 0.3, 0.7, 0.2, 0.5, 1.1, 0.4, 0.3, 0.25, 0.6, 1.2, 0.4, 0.0, 0.2, 0.9, 1.3, 0.0, 0.0, 0.0, 0.6 ] );
var T = new Float64Array( 8 );
var WORK = new Float64Array( 8 );
var info = dtplqt( 'column-major', 4, 5, 2, 2, A, 4, B, 4, T, 2, WORK );
console.log( 'info: ' + info );
console.log( T );
```

</section>

<!-- /.examples -->

<!-- fortran-docs:start (generated by bin/fortran-docs.mjs from data/lapack-3.12.0/SRC/dtplqt.f; do not edit) -->

<section class="fortran-docs">

## Reference notes

The mathematical description from the reference LAPACK 3.12.0 source of `DTPLQT`. Indices are the 1-based Fortran indices of the source.

### Purpose

DTPLQT computes a blocked LQ factorization of a real "triangular-pentagonal" matrix C, which is composed of a triangular block A and pentagonal block B, using the compact WY representation for Q.

### Further Details

The input matrix C is a M-by-(M+N) matrix

$$
C = [ A ] [ B ]
$$

where A is an lower triangular M-by-M matrix, and B is M-by-N pentagonal matrix consisting of a M-by-(N-L) rectangular matrix B1 on left of a M-by-L upper trapezoidal matrix B2:

```text
[ B ] = [ B1 ] [ B2 ]
         [ B1 ]  <- M-by-(N-L) rectangular
         [ B2 ]  <-     M-by-L lower trapezoidal.
```

The lower trapezoidal matrix B2 consists of the first L columns of a M-by-M lower triangular matrix, where $0 \le L \le \min (M,N)$. If $L=0$, B is rectangular M-by-N; if $M=L=N$, B is lower triangular.

The matrix W stores the elementary reflectors H(i) in the i-th row above the diagonal (of A) in the M-by-(M+N) input matrix C

\[ C \] = \[ A \] \[ B \] \[ A \] \<- lower triangular M-by-M \[ B \] \<- M-by-N pentagonal

so that W can be represented as

\[ W \] = \[ I \] \[ V \] \[ I \] \<- identity, M-by-M \[ V \] \<- M-by-N, same form as B.

Thus, all of information needed for W is contained on exit in B, which we call V above. Note that V has the same form as B; that is,

```text
[ V ] = [ V1 ] [ V2 ]
       [ V1 ] <- M-by-(N-L) rectangular
       [ V2 ] <-     M-by-L lower trapezoidal.
```

The rows of V represent the vectors which define the H(i)'s.

The number of blocks is B = ceiling(M/`MB`), where each block is of order `MB` except for the last block, which is of order $\mathrm{IB} = M - (M-1) \, \mathrm{MB}$. For each of the B blocks, a upper triangular block reflector factor is computed: T1, T2, ..., TB. The `MB`-by-`MB` (and IB-by-IB for the last block) T's are stored in the `MB`-by-N matrix T as

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
