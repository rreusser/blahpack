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

# dsgets

> Select the shifts for the implicitly restarted symmetric Lanczos/Arnoldi iteration and sort the current Ritz values.

<section class="usage">

## Usage

```javascript
import dsgets from '@stdlib/arpack/base/dsgets/lib/index.js';
```

#### dsgets( ishift, which, kev, np, ritz, strideRitz, bounds, strideBounds, shifts, strideShifts )

Sorts the current Ritz values (permuting the associated bounds) and, when requested, selects the `np` shifts.

```javascript
import Float64Array from '@stdlib/array/float64/lib/index.js';

var ritz = new Float64Array( [ 3.0, -1.0, 4.0, -1.5, 2.0 ] );
var bounds = new Float64Array( [ 0.1, 0.5, 0.02, 0.3, 0.05 ] );
var shifts = new Float64Array( 2 );

dsgets( 1, 'LM', 3, 2, ritz, 1, bounds, 1, shifts, 1 );
// ritz => <Float64Array>[ -1.0, -1.5, 2.0, 3.0, 4.0 ]
// shifts => <Float64Array>[ -1.0, -1.5 ]
```

The function has the following parameters:

-   **ishift**: if `1`, compute the shifts; if `0`, leave `shifts` untouched.
-   **which**: ordering (ARPACK convention): `'LM'` (largest magnitude), `'SM'` (smallest magnitude), `'LA'` (largest algebraic), `'SA'` (smallest algebraic), or `'BE'` (both ends).
-   **kev**: number of wanted Ritz values.
-   **np**: number of shifts (unwanted Ritz values).
-   **ritz**: `Float64Array` of Ritz values (length `kev+np`); reordered in place.
-   **strideRitz**: stride length for `ritz`.
-   **bounds**: `Float64Array` of Ritz estimates (length `kev+np`); permuted alongside `ritz`.
-   **strideBounds**: stride length for `bounds`.
-   **shifts**: output `Float64Array` for the selected shifts (length `np`).
-   **strideShifts**: stride length for `shifts`.

#### dsgets.ndarray( ishift, which, kev, np, ritz, strideRitz, offsetRitz, bounds, strideBounds, offsetBounds, shifts, strideShifts, offsetShifts )

Selects shifts and sorts the Ritz values, using alternative indexing semantics.

```javascript
import Float64Array from '@stdlib/array/float64/lib/index.js';

var ritz = new Float64Array( [ 3.0, -1.0, 4.0, -1.5, 2.0 ] );
var bounds = new Float64Array( [ 0.1, 0.5, 0.02, 0.3, 0.05 ] );
var shifts = new Float64Array( 2 );

dsgets.ndarray( 1, 'LM', 3, 2, ritz, 1, 0, bounds, 1, 0, shifts, 1, 0 );
// ritz => <Float64Array>[ -1.0, -1.5, 2.0, 3.0, 4.0 ]
```

The function has the following additional parameters:

-   **offsetRitz**: starting index for `ritz`.
-   **offsetBounds**: starting index for `bounds`.
-   **offsetShifts**: starting index for `shifts`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `dsgets` corresponds to the ARPACK routine `dsgets`, translated from the reference Fortran (arpack-ng 3.9.1). For `which = 'BE'` it retains both ends of the spectrum by sorting ascending and interchanging the low wanted block with the shift block.

</section>

<!-- /.notes -->

<section class="examples">

## Examples

```javascript
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dsgets from '@stdlib/arpack/base/dsgets/lib/index.js';

var ritz = new Float64Array( [ 3.0, -1.0, 4.0, -1.5, 2.0 ] );
var bounds = new Float64Array( [ 0.1, 0.5, 0.02, 0.3, 0.05 ] );
var shifts = new Float64Array( 2 );

dsgets( 1, 'LM', 3, 2, ritz, 1, bounds, 1, shifts, 1 );

console.log( ritz );
// => <Float64Array>[ -1.0, -1.5, 2.0, 3.0, 4.0 ]

console.log( shifts );
// => <Float64Array>[ -1.0, -1.5 ]
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
