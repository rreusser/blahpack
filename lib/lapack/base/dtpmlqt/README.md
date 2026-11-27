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

# dtpmlqt

> Applies a real orthogonal matrix `Q` (or its transpose) obtained from a triangular-pentagonal compact-WY block reflector — the output of `dtplqt` — to a stacked matrix `C` formed by two blocks `A` and `B`.

<section class="usage">

## Usage

```javascript
var dtpmlqt = require( '@stdlib/lapack/base/dtpmlqt' );
```

#### dtpmlqt( order, side, trans, M, N, K, l, mb, V, LDV, T, LDT, A, LDA, B, LDB, WORK, strideWORK )

Applies `Q`, `Q^T`, `Q*C`, or `C*Q^T` (according to `side` and `trans`) in place on the stacked matrix `[A; B]` (left) or `[A B]` (right), where `Q` is the orthogonal factor produced by `dtplqt`.

```javascript
var Float64Array = require( '@stdlib/array/float64' );

var V = new Float64Array( 12 );
var T = new Float64Array( 6 );
var A = new Float64Array( 9 );
var B = new Float64Array( 12 );
var WORK = new Float64Array( 6 );

dtpmlqt( 'column-major', 'left', 'no-transpose', 4, 3, 3, 2, 2, V, 3, T, 2, A, 3, B, 4, WORK, 1 );
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **side**: `'left'` to apply `Q` from the left, `'right'` from the right.
-   **trans**: `'no-transpose'` to apply `Q`, `'transpose'` to apply `Q^T`.
-   **M**: number of rows of `B`.
-   **N**: number of columns of `B`.
-   **K**: number of elementary reflectors.
-   **l**: order of the trapezoidal block of `V` (`0 <= L <= K`). `L = 0` reduces `V` to a rectangular block; `L = K` reduces `V` to a triangular block.
-   **mb**: block size used to construct `T` (must equal the value used in `dtplqt`).
-   **V**: pentagonal reflector matrix produced by `dtplqt`. Shape is `K`-by-`M` when `side='left'` or `K`-by-`N` when `side='right'`. Each row contains an elementary reflector.
-   **LDV**: leading dimension of `V` (`>= K` for column-major).
-   **T**: block triangular factor produced by `dtplqt`, stored as an `mb`-by-`K` matrix.
-   **LDT**: leading dimension of `T` (must be `>= mb`).
-   **A**: upper (left) or left (right) block of `C`, modified in-place.
-   **LDA**: leading dimension of `A`.
-   **B**: lower (left) or right (right) block of `C`, modified in-place.
-   **LDB**: leading dimension of `B` (`>= max(1,M)`).
-   **WORK**: workspace buffer (at least `N*mb` doubles for `side='left'` or `M*mb` for `side='right'`).
-   **strideWORK**: element stride for `WORK`.

#### dtpmlqt.ndarray( side, trans, M, N, K, l, mb, V, strideV1, strideV2, offsetV, T, strideT1, strideT2, offsetT, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, WORK, strideWORK, offsetWORK )

Same operation as `dtpmlqt`, using alternative indexing semantics with explicit strides and offsets.

```javascript
var Float64Array = require( '@stdlib/array/float64' );

var V = new Float64Array( 12 );
var T = new Float64Array( 6 );
var A = new Float64Array( 9 );
var B = new Float64Array( 12 );
var WORK = new Float64Array( 6 );

dtpmlqt.ndarray( 'left', 'no-transpose', 4, 3, 3, 2, 2, V, 1, 3, 0, T, 1, 2, 0, A, 1, 3, 0, B, 1, 4, 0, WORK, 1, 0 );
```

The function has the following additional parameters:

-   **strideV1**: stride of dimension 1 of `V`.
-   **strideV2**: stride of dimension 2 of `V`.
-   **offsetV**: starting index for `V`.
-   **strideT1**: stride of dimension 1 of `T`.
-   **strideT2**: stride of dimension 2 of `T`.
-   **offsetT**: starting index for `T`.
-   **strideA1**: stride of dimension 1 of `A`.
-   **strideA2**: stride of dimension 2 of `A`.
-   **offsetA**: starting index for `A`.
-   **strideB1**: stride of dimension 1 of `B`.
-   **strideB2**: stride of dimension 2 of `B`.
-   **offsetB**: starting index for `B`.
-   **offsetWORK**: starting index for `WORK`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   The pentagonal `V` is composed of a `K`-by-`(M-L)` (left) or `K`-by-`(N-L)` (right) rectangular block followed by a `K`-by-`L` lower-trapezoidal block (the first `L` rows of a `K`-by-`K` upper-triangular matrix). Reflectors are stored row-wise, so the block kernel `dtprfb` is invoked with `storev='rowwise'`.
-   The `WORK` buffer should provide at least `N*mb` elements (`side='left'`) or `M*mb` elements (`side='right'`). If the buffer is too small, an internal scratch array is allocated automatically.
-   `V` and `T` must come from a prior call to `dtplqt` with the same block size `mb` and the same value of `L`.

</section>

<!-- /.notes -->

<section class="examples">

## Examples

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var dtpmlqt = require( '@stdlib/lapack/base/dtpmlqt' );

var V = new Float64Array( 12 );
var T = new Float64Array( 6 );
var A = new Float64Array( 9 );
var B = new Float64Array( 12 );
var WORK = new Float64Array( 6 );

dtpmlqt.ndarray( 'left', 'no-transpose', 4, 3, 3, 2, 2, V, 1, 3, 0, T, 1, 2, 0, A, 1, 3, 0, B, 1, 4, 0, WORK, 1, 0 );
console.log( A );
console.log( B );
```

</section>

<!-- /.examples -->

<!-- fortran-docs:start (generated by bin/fortran-docs.mjs from data/lapack-3.12.0/SRC/dtpmlqt.f; do not edit) -->

<section class="fortran-docs">

## Reference notes

The mathematical description from the reference LAPACK 3.12.0 source of `DTPMLQT`. Indices are the 1-based Fortran indices of the source.

### Purpose

DTPMQRT applies a real orthogonal matrix Q obtained from a "triangular-pentagonal" real block reflector H to a general real matrix C, which consists of two blocks A and B.

### Further Details

The columns of the pentagonal matrix V contain the elementary reflectors H(1), H(2), ..., H(K); V is composed of a rectangular block V1 and a trapezoidal block V2:

$$
V = [V_{1}] [V_{2}]
$$

The size of the trapezoidal block V2 is determined by the parameter L, where $0 \le L \le K$; V2 is lower trapezoidal, consisting of the first L rows of a K-by-K upper triangular matrix. If $L=K$, V2 is lower triangular; if $L=0$, there is no trapezoidal block, hence $V = V_{1}$ is rectangular.

If `SIDE = 'L'`: C = \[A\] where A is K-by-N, B is M-by-N and V is K-by-M.

\[B\]

If `SIDE = 'R'`: C = \[A B\] where A is M-by-K, B is M-by-N and V is K-by-N.

The real orthogonal matrix Q is formed from V and T.

If `TRANS='N'` and `SIDE='L'`, C is on exit replaced with $Q \, C$.

If `TRANS='T'` and `SIDE='L'`, C is on exit replaced with $Q^T \, C$.

If `TRANS='N'` and `SIDE='R'`, C is on exit replaced with $C \, Q$.

If `TRANS='T'` and `SIDE='R'`, C is on exit replaced with $C \, Q^T$.

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
