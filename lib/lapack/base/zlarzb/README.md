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

# zlarzb

> Applies a complex block reflector from RZ factorization to a general matrix

<section class="usage">

## Usage

```javascript
var zlarzb = require( '@stdlib/lapack/base/zlarzb' );
```

#### zlarzb( order, side, trans, direct, storev, M, N, K, l, V, LDV, T, LDT, C, LDC, WORK, LDWORK )

Applies a complex block reflector from RZ factorization to a general matrix

```javascript
var Complex128Array = require( '@stdlib/array/complex128' );

var V = new Complex128Array( [ 0.2, 0.1, 0.4, -0.3, -0.1, 0.3, 0.5, 0.2 ] );
var T = new Complex128Array( [ 0.7, 0.1, 0.3, -0.2, 0.0, 0.0, 0.5, 0.3 ] );
var C = new Complex128Array( 4 * 3 );
var WORK = new Complex128Array( 3 * 2 );

zlarzb( 'column-major', 'left', 'no-transpose', 'backward', 'rowwise', 4, 3, 2, 2, V, 2, T, 2, C, 4, WORK, 3 );
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
-   **C**: input matrix.
-   **LDC**: leading dimension of `C`.
-   **WORK**: output matrix.
-   **LDWORK**: leading dimension of `WORK`.

#### zlarzb.ndarray( side, trans, direct, storev, M, N, K, l, V, strideV1, strideV2, offsetV, T, strideT1, strideT2, offsetT, C, strideC1, strideC2, offsetC, WORK, strideWORK1, strideWORK2, offsetWORK )

Applies a complex block reflector from RZ factorization to a general matrix, using alternative indexing semantics.

```javascript
var Complex128Array = require( '@stdlib/array/complex128' );

var V = new Complex128Array( [ 0.2, 0.1, 0.4, -0.3, -0.1, 0.3, 0.5, 0.2 ] );
var T = new Complex128Array( [ 0.7, 0.1, 0.3, -0.2, 0.0, 0.0, 0.5, 0.3 ] );
var C = new Complex128Array( 4 * 3 );
var WORK = new Complex128Array( 3 * 2 );

zlarzb.ndarray( 'left', 'no-transpose', 'backward', 'rowwise', 4, 3, 2, 2, V, 1, 2, 0, T, 1, 2, 0, C, 1, 4, 0, WORK, 1, 3, 0 );
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
-   **C**: input matrix.
-   **strideC1**: stride of dimension 1 of `C`.
-   **strideC2**: stride of dimension 2 of `C`.
-   **offsetC**: starting index for `C`.
-   **WORK**: output matrix.
-   **strideWORK1**: stride of dimension 1 of `WORK`.
-   **strideWORK2**: stride of dimension 2 of `WORK`.
-   **offsetWORK**: starting index for `WORK`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   Currently only `direct = 'backward'` and `storev = 'rowwise'` are supported (matching the Fortran reference).
-   `V` is a K-by-L matrix of row-stored reflector vectors.
-   `T` is the K-by-K lower triangular block-reflector factor from `zlarzt`.
-   `WORK` must be at least `N*K` elements for `side = 'left'` and `M*K` elements for `side = 'right'`.

</section>

<!-- /.notes -->

<section class="examples">

## Examples

```javascript
var Complex128Array = require( '@stdlib/array/complex128' );
var reinterpret = require( '@stdlib/strided/base/reinterpret-complex128' );
var zlarzb = require( '@stdlib/lapack/base/zlarzb' );

var M = 4;
var N = 3;
var K = 2;
var L = 2;

var V = new Complex128Array( [ 0.2, 0.1, 0.4, -0.3, -0.1, 0.3, 0.5, 0.2 ] );
var T = new Complex128Array( [ 0.7, 0.1, 0.3, -0.2, 0.0, 0.0, 0.5, 0.3 ] );
var C = new Complex128Array( M * N );
var WORK = new Complex128Array( N * K );

zlarzb( 'column-major', 'left', 'no-transpose', 'backward', 'rowwise', M, N, K, L, V, K, T, K, C, M, WORK, N );

console.log( reinterpret( C, 0 ) );
```

</section>

<!-- /.examples -->

<!-- fortran-docs:start (generated by bin/fortran-docs.mjs from data/lapack-3.12.0/SRC/zlarzb.f; do not edit) -->

<section class="fortran-docs">

## Reference documentation

From the reference LAPACK 3.12.0 source of `ZLARZB`, converted to Markdown with KaTeX math. Indices are the 1-based Fortran indices of the source.

> Applies a block reflector or its conjugate-transpose to a general matrix.

### Purpose

ZLARZB applies a complex block reflector H or its transpose $H^H$ to a complex distributed M-by-N C from the left or the right.

Currently, only `STOREV = 'R'` and `DIRECT = 'B'` are supported.

### Arguments

#### SIDE `[in]`

_CHARACTER\*1_

-   `= 'L'`: apply H or $H^H$ from the Left
-   `= 'R'`: apply H or $H^H$ from the Right

#### TRANS `[in]`

_CHARACTER\*1_

-   `= 'N'`: apply H (No transpose)
-   `= 'C'`: apply $H^H$ (Conjugate transpose)

#### DIRECT `[in]`

_CHARACTER\*1_

Indicates how H is formed from a product of elementary reflectors

-   `= 'F'`: $H = H(1)$ H(2) . . . H(k) (Forward, not supported yet)
-   `= 'B'`: $H = H(k)$ . . . H(2) H(1) (Backward)

#### STOREV `[in]`

_CHARACTER\*1_

Indicates how the vectors which define the elementary reflectors are stored:

-   `= 'C'`: Columnwise                        (not supported yet)
-   `= 'R'`: Rowwise

#### M `[in]`

_INTEGER_

The number of rows of the matrix C.

#### N `[in]`

_INTEGER_

The number of columns of the matrix C.

#### K `[in]`

_INTEGER_

The order of the matrix T (= the number of elementary reflectors whose product defines the block reflector).

#### L `[in]`

_INTEGER_

The number of columns of the matrix V containing the meaningful part of the Householder reflectors. If `SIDE = 'L'`, $M \ge L \ge 0$, if `SIDE = 'R'`, $N \ge L \ge 0$.

#### V `[in]`

_COMPLEX\*16 array, dimension (LDV,NV)_

If `STOREV = 'C'`, $\mathrm{NV} = K$; if `STOREV = 'R'`, $\mathrm{NV} = L$.

#### LDV `[in]`

_INTEGER_

The leading dimension of the array V. If `STOREV = 'C'`, $\mathrm{LDV} \ge L$; if `STOREV = 'R'`, $\mathrm{LDV} \ge K$.

#### T `[in]`

_COMPLEX\*16 array, dimension (LDT,K)_

The triangular K-by-K matrix T in the representation of the block reflector.

#### LDT `[in]`

_INTEGER_

The leading dimension of the array T. $\mathrm{LDT} \ge K$.

#### C `[in,out]`

_COMPLEX\*16 array, dimension (LDC,N)_

On entry, the M-by-N matrix C. On exit, C is overwritten by $H \, C$ or $H^H \, C$ or $C \, H$ or $C \, H^H$.

#### LDC `[in]`

_INTEGER_

The leading dimension of the array C. $\mathrm{LDC} \ge \max (1,M)$.

#### WORK `[out]`

_COMPLEX\*16 array, dimension (LDWORK,K)_

#### LDWORK `[in]`

_INTEGER_

The leading dimension of the array `WORK`. If `SIDE = 'L'`, $\mathrm{LDWORK} \ge \max (1,N)$; if `SIDE = 'R'`, $\mathrm{LDWORK} \ge \max (1,M)$.

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
