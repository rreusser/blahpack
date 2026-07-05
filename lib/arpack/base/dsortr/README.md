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

# dsortr

> Sort values (and optionally permute a companion vector) for the symmetric Lanczos/Arnoldi iteration.

<section class="usage">

## Usage

```javascript
import dsortr from '@stdlib/arpack/base/dsortr/lib/index.js';
```

#### dsortr( which, apply, N, x1, strideX1, x2, strideX2 )

Sorts the values in `x1` with a gapped (Shell) insertion sort, optionally applying the same permutation to a companion vector `x2`.

```javascript
import Float64Array from '@stdlib/array/float64/lib/index.js';

var x1 = new Float64Array( [ 3.0, -1.0, 4.0, -1.5, 2.0 ] );
var x2 = new Float64Array( [ 10.0, 20.0, 30.0, 40.0, 50.0 ] );

dsortr( 'LA', true, 5, x1, 1, x2, 1 );
// x1 => <Float64Array>[ -1.5, -1.0, 2.0, 3.0, 4.0 ]
```

The function has the following parameters:

-   **which**: ordering, matching ARPACK's convention (the selected values move toward the end of `x1`): `'LM'` (largest magnitude), `'SM'` (smallest magnitude), `'LA'` (largest algebraic), or `'SA'` (smallest algebraic).
-   **apply**: boolean indicating whether to apply the sorting permutation to `x2`.
-   **N**: number of elements to sort.
-   **x1**: `Float64Array` whose values determine (and receive) the sort.
-   **strideX1**: stride length for `x1`.
-   **x2**: `Float64Array` companion array permuted alongside `x1` when `apply` is `true`.
-   **strideX2**: stride length for `x2`.

#### dsortr.ndarray( which, apply, N, x1, strideX1, offsetX1, x2, strideX2, offsetX2 )

Sorts the values in `x1`, using alternative indexing semantics.

```javascript
import Float64Array from '@stdlib/array/float64/lib/index.js';

var x1 = new Float64Array( [ 3.0, -1.0, 4.0, -1.5, 2.0 ] );
var x2 = new Float64Array( [ 10.0, 20.0, 30.0, 40.0, 50.0 ] );

dsortr.ndarray( 'LA', true, 5, x1, 1, 0, x2, 1, 0 );
// x1 => <Float64Array>[ -1.5, -1.0, 2.0, 3.0, 4.0 ]
```

The function has the following additional parameters:

-   **offsetX1**: starting index for `x1`.
-   **offsetX2**: starting index for `x2`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `dsortr` corresponds to the ARPACK routine `dsortr`, translated from the reference Fortran (arpack-ng 3.9.1). Both `x1` and `x2` are sorted in place; there is no return value.

</section>

<!-- /.notes -->

<section class="examples">

## Examples

```javascript
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dsortr from '@stdlib/arpack/base/dsortr/lib/index.js';

var x1 = new Float64Array( [ 3.0, -1.0, 4.0, -1.5, 2.0 ] );
var x2 = new Float64Array( [ 10.0, 20.0, 30.0, 40.0, 50.0 ] );

dsortr( 'LA', true, 5, x1, 1, x2, 1 );

console.log( x1 );
// => <Float64Array>[ -1.5, -1.0, 2.0, 3.0, 4.0 ]

console.log( x2 );
// => <Float64Array>[ 40.0, 20.0, 50.0, 10.0, 30.0 ]
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
