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

# dtgex2

> Swap adjacent diagonal 1-by-1 or 2-by-2 blocks in an upper (quasi-)triangular matrix pair (A,B) by an orthogonal equivalence transformation.

<section class="usage">

## Usage

```javascript
var dtgex2 = require( '@stdlib/lapack/base/dtgex2' );
```

#### dtgex2( order, wantq, wantz, N, A, LDA, B, LDB, Q, LDQ, Z, LDZ, j1, n1, n2, WORK, strideWORK )

Swaps adjacent diagonal blocks of sizes `n1` and `n2` starting at position `j1` in the upper quasi-triangular matrix pair `(A, B)`.

```javascript
var Float64Array = require( '@stdlib/array/float64' );

var A = new Float64Array( [ 1.0, 0.0, 0.0, 0.5, 2.0, 0.0, 0.3, 0.4, 3.0 ] );
var B = new Float64Array( [ 1.0, 0.0, 0.0, 0.2, 1.5, 0.0, 0.1, 0.3, 2.0 ] );
var Q = new Float64Array( [ 1, 0, 0, 0, 1, 0, 0, 0, 1 ] );
var Z = new Float64Array( [ 1, 0, 0, 0, 1, 0, 0, 0, 1 ] );
var WORK = new Float64Array( 200 );

var info = dtgex2( 'column-major', true, true, 3, A, 3, B, 3, Q, 3, Z, 3, 0, 1, 1, WORK, 1, 200 );
// info => 0
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **wantq**: boolean indicating whether to update the left transformation matrix Q.
-   **wantz**: boolean indicating whether to update the right transformation matrix Z.
-   **N**: order of the matrices A and B.
-   **A**: upper quasi-triangular matrix A (modified in place).
-   **LDA**: leading dimension of `A`.
-   **B**: upper triangular matrix B (modified in place).
-   **LDB**: leading dimension of `B`.
-   **Q**: left orthogonal transformation matrix (modified in place if wantq is true).
-   **LDQ**: leading dimension of `Q`.
-   **Z**: right orthogonal transformation matrix (modified in place if wantz is true).
-   **LDZ**: leading dimension of `Z`.
-   **j1**: index (0-based) of the first diagonal block to swap.
-   **n1**: size of the first block (1 or 2).
-   **n2**: size of the second block (1 or 2).
-   **WORK**: workspace array.
-   **strideWORK**: stride length for `WORK`.

#### dtgex2.ndarray( wantq, wantz, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, Q, strideQ1, strideQ2, offsetQ, Z, strideZ1, strideZ2, offsetZ, j1, n1, n2, WORK, strideWORK, offsetWORK )

Swaps adjacent diagonal blocks using alternative indexing semantics.

```javascript
var Float64Array = require( '@stdlib/array/float64' );

var A = new Float64Array( [ 1.0, 0.0, 0.0, 0.5, 2.0, 0.0, 0.3, 0.4, 3.0 ] );
var B = new Float64Array( [ 1.0, 0.0, 0.0, 0.2, 1.5, 0.0, 0.1, 0.3, 2.0 ] );
var Q = new Float64Array( [ 1, 0, 0, 0, 1, 0, 0, 0, 1 ] );
var Z = new Float64Array( [ 1, 0, 0, 0, 1, 0, 0, 0, 1 ] );
var WORK = new Float64Array( 200 );

var info = dtgex2.ndarray( true, true, 3, A, 1, 3, 0, B, 1, 3, 0, Q, 1, 3, 0, Z, 1, 3, 0, 0, 1, 1, WORK, 1, 0, 200 );
// info => 0
```

The function has the following additional parameters:

-   **strideA1**: stride of the first dimension of `A`.
-   **strideA2**: stride of the second dimension of `A`.
-   **offsetA**: starting index for `A`.
-   **strideB1**: stride of the first dimension of `B`.
-   **strideB2**: stride of the second dimension of `B`.
-   **offsetB**: starting index for `B`.
-   **strideQ1**: stride of the first dimension of `Q`.
-   **strideQ2**: stride of the second dimension of `Q`.
-   **offsetQ**: starting index for `Q`.
-   **strideZ1**: stride of the first dimension of `Z`.
-   **strideZ2**: stride of the second dimension of `Z`.
-   **offsetZ**: starting index for `Z`.
-   **offsetWORK**: starting index for `WORK`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   The routine is used by `dtgexc` for reordering the generalized Schur form of a matrix pair (A, B).
-   If the swap is rejected (ill-conditioned), the function returns `info = 1`.
-   If the workspace is too small, the function returns `info = -16` and `WORK[0]` is set to the required size.

</section>

<!-- /.notes -->

<section class="examples">

## Examples

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var dtgex2 = require( '@stdlib/lapack/base/dtgex2' );

var A = new Float64Array( [ 1.0, 0.0, 0.0, 0.5, 2.0, 0.0, 0.3, 0.4, 3.0 ] );
var B = new Float64Array( [ 1.0, 0.0, 0.0, 0.2, 1.5, 0.0, 0.1, 0.3, 2.0 ] );
var Q = new Float64Array( [ 1, 0, 0, 0, 1, 0, 0, 0, 1 ] );
var Z = new Float64Array( [ 1, 0, 0, 0, 1, 0, 0, 0, 1 ] );
var WORK = new Float64Array( 200 );

var info = dtgex2.ndarray( true, true, 3, A, 1, 3, 0, B, 1, 3, 0, Q, 1, 3, 0, Z, 1, 3, 0, 0, 1, 1, WORK, 1, 0, 200 );
console.log( 'info:', info );
// => info: 0

console.log( 'A:', A );
console.log( 'Q:', Q );
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
