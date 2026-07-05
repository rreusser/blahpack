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

# dstqrb

> Compute all eigenvalues and the last components of the eigenvectors of a symmetric tridiagonal matrix.

<section class="usage">

## Usage

```javascript
import dstqrb from '@stdlib/arpack/base/dstqrb/lib/index.js';
```

#### dstqrb( N, d, strideD, e, strideE, Z, strideZ, WORK, strideWork )

Computes all eigenvalues and the last components of the eigenvectors of a symmetric tridiagonal matrix using the implicit QL or QR method.

```javascript
import Float64Array from '@stdlib/array/float64/lib/index.js';

var d = new Float64Array( [ 2.0, 2.0, 2.0, 2.0 ] );
var e = new Float64Array( [ -1.0, -1.0, -1.0 ] );
var Z = new Float64Array( 4 );
var WORK = new Float64Array( 6 );

var info = dstqrb( 4, d, 1, e, 1, Z, 1, WORK, 1 );
// info => 0
// d now holds the eigenvalues in ascending order; Z the last eigenvector row.
```

On entry, `d` holds the diagonal and `e` the subdiagonal of the tridiagonal matrix. On exit, `d` holds the eigenvalues in ascending order, `e` is destroyed, and `Z` holds the last row of the orthonormal eigenvector matrix.

The function has the following parameters:

-   **N**: order of the matrix.
-   **d**: `Float64Array` of diagonal elements (length `N`).
-   **strideD**: stride length for `d`.
-   **e**: `Float64Array` of subdiagonal elements (length `N-1`).
-   **strideE**: stride length for `e`.
-   **Z**: `Float64Array` receiving the last row of the eigenvector matrix (length `N`).
-   **strideZ**: stride length for `Z`.
-   **WORK**: workspace `Float64Array` (length `>= 2*(N-1)`).
-   **strideWork**: stride length for `WORK`.

The function returns `INFO`: `0` on success, or `> 0` if that many eigenvalues failed to converge.

#### dstqrb.ndarray( N, d, strideD, offsetD, e, strideE, offsetE, Z, strideZ, offsetZ, WORK, strideWork, offsetWork )

Computes all eigenvalues and the last eigenvector row, using alternative indexing semantics.

```javascript
import Float64Array from '@stdlib/array/float64/lib/index.js';

var d = new Float64Array( [ 2.0, 2.0, 2.0, 2.0 ] );
var e = new Float64Array( [ -1.0, -1.0, -1.0 ] );
var Z = new Float64Array( 4 );
var WORK = new Float64Array( 6 );

var info = dstqrb.ndarray( 4, d, 1, 0, e, 1, 0, Z, 1, 0, WORK, 1, 0 );
// info => 0
```

The function has the following additional parameters:

-   **offsetD**: starting index for `d`.
-   **offsetE**: starting index for `e`.
-   **offsetZ**: starting index for `Z`.
-   **offsetWork**: starting index for `WORK`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `dstqrb` corresponds to the ARPACK routine `dstqrb`, a modification of LAPACK's `dsteqr` that accumulates only the last row of the eigenvector matrix (so `Z` is a length-`N` vector). Translated from the reference Fortran (arpack-ng 3.9.1).

</section>

<!-- /.notes -->

<section class="examples">

## Examples

```javascript
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dstqrb from '@stdlib/arpack/base/dstqrb/lib/index.js';

var d = new Float64Array( [ 1.0, 2.0, 3.0, 4.0, 5.0 ] );
var e = new Float64Array( [ 1.0, 1.0, 1.0, 1.0 ] );
var Z = new Float64Array( 5 );
var WORK = new Float64Array( 8 );

var info = dstqrb( 5, d, 1, e, 1, Z, 1, WORK, 1 );

console.log( info );
// => 0

console.log( d );
// => eigenvalues in ascending order
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
