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

# dgsvj1

> Pre-processor for dgesvj applying Jacobi rotations to off-diagonal block pivots

<section class="usage">

## Usage

```javascript
var dgsvj1 = require( '@stdlib/lapack/base/dgsvj1' );
```

#### dgsvj1( order, jobv, M, N, n1, A, LDA, d, strideD, sva, strideSVA, mv, V, LDV, eps, sfmin, tol, nsweep, work, strideWORK, lwork )

Pre-processor for dgesvj applying Jacobi rotations to off-diagonal block pivots

```javascript
var Float64Array = require( '@stdlib/array/float64' );

var EPS = 2.220446049250313e-16;
var SFMIN = 2.2250738585072014e-308;
var TOL = 1.0e-10;

var A = new Float64Array( [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 ] );
var d = new Float64Array( [ 1, 1, 1 ] );
var sva = new Float64Array( [ Math.sqrt( 30 ), Math.sqrt( 174 ), Math.sqrt( 446 ) ] );
var V = new Float64Array( 1 );
var work = new Float64Array( 4 );

var info = dgsvj1( 'column-major', 'no-v', 4, 3, 1, A, 4, d, 1, sva, 1, 0, V, 1, EPS, SFMIN, TOL, 5, work, 1, 4 );
// info: 0 (early convergence) or 4 (all sweeps used)
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **jobv**: one of `'compute-v'` (accumulate rotations into `V`), `'apply-v'` (post-multiply an `mv`-by-`N` `V`), or `'no-v'` (discard rotations).
-   **M**: number of rows.
-   **N**: number of columns.
-   **n1**: 2x2 block partition; the first `n1` columns are rotated against the remaining `N-n1` columns.
-   **A**: input matrix.
-   **LDA**: leading dimension of `A`.
-   **d**: input array.
-   **strideD**: stride length for `d`.
-   **sva**: input array.
-   **strideSVA**: stride length for `sva`.
-   **mv**: mv.
-   **V**: output matrix.
-   **LDV**: leading dimension of `V`.
-   **eps**: eps.
-   **sfmin**: sfmin.
-   **tol**: tol.
-   **nsweep**: nsweep.
-   **work**: input array.
-   **strideWORK**: stride length for `work`.
-   **lwork**: lwork.

#### dgsvj1.ndarray( jobv, M, N, n1, A, strideA1, strideA2, offsetA, d, strideD, offsetD, sva, strideSVA, offsetSVA, mv, V, strideV1, strideV2, offsetV, eps, sfmin, tol, nsweep, work, strideWORK, offsetWORK, lwork )

Pre-processor for dgesvj applying Jacobi rotations to off-diagonal block pivots, using alternative indexing semantics.

```javascript
var Float64Array = require( '@stdlib/array/float64' );

var EPS = 2.220446049250313e-16;
var SFMIN = 2.2250738585072014e-308;
var TOL = 1.0e-10;

var A = new Float64Array( [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 ] );
var d = new Float64Array( [ 1, 1, 1 ] );
var sva = new Float64Array( [ Math.sqrt( 30 ), Math.sqrt( 174 ), Math.sqrt( 446 ) ] );
var V = new Float64Array( 1 );
var work = new Float64Array( 4 );

var info = dgsvj1.ndarray( 'no-v', 4, 3, 1, A, 1, 4, 0, d, 1, 0, sva, 1, 0, 0, V, 1, 1, 0, EPS, SFMIN, TOL, 5, work, 1, 0, 4 );
```

The function has the following additional parameters:

-   **jobv**: one of `'compute-v'`, `'apply-v'`, or `'no-v'`.
-   **M**: number of rows.
-   **N**: number of columns.
-   **n1**: block partition; the first `n1` columns are rotated against the remaining `N-n1` columns.
-   **A**: input matrix.
-   **strideA1**: stride of dimension 1 of `A`.
-   **strideA2**: stride of dimension 2 of `A`.
-   **offsetA**: starting index for `A`.
-   **d**: input array.
-   **strideD**: stride length for `d`.
-   **offsetD**: starting index for `D`.
-   **sva**: input array.
-   **strideSVA**: stride length for `sva`.
-   **offsetSVA**: starting index for `SVA`.
-   **mv**: mv.
-   **V**: output matrix.
-   **strideV1**: stride of dimension 1 of `V`.
-   **strideV2**: stride of dimension 2 of `V`.
-   **offsetV**: starting index for `V`.
-   **eps**: eps.
-   **sfmin**: sfmin.
-   **tol**: tol.
-   **nsweep**: nsweep.
-   **work**: input array.
-   **strideWORK**: stride length for `work`.
-   **offsetWORK**: starting index for `WORK`.
-   **lwork**: lwork.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `dgsvj1` is the off-diagonal-block companion to [`dgsvj0`][@stdlib/lapack/base/dgsvj0]. It is invoked from `dgesvj` after `dgsvj0` has done the diagonal-block sweeps, to suppress only the (1,2) off-diagonal coupling between the first `n1` columns and the remaining `N - n1` columns. There is no de Rijk pivoting, no `lkahead`, and no convergence test inside the q-loop — the routine just performs `nsweep` block-row-cyclic Jacobi sweeps over the off-diagonal tile grid.
-   `tol` must be strictly greater than `eps` (otherwise the routine returns the negative argument-error code `-21`).
-   `lwork` must be at least `M`.

</section>

<!-- /.notes -->

<section class="examples">

## Examples

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var dgsvj1 = require( '@stdlib/lapack/base/dgsvj1' );

var EPS = 2.220446049250313e-16;
var SFMIN = 2.2250738585072014e-308;
var TOL = 1.0e-10;

var A = new Float64Array( [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 ] );
var d = new Float64Array( [ 1, 1, 1 ] );
var sva = new Float64Array( [ Math.sqrt( 30 ), Math.sqrt( 174 ), Math.sqrt( 446 ) ] );
var V = new Float64Array( 1 );
var work = new Float64Array( 4 );

var info = dgsvj1( 'column-major', 'no-v', 4, 3, 1, A, 4, d, 1, sva, 1, 0, V, 1, EPS, SFMIN, TOL, 5, work, 1, 4 );
console.log( info );
```

</section>

<!-- /.examples -->

<!-- fortran-docs:start (generated by bin/fortran-docs.mjs from data/lapack-3.12.0/SRC/dgsvj1.f; do not edit) -->

<section class="fortran-docs">

## Reference notes

The mathematical description from the reference LAPACK 3.12.0 source of `DGSVJ1`. Indices are the 1-based Fortran indices of the source.

### Purpose

DGSVJ1 is called from DGESVJ as a pre-processor and that is its main purpose. It applies Jacobi rotations in the same way as DGESVJ does, but it targets only particular pivots and it does not check convergence (stopping criterion). Few tuning parameters (marked by \[TP\]) are available for the implementer.

Further Details ~~~~~~~~~~~~~~~ DGSVJ1 applies few sweeps of Jacobi rotations in the column space of the input M-by-N matrix A. The pivot pairs are taken from the (1,2) off-diagonal block in the corresponding N-by-N Gram matrix A^$T \, A$. The block-entries (tiles) of the (1,2) off-diagonal block are marked by the \[x\]'s in the following scheme:

```text
| *  *  * [x] [x] [x]|
| *  *  * [x] [x] [x]|    Row-cycling in the nblr-by-nblc [x] blocks.
| *  *  * [x] [x] [x]|    Row-cyclic pivoting inside each [x] block.
|[x] [x] [x] *  *  * |
|[x] [x] [x] *  *  * |
|[x] [x] [x] *  *  * |
```

In terms of the columns of A, the first `N1` columns are rotated 'against' the remaining N-`N1` columns, trying to increase the angle between the corresponding subspaces. The off-diagonal block is `N1`-by(N-`N1`) and it is tiled using quadratic tiles of side KBL. Here, KBL is a tuning parameter. The number of sweeps is given in `NSWEEP` and the orthogonality threshold is given in `TOL`.

</section>

<!-- fortran-docs:end -->

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

[@stdlib/lapack/base/dgsvj0]: https://github.com/stdlib-js/stdlib

</section>

<!-- /.links -->
