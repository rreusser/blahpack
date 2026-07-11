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

# ztgexc

> Reorders the generalized Schur decomposition of a complex matrix pair (A,B), using an unitary equivalence transformation (A, B) := Q·(A, B)·Zᴴ, so that the diagonal block of (A, B) with row index IFST is moved to row ILST

<section class="usage">

## Usage

```javascript
var ztgexc = require( '@stdlib/lapack/base/ztgexc' );
```

#### ztgexc( order, wantq, wantz, N, A, LDA, B, LDB, Q, LDQ, Z, LDZ, ifst, ilst )

Reorders the generalized Schur decomposition of a complex matrix pair (A,B), using an unitary equivalence transformation (A, B) := Q·(A, B)·Zᴴ, so that the diagonal block of (A, B) with row index IFST is moved to row ILST

```javascript
var Complex128Array = require( '@stdlib/array/complex128' );

var A = new Complex128Array( [ 2.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.5, -0.2, 4.0, 0.0, 0.0, 0.0, 0.3, 0.1, 0.7, -0.3, 6.0, -1.0 ] );
var B = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.2, 0.1, 1.0, 0.0, 0.0, 0.0, 0.1, -0.05, 0.3, 0.2, 1.0, 0.0 ] );
var Q = new Complex128Array( 9 );
var Z = new Complex128Array( 9 );

var result = ztgexc( 'column-major', true, true, 3, A, 3, B, 3, Q, 3, Z, 3, 0, 2 );
// result => { ifst: 0, ilst: 1, info: 0 }
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **wantq**: whether to update the left transformation matrix Q.
-   **wantz**: whether to update the right transformation matrix Z.
-   **N**: order of the matrices A and B.
-   **A**: upper triangular matrix A (`Complex128Array`).
-   **LDA**: leading dimension of `A`.
-   **B**: upper triangular matrix B (`Complex128Array`).
-   **LDB**: leading dimension of `B`.
-   **Q**: unitary matrix Q (`Complex128Array`).
-   **LDQ**: leading dimension of `Q`.
-   **Z**: unitary matrix Z (`Complex128Array`).
-   **LDZ**: leading dimension of `Z`.
-   **ifst**: starting position (0-based) of the diagonal element to move.
-   **ilst**: target position (0-based) for the diagonal element.

#### ztgexc.ndarray( wantq, wantz, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, Q, strideQ1, strideQ2, offsetQ, Z, strideZ1, strideZ2, offsetZ, ifst, ilst )

Reorders the generalized Schur decomposition of a complex matrix pair (A,B), using an unitary equivalence transformation (A, B) := Q·(A, B)·Zᴴ, so that the diagonal block of (A, B) with row index IFST is moved to row ILST, using alternative indexing semantics.

```javascript
var Complex128Array = require( '@stdlib/array/complex128' );

var A = new Complex128Array( [ 2.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.5, -0.2, 4.0, 0.0, 0.0, 0.0, 0.3, 0.1, 0.7, -0.3, 6.0, -1.0 ] );
var B = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.2, 0.1, 1.0, 0.0, 0.0, 0.0, 0.1, -0.05, 0.3, 0.2, 1.0, 0.0 ] );
var Q = new Complex128Array( 9 );
var Z = new Complex128Array( 9 );

var result = ztgexc.ndarray( true, true, 3, A, 1, 3, 0, B, 1, 3, 0, Q, 1, 3, 0, Z, 1, 3, 0, 0, 2 );
// result => { ifst: 0, ilst: 1, info: 0 }
```

The function has the following additional parameters:

-   **wantq**: whether to update the left transformation matrix Q.
-   **wantz**: whether to update the right transformation matrix Z.
-   **N**: order of the matrices A and B.
-   **A**: upper triangular matrix A (`Complex128Array`).
-   **strideA1**: stride of dimension 1 of `A` (complex elements).
-   **strideA2**: stride of dimension 2 of `A` (complex elements).
-   **offsetA**: starting index for `A` (complex elements).
-   **B**: upper triangular matrix B (`Complex128Array`).
-   **strideB1**: stride of dimension 1 of `B` (complex elements).
-   **strideB2**: stride of dimension 2 of `B` (complex elements).
-   **offsetB**: starting index for `B` (complex elements).
-   **Q**: unitary matrix Q (`Complex128Array`).
-   **strideQ1**: stride of dimension 1 of `Q` (complex elements).
-   **strideQ2**: stride of dimension 2 of `Q` (complex elements).
-   **offsetQ**: starting index for `Q` (complex elements).
-   **Z**: unitary matrix Z (`Complex128Array`).
-   **strideZ1**: stride of dimension 1 of `Z` (complex elements).
-   **strideZ2**: stride of dimension 2 of `Z` (complex elements).
-   **offsetZ**: starting index for `Z` (complex elements).
-   **ifst**: starting position (0-based) of the diagonal element to move.
-   **ilst**: target position (0-based) for the diagonal element.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   The function returns an object with `ifst`, `ilst`, and `info` fields. On success, `info` is `0`. If a swap fails partway, `info` is `1` and `ilst` indicates where the process stopped.
-   `ifst` and `ilst` are 0-based indices.
-   Complex triangular matrices have only 1x1 diagonal blocks, so no 2x2 block handling is needed.

</section>

<!-- /.notes -->

<section class="examples">

## Examples

```javascript
var Complex128Array = require( '@stdlib/array/complex128' );
var reinterpret = require( '@stdlib/strided/base/reinterpret-complex128' );
var ztgexc = require( '@stdlib/lapack/base/ztgexc' );

var A = new Complex128Array( [ 2.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.5, -0.2, 4.0, 0.0, 0.0, 0.0, 0.3, 0.1, 0.7, -0.3, 6.0, -1.0 ] );
var B = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.2, 0.1, 1.0, 0.0, 0.0, 0.0, 0.1, -0.05, 0.3, 0.2, 1.0, 0.0 ] );
var Q = new Complex128Array( 9 );
var Z = new Complex128Array( 9 );

var result = ztgexc.ndarray( true, true, 3, A, 1, 3, 0, B, 1, 3, 0, Q, 1, 3, 0, Z, 1, 3, 0, 0, 2 );
console.log( 'info:', result.info );
console.log( 'A:', reinterpret( A, 0 ) );
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
