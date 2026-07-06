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

# dseigt

> Compute the eigenvalues of the current symmetric tridiagonal matrix and the corresponding Ritz estimates.

<section class="usage">

## Usage

```javascript
import dseigt from '@stdlib/arpack/base/dseigt/lib/index.js';
```

#### dseigt( rnorm, N, H, ldh, eig, strideEig, bounds, strideBounds, workl, strideWorkl )

Computes the eigenvalues of the current symmetric tridiagonal matrix `H` and the corresponding Ritz estimates.

```javascript
import Float64Array from '@stdlib/array/float64/lib/index.js';

// H in 2-column column-major layout: column 0 = subdiagonal, column 1 = diagonal.
var H = new Float64Array( [ 0.0, -1.0, -1.0, -1.0, 2.0, 2.0, 2.0, 2.0 ] );
var eig = new Float64Array( 4 );
var bounds = new Float64Array( 4 );
var workl = new Float64Array( 12 );

var ierr = dseigt( 0.5, 4, H, 4, eig, 1, bounds, 1, workl, 1 );
// ierr => 0
```

On exit, `eig` holds the eigenvalues in ascending order and `bounds` holds the Ritz estimates `rnorm * |z|`, where `z` is the last component of each eigenvector.

The function has the following parameters:

-   **rnorm**: residual norm of the Lanczos/Arnoldi factorization.
-   **N**: order of the matrix `H`.
-   **H**: `Float64Array` holding the tridiagonal matrix in 2-column layout — the subdiagonal in column 0 (rows 1..N-1) and the diagonal in column 1.
-   **ldh**: leading dimension of `H`.
-   **eig**: output `Float64Array` for the eigenvalues (length `N`).
-   **strideEig**: stride length for `eig`.
-   **bounds**: output `Float64Array` for the Ritz estimates (length `N`).
-   **strideBounds**: stride length for `bounds`.
-   **workl**: workspace `Float64Array` (length `>= 3*N`).
-   **strideWorkl**: stride length for `workl`.

The function returns `IERR`: `0` on success, otherwise the `dstqrb` error code.

#### dseigt.ndarray( rnorm, N, H, strideH1, strideH2, offsetH, eig, strideEig, offsetEig, bounds, strideBounds, offsetBounds, workl, strideWorkl, offsetWorkl )

Computes the eigenvalues and Ritz estimates, using alternative indexing semantics.

```javascript
import Float64Array from '@stdlib/array/float64/lib/index.js';

var H = new Float64Array( [ 0.0, -1.0, -1.0, -1.0, 2.0, 2.0, 2.0, 2.0 ] );
var eig = new Float64Array( 4 );
var bounds = new Float64Array( 4 );
var workl = new Float64Array( 12 );

var ierr = dseigt.ndarray( 0.5, 4, H, 1, 4, 0, eig, 1, 0, bounds, 1, 0, workl, 1, 0 );
// ierr => 0
```

The function has the following additional parameters:

-   **strideH1**: stride of the first (row) dimension of `H`.
-   **strideH2**: stride of the second (column) dimension of `H`.
-   **offsetH**: starting index for `H`.
-   **offsetEig**: starting index for `eig`.
-   **offsetBounds**: starting index for `bounds`.
-   **offsetWorkl**: starting index for `workl`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `dseigt` corresponds to the ARPACK routine `dseigt`, translated from the reference Fortran (arpack-ng 3.9.1). It delegates the tridiagonal eigensolve to `dstqrb`.

</section>

<!-- /.notes -->

<section class="examples">

## Examples

```javascript
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dseigt from '@stdlib/arpack/base/dseigt/lib/index.js';

var H = new Float64Array( [ 0.0, -1.0, -1.0, -1.0, 2.0, 2.0, 2.0, 2.0 ] );
var eig = new Float64Array( 4 );
var bounds = new Float64Array( 4 );
var workl = new Float64Array( 12 );

var ierr = dseigt( 0.5, 4, H, 4, eig, 1, bounds, 1, workl, 1 );

console.log( ierr );
// => 0

console.log( eig );
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
