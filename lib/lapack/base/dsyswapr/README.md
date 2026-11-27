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

# dsyswapr

> Applies an elementary permutation to a symmetric matrix

<section class="usage">

## Usage

```javascript
var dsyswapr = require( '@stdlib/lapack/base/dsyswapr' );
```

#### dsyswapr( order, uplo, N, A, LDA, i1, i2 )

Applies an elementary permutation to a symmetric matrix, swapping rows/columns `i1` and `i2` while preserving symmetry and the specified triangular storage.

```javascript
var Float64Array = require( '@stdlib/array/float64' );

// Build a 3x3 symmetric matrix in column-major upper storage:
var A = new Float64Array( [ 1.0, 0.0, 0.0, 2.0, 4.0, 0.0, 3.0, 5.0, 6.0 ] );

dsyswapr( 'column-major', 'upper', 3, A, 3, 0, 2 );
// Rows/columns 0 and 2 are swapped in the upper triangle.
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **uplo**: specifies whether the upper (`'upper'`) or lower (`'lower'`) triangle of `A` is stored.
-   **N**: order of the matrix `A`.
-   **A**: input matrix stored as a `Float64Array`.
-   **LDA**: leading dimension of `A`.
-   **i1**: zero-based index of the first row/column to swap.
-   **i2**: zero-based index of the second row/column to swap (must be `>= i1`).

#### dsyswapr.ndarray( uplo, N, A, strideA1, strideA2, offsetA, i1, i2 )

Applies an elementary permutation to a symmetric matrix, using alternative indexing semantics.

```javascript
var Float64Array = require( '@stdlib/array/float64' );

var A = new Float64Array( [ 1.0, 0.0, 0.0, 2.0, 4.0, 0.0, 3.0, 5.0, 6.0 ] );

dsyswapr.ndarray( 'upper', 3, A, 1, 3, 0, 0, 2 );
```

The function has the following additional parameters:

-   **uplo**: specifies whether the upper (`'upper'`) or lower (`'lower'`) triangle of `A` is stored.
-   **N**: order of the matrix `A`.
-   **A**: input matrix stored as a `Float64Array`.
-   **strideA1**: stride of dimension 1 of `A`.
-   **strideA2**: stride of dimension 2 of `A`.
-   **offsetA**: starting index for `A`.
-   **i1**: zero-based index of the first row/column to swap.
-   **i2**: zero-based index of the second row/column to swap.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `dsyswapr` is used internally by the Bunch-Kaufman factorization routines (e.g., `dsytrf_rook`) to apply pivot interchanges to a symmetric matrix while preserving the upper- or lower-triangular storage layout.
-   Indices `i1` and `i2` are zero-based and must satisfy `0 <= i1 <= i2 < N`. When `i1 === i2`, the call is a no-op.

</section>

<!-- /.notes -->

<section class="examples">

## Examples

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var dsyswapr = require( '@stdlib/lapack/base/dsyswapr' );

// Column-major, upper-triangular symmetric 4x4 matrix:
var A = new Float64Array([
    11, 0, 0, 0,
    12, 22, 0, 0,
    13, 23, 33, 0,
    14, 24, 34, 44
]);

// Swap rows/columns 0 and 3:
dsyswapr( 'column-major', 'upper', 4, A, 4, 0, 3 );
console.log( A );
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
