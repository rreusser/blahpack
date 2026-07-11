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

# dtgexc

> Reorders the generalized real Schur decomposition of a real matrix pair (A,B) using an orthogonal equivalence transformation (A, B) = Q·(A, B)·Zᵀ, so that the diagonal block of (A, B) with row index IFST is moved to row ILST

<section class="usage">

## Usage

```javascript
var dtgexc = require( '@stdlib/lapack/base/dtgexc' );
```

#### dtgexc( order, wantq, wantz, N, A, LDA, B, LDB, Q, LDQ, Z, LDZ, ifst, ilst, WORK, strideWORK, lwork )

Reorders the generalized real Schur decomposition of a real matrix pair (A,B) using an orthogonal equivalence transformation (A, B) = Q·(A, B)·Zᵀ, so that the diagonal block of (A, B) with row index IFST is moved to row ILST

```javascript
var Float64Array = require( '@stdlib/array/float64' );

var A = new Float64Array( [ 1.0, 0.5, 0.3, 0.0, 2.0, 0.4, 0.0, 0.0, 3.0 ] );
var B = new Float64Array( [ 1.0, 0.2, 0.1, 0.0, 1.5, 0.3, 0.0, 0.0, 2.0 ] );
var Q = new Float64Array( [ 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0 ] );
var Z = new Float64Array( [ 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0 ] );
var WORK = new Float64Array( 28 );

var out = dtgexc( 'row-major', true, true, 3, A, 3, B, 3, Q, 3, Z, 3, 0, 2, WORK, 1, 28 );
// out.info => 0
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **wantq**: boolean indicating whether to update the matrix Q.
-   **wantz**: boolean indicating whether to update the matrix Z.
-   **N**: order of the matrices A and B.
-   **A**: upper quasi-triangular matrix.
-   **LDA**: leading dimension of `A`.
-   **B**: upper triangular matrix.
-   **LDB**: leading dimension of `B`.
-   **Q**: orthogonal matrix (updated if wantq is true).
-   **LDQ**: leading dimension of `Q`.
-   **Z**: orthogonal matrix (updated if wantz is true).
-   **LDZ**: leading dimension of `Z`.
-   **ifst**: row index of the block to move (0-based).
-   **ilst**: target row index (0-based).
-   **WORK**: workspace array.
-   **strideWORK**: stride length for `WORK`.
-   **lwork**: length of the workspace array.

#### dtgexc.ndarray( wantq, wantz, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, Q, strideQ1, strideQ2, offsetQ, Z, strideZ1, strideZ2, offsetZ, ifst, ilst, WORK, strideWORK, offsetWORK, lwork )

Reorders the generalized real Schur decomposition of a real matrix pair (A,B) using an orthogonal equivalence transformation (A, B) = Q·(A, B)·Zᵀ, so that the diagonal block of (A, B) with row index IFST is moved to row ILST, using alternative indexing semantics.

```javascript
var Float64Array = require( '@stdlib/array/float64' );

var A = new Float64Array( [ 1.0, 0.0, 0.0, 0.5, 2.0, 0.0, 0.3, 0.4, 3.0 ] );
var B = new Float64Array( [ 1.0, 0.0, 0.0, 0.2, 1.5, 0.0, 0.1, 0.3, 2.0 ] );
var Q = new Float64Array( 9 );
var Z = new Float64Array( 9 );
var WORK = new Float64Array( 28 );

var out = dtgexc.ndarray( false, false, 3, A, 1, 3, 0, B, 1, 3, 0, Q, 1, 3, 0, Z, 1, 3, 0, 0, 2, WORK, 1, 0, 28 );
// out.info => 0
```

The function has the following additional parameters:

-   **wantq**: boolean indicating whether to update the matrix Q.
-   **wantz**: boolean indicating whether to update the matrix Z.
-   **N**: order of the matrices A and B.
-   **A**: input matrix.
-   **strideA1**: stride of dimension 1 of `A`.
-   **strideA2**: stride of dimension 2 of `A`.
-   **offsetA**: starting index for `A`.
-   **B**: input matrix.
-   **strideB1**: stride of dimension 1 of `B`.
-   **strideB2**: stride of dimension 2 of `B`.
-   **offsetB**: starting index for `B`.
-   **Q**: input matrix.
-   **strideQ1**: stride of dimension 1 of `Q`.
-   **strideQ2**: stride of dimension 2 of `Q`.
-   **offsetQ**: starting index for `Q`.
-   **Z**: input matrix.
-   **strideZ1**: stride of dimension 1 of `Z`.
-   **strideZ2**: stride of dimension 2 of `Z`.
-   **offsetZ**: starting index for `Z`.
-   **ifst**: row index of the block to move (0-based).
-   **ilst**: target row index (0-based).
-   **WORK**: workspace array.
-   **strideWORK**: stride length for `WORK`.
-   **offsetWORK**: starting index for `WORK`.
-   **lwork**: length of the workspace array.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   The routine moves a diagonal block of the generalized real Schur form from position `ifst` to position `ilst`. Both `ifst` and `ilst` are 0-based indices and may be adjusted on return if they point to the second row of a 2-by-2 block.
-   The workspace array `WORK` should have length at least `4*N + 16`.

</section>

<!-- /.notes -->

<section class="examples">

## Examples

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var dtgexc = require( '@stdlib/lapack/base/dtgexc' );

// 3x3 upper triangular matrices in column-major order:
var A = new Float64Array( [ 1.0, 0.0, 0.0, 0.5, 2.0, 0.0, 0.3, 0.4, 3.0 ] );
var B = new Float64Array( [ 1.0, 0.0, 0.0, 0.2, 1.5, 0.0, 0.1, 0.3, 2.0 ] );
var Q = new Float64Array( [ 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0 ] );
var Z = new Float64Array( [ 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0 ] );
var WORK = new Float64Array( 28 );

// Move the eigenvalue at position 0 to position 2:
var out = dtgexc( 'column-major', true, true, 3, A, 3, B, 3, Q, 3, Z, 3, 0, 2, WORK, 1, 28 );

console.log( 'info:', out.info );
// => 0

console.log( 'A:', A );
console.log( 'B:', B );
```

</section>

<!-- /.examples -->

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
