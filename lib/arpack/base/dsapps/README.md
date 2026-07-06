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

# dsapps

> Apply `np` implicit shifts to a symmetric Arnoldi/Lanczos factorization via bulge chasing.

<section class="usage">

## Usage

```javascript
import dsapps from '@stdlib/arpack/base/dsapps/lib/index.js';
```

#### dsapps( n, kev, np, shift, strideShift, v, ldv, h, ldh, resid, strideResid, q, ldq, workd, strideWorkd )

Applies `np` implicit shifts to the symmetric Arnoldi/Lanczos factorization, updating `v`, `h`, and `resid` in place.

```javascript
import Float64Array from '@stdlib/array/float64/lib/index.js';

var v = new Float64Array( 5 * 3 );
var i;
for ( i = 0; i < v.length; i++ ) {
    v[ i ] = ( i + 1 ) * 0.1;
}

// H in the 2-column column-major layout: column 0 = subdiagonal, column 1 = diagonal.
var h = new Float64Array( [ 0.0, 1.0, 0.5, 3.0, 1.0, 2.0 ] );
var resid = new Float64Array( [ 1.0, 2.0, 3.0, 4.0, 5.0 ] );
var shift = new Float64Array( [ 1.75 ] );
var q = new Float64Array( 3 * 3 );
var workd = new Float64Array( 10 );

dsapps( 5, 2, 1, shift, 1, v, 5, h, 3, resid, 1, q, 3, workd, 1 );
```

Given the Arnoldi factorization `A*V_{k} - V_{k}*H_{k} = r_{k+p}*e_{k+p}^T`, the routine applies `np` shifts implicitly. On exit, the updated Arnoldi vectors occupy the first `kev` columns of `v`, the updated tridiagonal matrix occupies the leading `kev` submatrix of `h`, and `resid` is the updated residual vector.

The function has the following parameters:

-   **n**: problem size (dimension of the matrix `A`).
-   **kev**: number of wanted eigenvalues; on exit, the order of the updated factorization.
-   **np**: number of implicit shifts to apply.
-   **shift**: `Float64Array` of shifts to apply (length `np`).
-   **strideShift**: stride length for `shift`.
-   **v**: `Float64Array` holding the Arnoldi vectors in column-major order (`n` by `kev+np`).
-   **ldv**: leading dimension of `v`.
-   **h**: `Float64Array` holding the tridiagonal matrix in the 2-column column-major layout — the subdiagonal in column 0 (rows 1..kev+np-1) and the diagonal in column 1. The subdiagonal elements are assumed non-negative on input and are enforced non-negative on output.
-   **ldh**: leading dimension of `h`.
-   **resid**: residual `Float64Array` (length `n`), updated in place.
-   **strideResid**: stride length for `resid`.
-   **q**: workspace `Float64Array` used to accumulate the rotations (`kev+np` by `kev+np`).
-   **ldq**: leading dimension of `q`.
-   **workd**: workspace `Float64Array` (length `>= 2*n`).
-   **strideWorkd**: stride length for `workd`.

#### dsapps.ndarray( n, kev, np, shift, strideShift, offsetShift, v, strideV1, strideV2, offsetV, h, strideH1, strideH2, offsetH, resid, strideResid, offsetResid, q, strideQ1, strideQ2, offsetQ, workd, strideWorkd, offsetWorkd )

Applies `np` implicit shifts, using alternative indexing semantics.

```javascript
import Float64Array from '@stdlib/array/float64/lib/index.js';

var v = new Float64Array( 5 * 3 );
var i;
for ( i = 0; i < v.length; i++ ) {
    v[ i ] = ( i + 1 ) * 0.1;
}

var h = new Float64Array( [ 0.0, 1.0, 0.5, 3.0, 1.0, 2.0 ] );
var resid = new Float64Array( [ 1.0, 2.0, 3.0, 4.0, 5.0 ] );
var shift = new Float64Array( [ 1.75 ] );
var q = new Float64Array( 3 * 3 );
var workd = new Float64Array( 10 );

dsapps.ndarray( 5, 2, 1, shift, 1, 0, v, 1, 5, 0, h, 1, 3, 0, resid, 1, 0, q, 1, 3, 0, workd, 1, 0 );
```

The function has the following additional parameters:

-   **offsetShift**: starting index for `shift`.
-   **strideV1**: stride of the first (row) dimension of `v`.
-   **strideV2**: stride of the second (column) dimension of `v`.
-   **offsetV**: starting index for `v`.
-   **strideH1**: stride of the first (row) dimension of `h`.
-   **strideH2**: stride of the second (column) dimension of `h`.
-   **offsetH**: starting index for `h`.
-   **offsetResid**: starting index for `resid`.
-   **strideQ1**: stride of the first (row) dimension of `q`.
-   **strideQ2**: stride of the second (column) dimension of `q`.
-   **offsetQ**: starting index for `q`.
-   **offsetWorkd**: starting index for `workd`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `dsapps` corresponds to the ARPACK routine `dsapps`, translated from the reference Fortran (arpack-ng 3.9.1). Each shift is applied to the whole tridiagonal matrix (not just the subblock it comes from), and the routine incorporates deflation of negligible off-diagonal elements.

</section>

<!-- /.notes -->

<section class="examples">

## Examples

```javascript
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dsapps from '@stdlib/arpack/base/dsapps/lib/index.js';

var v = new Float64Array( 5 * 3 );
var i;
for ( i = 0; i < v.length; i++ ) {
    v[ i ] = ( i + 1 ) * 0.1;
}

var h = new Float64Array( [ 0.0, 1.0, 0.5, 3.0, 1.0, 2.0 ] );
var resid = new Float64Array( [ 1.0, 2.0, 3.0, 4.0, 5.0 ] );
var shift = new Float64Array( [ 1.75 ] );
var q = new Float64Array( 3 * 3 );
var workd = new Float64Array( 10 );

dsapps( 5, 2, 1, shift, 1, v, 5, h, 3, resid, 1, q, 3, workd, 1 );

console.log( h );
// => updated tridiagonal matrix

console.log( resid );
// => updated residual vector
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
