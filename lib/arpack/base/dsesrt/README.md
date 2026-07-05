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

# dsesrt

> Sort values and apply the permutation to the columns of a companion matrix for the symmetric Lanczos/Arnoldi iteration.

<section class="usage">

## Usage

```javascript
import dsesrt from '@stdlib/arpack/base/dsesrt/lib/index.js';
```

#### dsesrt( which, apply, N, x, strideX, na, A, lda )

Sorts the values in `x` with a gapped (Shell) insertion sort, optionally applying the same permutation to the columns of a column-major companion matrix `A`.

```javascript
import Float64Array from '@stdlib/array/float64/lib/index.js';

var x = new Float64Array( [ 3.0, 1.0, 2.0 ] );
var A = new Float64Array( [ 11.0, 12.0, 21.0, 22.0, 31.0, 32.0 ] ); // 2x3, lda=2

dsesrt( 'LA', true, 3, x, 1, 2, A, 2 );
// x => <Float64Array>[ 1.0, 2.0, 3.0 ]
```

The function has the following parameters:

-   **which**: ordering, matching ARPACK's convention (the selected values move toward the end of `x`): `'LM'` (largest magnitude), `'SM'` (smallest magnitude), `'LA'` (largest algebraic), or `'SA'` (smallest algebraic).
-   **apply**: boolean indicating whether to apply the sorting permutation to the columns of `A`.
-   **N**: number of elements to sort.
-   **x**: `Float64Array` whose values determine (and receive) the sort.
-   **strideX**: stride length for `x`.
-   **na**: number of rows of `A` to permute.
-   **A**: `Float64Array` companion matrix (column-major) whose columns are permuted alongside `x` when `apply` is `true`.
-   **lda**: leading dimension of `A`.

#### dsesrt.ndarray( which, apply, N, x, strideX, offsetX, na, A, strideA1, strideA2, offsetA )

Sorts the values in `x`, using alternative indexing semantics.

```javascript
import Float64Array from '@stdlib/array/float64/lib/index.js';

var x = new Float64Array( [ 3.0, 1.0, 2.0 ] );
var A = new Float64Array( [ 11.0, 12.0, 21.0, 22.0, 31.0, 32.0 ] ); // 2x3, column-major

dsesrt.ndarray( 'LA', true, 3, x, 1, 0, 2, A, 1, 2, 0 );
// x => <Float64Array>[ 1.0, 2.0, 3.0 ]
```

The function has the following additional parameters:

-   **offsetX**: starting index for `x`.
-   **strideA1**: stride of the first (row) dimension of `A`.
-   **strideA2**: stride of the second (column) dimension of `A`.
-   **offsetA**: starting index for `A`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `dsesrt` corresponds to the ARPACK routine `dsesrt`, translated from the reference Fortran (arpack-ng 3.9.1). Both `x` and (when `apply`) the columns of `A` are permuted in place; there is no return value. Only the first `na` rows of each column of `A` are swapped.

</section>

<!-- /.notes -->

<section class="examples">

## Examples

```javascript
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dsesrt from '@stdlib/arpack/base/dsesrt/lib/index.js';

var x = new Float64Array( [ 3.0, 1.0, 4.0, 2.0 ] );
var A = new Float64Array( [ 11.0, 12.0, 21.0, 22.0, 31.0, 32.0, 41.0, 42.0 ] ); // 2x4, lda=2

dsesrt( 'LA', true, 4, x, 1, 2, A, 2 );

console.log( x );
// => <Float64Array>[ 1.0, 2.0, 3.0, 4.0 ]
```

</section>

<!-- /.examples -->

<!-- Section for related `stdlib` packages. Do not manually edit this section, as it is automatically populated. -->

<section class="related">

</section>

<!-- /.related -->

<section class="links">

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

</section>

<!-- /.links -->
