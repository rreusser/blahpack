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

# dlarzb

> Applies a real block reflector H or its transpose H**T from an RZ factorization to a real M-by-N matrix C, from either the left or the right.

Only `direct = 'backward'` and `storev = 'rowwise'` are supported (this matches how the reference LAPACK `DLARZB` is used for RZ factorization of trapezoidal matrices).

<section class="usage">

## Usage

```javascript
var dlarzb = require( '@stdlib/lapack/base/dlarzb' );
```

#### dlarzb( order, side, trans, direct, storev, M, N, K, l, V, LDV, T, LDT, C, LDC, WORK, LDWORK )

Applies a block reflector from RZ factorization to a general matrix

```javascript
var Float64Array = require( '@stdlib/array/float64' );

var V = new Float64Array( [ 0.3, -0.4 ] );
var T = new Float64Array( [ 0.8 ] );
var C = new Float64Array( [ 1.0, 2.0, 3.0, 4.0, 5.0, 6.0 ] );
var WORK = new Float64Array( 3 );

dlarzb( 'column-major', 'left', 'no-transpose', 'backward', 'rowwise', 2, 3, 1, 2, V, 1, T, 1, C, 2, WORK, 3 );
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **side**: `'left'` applies `H` from the left; `'right'` applies `H` from the right.
-   **trans**: `'no-transpose'` applies `H`; `'transpose'` applies `H**T`.
-   **direct**: direction of the reflectors (must be `'backward'`).
-   **storev**: storage layout of `V` (must be `'rowwise'`).
-   **M**: number of rows of `C`.
-   **N**: number of columns of `C`.
-   **K**: order of the block reflector (number of elementary reflectors).
-   **l**: number of columns of `V` containing the meaningful (non-identity) part.
-   **V**: `Float64Array` containing the K-by-L matrix of Householder vectors stored rowwise.
-   **LDV**: leading dimension of `V`.
-   **T**: `Float64Array` containing the K-by-K lower triangular factor of the block reflector.
-   **LDT**: leading dimension of `T`.
-   **C**: `Float64Array` containing the M-by-N matrix to which the block reflector is applied (overwritten on exit).
-   **LDC**: leading dimension of `C`.
-   **WORK**: `Float64Array` workspace (`LDWORK`-by-`K`); `LDWORK >= N` for `side='left'`, `LDWORK >= M` for `side='right'`.
-   **LDWORK**: leading dimension of `WORK`.

#### dlarzb.ndarray( side, trans, direct, storev, M, N, K, l, V, strideV1, strideV2, offsetV, T, strideT1, strideT2, offsetT, C, strideC1, strideC2, offsetC, WORK, strideWORK1, strideWORK2, offsetWORK )

Applies a block reflector from an RZ factorization to a general matrix, using alternative indexing semantics.

```javascript
var Float64Array = require( '@stdlib/array/float64' );

var V = new Float64Array( [ 0.3, -0.4 ] );
var T = new Float64Array( [ 0.8 ] );
var C = new Float64Array( [ 1.0, 2.0, 3.0, 4.0, 5.0, 6.0 ] );
var WORK = new Float64Array( 3 );

dlarzb.ndarray( 'left', 'no-transpose', 'backward', 'rowwise', 2, 3, 1, 2, V, 1, 1, 0, T, 1, 1, 0, C, 1, 2, 0, WORK, 1, 3, 0 );
```

The function has the following additional parameters:

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

-   This routine only supports `direct = 'backward'` and `storev = 'rowwise'`, matching the single usage pattern of the reference LAPACK `DLARZB`.
-   `WORK` must have leading dimension at least `max(1, N)` when `side = 'left'` and at least `max(1, M)` when `side = 'right'`.

</section>

<!-- /.notes -->

<section class="examples">

## Examples

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var dlarzb = require( '@stdlib/lapack/base/dlarzb' );

var V = new Float64Array( [ 0.3, -0.4 ] );
var T = new Float64Array( [ 0.8 ] );
var C = new Float64Array( [ 1.0, 2.0, 3.0, 4.0, 5.0, 6.0 ] );
var WORK = new Float64Array( 3 );

dlarzb( 'column-major', 'left', 'no-transpose', 'backward', 'rowwise', 2, 3, 1, 2, V, 1, T, 1, C, 2, WORK, 3 );
console.log( C );
```

</section>

<!-- /.examples -->

<!-- fortran-docs:start (generated by bin/fortran-docs.mjs from data/lapack-3.12.0/SRC/dlarzb.f; do not edit) -->

<section class="fortran-docs">

## Reference notes

The mathematical description from the reference LAPACK 3.12.0 source of `DLARZB`. Indices are the 1-based Fortran indices of the source.

### Purpose

DLARZB applies a real block reflector H or its transpose $H^T$ to a real distributed M-by-N C from the left or the right.

Currently, only `STOREV = 'R'` and `DIRECT = 'B'` are supported.

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
