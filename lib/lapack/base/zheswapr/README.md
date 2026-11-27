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

# zheswapr

> Applies an elementary permutation to a complex Hermitian matrix.

<section class="usage">

## Usage

```javascript
var zheswapr = require( '@stdlib/lapack/base/zheswapr' );
```

#### zheswapr( order, uplo, N, A, LDA, i1, i2 )

Applies an elementary permutation to a complex Hermitian matrix, swapping rows/columns `i1` and `i2` while preserving Hermitian structure and the specified triangular storage.

```javascript
var Complex128Array = require( '@stdlib/array/complex128' );

var A = new Complex128Array([
    1, 0,  2, 1,  3, 2,
    2, -1, 4, 0,  5, 1,
    3, -2, 5, -1, 6, 0
]);

zheswapr( 'column-major', 'upper', 3, A, 3, 0, 2 );
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **uplo**: specifies whether the upper or lower triangle of `A` is stored (`'upper'` or `'lower'`).
-   **N**: order of the matrix `A`.
-   **A**: input [`Complex128Array`][@stdlib/array/complex128].
-   **LDA**: leading dimension of `A`.
-   **i1**: zero-based index of the first row/column to swap.
-   **i2**: zero-based index of the second row/column to swap (must be `>= i1`).

#### zheswapr.ndarray( uplo, N, A, strideA1, strideA2, offsetA, i1, i2 )

Applies an elementary permutation to a complex Hermitian matrix, using alternative indexing semantics.

```javascript
var Complex128Array = require( '@stdlib/array/complex128' );

var A = new Complex128Array([
    1, 0,  2, 1,  3, 2,
    2, -1, 4, 0,  5, 1,
    3, -2, 5, -1, 6, 0
]);

zheswapr.ndarray( 'upper', 3, A, 1, 3, 0, 0, 2 );
```

The function has the following additional parameters:

-   **strideA1**: stride of the first dimension of `A` (in complex elements).
-   **strideA2**: stride of the second dimension of `A` (in complex elements).
-   **offsetA**: starting index for `A` (in complex elements).

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   Diagonal elements are assumed to be real and remain real after the permutation.
-   The "middle" swap across the diagonal conjugates each pair to preserve Hermitian structure, and the single corner element `A(i1,i2)` is conjugated once more as a fix-up (mirroring the reference Fortran `DCONJG` step).

</section>

<!-- /.notes -->

<section class="examples">

## Examples

```javascript
var Complex128Array = require( '@stdlib/array/complex128' );
var zheswapr = require( '@stdlib/lapack/base/zheswapr' );

var A = new Complex128Array([
    1, 0,  2, 1,  3, 2,  4, 3,
    2, -1, 5, 0,  6, 1,  7, 2,
    3, -2, 6, -1, 8, 0,  9, 1,
    4, -3, 7, -2, 9, -1, 10, 0
]);

zheswapr( 'column-major', 'upper', 4, A, 4, 0, 3 );
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

[@stdlib/array/complex128]: https://github.com/stdlib-js/array-complex128

</section>

<!-- /.links -->
