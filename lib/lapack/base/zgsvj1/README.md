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

# zgsvj1

> Pre-processor for `zgesvj` applying Jacobi rotations to off-diagonal block pivots.

<section class="usage">

## Usage

```javascript
var zgsvj1 = require( '@stdlib/lapack/base/zgsvj1' );
```

#### zgsvj1( order, jobv, M, N, n1, A, LDA, d, strideD, sva, strideSVA, mv, V, LDV, eps, sfmin, tol, nsweep, work, strideWORK, lwork )

Applies `nsweep` row-cyclic sweeps of complex Jacobi rotations to the `M`-by-`N` matrix `A*diag(D)`, restricted to pivot pairs in the (1,2) off-diagonal block of the Gram matrix `A^H * A`.

```javascript
var Complex128Array = require( '@stdlib/array/complex128' );
var Float64Array = require( '@stdlib/array/float64' );

var EPS = 2.220446049250313e-16;
var SFMIN = 2.2250738585072014e-308;
var TOL = 1.0e-10;

var A = new Complex128Array( [ 1, 0.5, 2, -0.5, 3, 1, 4, -1, 5, 0.25, 6, -0.25, 7, 0.75, 8, -0.75, 9, 0, 10, 0.1, 11, -0.2, 12, 0.3 ] );
var d = new Complex128Array( [ 1, 0, 1, 0, 1, 0 ] );
var sva = new Float64Array( [ 5.55, 13.34, 21.48 ] );
var V = new Complex128Array( 1 );
var work = new Complex128Array( 4 );

var info = zgsvj1( 'column-major', 'no-v', 4, 3, 1, A, 4, d, 1, sva, 1, 0, V, 1, EPS, SFMIN, TOL, 5, work, 1, 4 );
// returns <integer>
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **jobv**: one of `'compute-v'` (accumulate rotations into `V`), `'apply-v'` (post-multiply an `mv`-by-`N` `V`), or `'no-v'` (discard rotations).
-   **M**: number of rows.
-   **N**: number of columns.
-   **n1**: 2x2 block partition; the first `n1` columns are rotated against the remaining `N-n1` columns.
-   **A**: input matrix (`Complex128Array`).
-   **LDA**: leading dimension of `A`.
-   **d**: complex diagonal scale array (`Complex128Array`, length `N`).
-   **strideD**: stride length for `d`.
-   **sva**: real column-norm vector (`Float64Array`, length `N`).
-   **strideSVA**: stride length for `sva`.
-   **mv**: rows of `V` when `jobv === 'apply-v'`.
-   **V**: matrix used/updated when `jobv !== 'no-v'` (`Complex128Array`).
-   **LDV**: leading dimension of `V`.
-   **eps**: machine epsilon.
-   **sfmin**: safe minimum.
-   **tol**: convergence tolerance (must be `> eps`).
-   **nsweep**: number of sweeps.
-   **work**: workspace array (`Complex128Array`, length `>= M`).
-   **strideWORK**: stride length for `work`.
-   **lwork**: workspace length.

#### zgsvj1.ndarray( jobv, M, N, n1, A, strideA1, strideA2, offsetA, d, strideD, offsetD, sva, strideSVA, offsetSVA, mv, V, strideV1, strideV2, offsetV, eps, sfmin, tol, nsweep, work, strideWORK, offsetWORK, lwork )

Same as `zgsvj1` but with full `stride/offset` indexing semantics.

```javascript
var Complex128Array = require( '@stdlib/array/complex128' );
var Float64Array = require( '@stdlib/array/float64' );

var EPS = 2.220446049250313e-16;
var SFMIN = 2.2250738585072014e-308;
var TOL = 1.0e-10;

var A = new Complex128Array( [ 1, 0.5, 2, -0.5, 3, 1, 4, -1, 5, 0.25, 6, -0.25, 7, 0.75, 8, -0.75, 9, 0, 10, 0.1, 11, -0.2, 12, 0.3 ] );
var d = new Complex128Array( [ 1, 0, 1, 0, 1, 0 ] );
var sva = new Float64Array( [ 5.55, 13.34, 21.48 ] );
var V = new Complex128Array( 1 );
var work = new Complex128Array( 4 );

var info = zgsvj1.ndarray( 'no-v', 4, 3, 1, A, 1, 4, 0, d, 1, 0, sva, 1, 0, 0, V, 1, 1, 0, EPS, SFMIN, TOL, 5, work, 1, 0, 4 );
// returns <integer>
```

The function has the following additional parameters:

-   **strideA1**: stride of dimension 1 of `A` (in complex elements).
-   **strideA2**: stride of dimension 2 of `A` (in complex elements).
-   **offsetA**: starting index for `A` (in complex elements).
-   **offsetD**: starting index for `d` (in complex elements).
-   **offsetSVA**: starting index for `sva`.
-   **strideV1**: stride of dimension 1 of `V` (in complex elements).
-   **strideV2**: stride of dimension 2 of `V` (in complex elements).
-   **offsetV**: starting index for `V` (in complex elements).
-   **offsetWORK**: starting index for `work` (in complex elements).

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `zgsvj1` is the off-diagonal-block companion to [`zgsvj0`][@stdlib/lapack/base/zgsvj0]. It is invoked from `zgesvj` after `zgsvj0` has done the diagonal-block sweeps, to suppress the (1,2) off-diagonal coupling between the first `n1` columns and the remaining `N - n1` columns. There is no de Rijk pivoting, no `lkahead`, and no convergence test inside the q-loop — the routine just performs `nsweep` block-row-cyclic complex Jacobi sweeps over the off-diagonal tile grid.
-   The complex `D` array accumulates a sequence of unit-modulus phase factors applied as part of each rotation. `A * diag(D)` (before and after) represents the same scaled input matrix, with `A` reorthogonalised toward singular vectors.
-   `tol` must be strictly greater than `eps` (otherwise the routine returns the negative argument-error code `-21`).
-   `lwork` must be at least `M`.
-   Negative return values follow the Fortran reference convention: `-i` means the `i`-th argument had an illegal value.

</section>

<!-- /.notes -->

<section class="examples">

## Examples

```javascript
var Complex128Array = require( '@stdlib/array/complex128' );
var Float64Array = require( '@stdlib/array/float64' );
var zgsvj1 = require( '@stdlib/lapack/base/zgsvj1' );

var EPS = 2.220446049250313e-16;
var SFMIN = 2.2250738585072014e-308;
var TOL = 1.0e-10;

var A = new Complex128Array( [ 1, 0.5, 2, -0.5, 3, 1, 4, -1, 5, 0.25, 6, -0.25, 7, 0.75, 8, -0.75, 9, 0, 10, 0.1, 11, -0.2, 12, 0.3 ] );
var d = new Complex128Array( [ 1, 0, 1, 0, 1, 0 ] );
var sva = new Float64Array( [ 5.55, 13.34, 21.48 ] );
var V = new Complex128Array( 1 );
var work = new Complex128Array( 4 );

var info = zgsvj1( 'column-major', 'no-v', 4, 3, 1, A, 4, d, 1, sva, 1, 0, V, 1, EPS, SFMIN, TOL, 5, work, 1, 4 );
console.log( info );
```

</section>

<!-- /.examples -->

<!-- fortran-docs:start (generated by bin/fortran-docs.mjs from data/lapack-3.12.0/SRC/zgsvj1.f; do not edit) -->

<section class="fortran-docs">

## Reference notes

The mathematical description from the reference LAPACK 3.12.0 source of `ZGSVJ1`. Indices are the 1-based Fortran indices of the source.

### Purpose

ZGSVJ1 is called from ZGESVJ as a pre-processor and that is its main purpose. It applies Jacobi rotations in the same way as ZGESVJ does, but it targets only particular pivots and it does not check convergence (stopping criterion). Few tuning parameters (marked by \[TP\]) are available for the implementer.

Further Details ~~~~~~~~~~~~~~~ ZGSVJ1 applies few sweeps of Jacobi rotations in the column space of the input M-by-N matrix A. The pivot pairs are taken from the (1,2) off-diagonal block in the corresponding N-by-N Gram matrix A^$T \, A$. The block-entries (tiles) of the (1,2) off-diagonal block are marked by the \[x\]'s in the following scheme:

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
[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

[@stdlib/lapack/base/zgsvj0]: https://github.com/stdlib-js/stdlib

</section>

<!-- /.links -->
