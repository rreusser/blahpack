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

## Reference documentation

From the reference LAPACK 3.12.0 source of `DGSVJ1`, converted to Markdown with KaTeX math. Indices are the 1-based Fortran indices of the source.

> Pre-processor for the routine dgesvj, applies Jacobi rotations targeting only particular pivots.

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

### Arguments

#### JOBV `[in]`

_CHARACTER\*1_

Specifies whether the output from this procedure is used to compute the matrix V:

-   `= 'V'`: the product of the Jacobi rotations is accumulated by postmultiplying the N-by-N array V. (See the description of V.)
-   `= 'A'`: the product of the Jacobi rotations is accumulated by postmultiplying the `MV`-by-N array V. (See the descriptions of `MV` and V.)
-   `= 'N'`: the Jacobi rotations are not accumulated.

#### M `[in]`

_INTEGER_

The number of rows of the input matrix A. $M \ge 0$.

#### N `[in]`

_INTEGER_

The number of columns of the input matrix A. $M \ge N \ge 0$.

#### N1 `[in]`

_INTEGER_

`N1` specifies the 2 x 2 block partition, the first `N1` columns are rotated 'against' the remaining N-`N1` columns of A.

#### A `[in,out]`

_DOUBLE PRECISION array, dimension (LDA,N)_

On entry, M-by-N matrix A, such that $A \, \operatorname{diag}(D)$ represents the input matrix. On exit, A\_onexit \* D\_onexit represents the input matrix $A \, \operatorname{diag}(D)$ post-multiplied by a sequence of Jacobi rotations, where the rotation threshold and the total number of sweeps are given in `TOL` and `NSWEEP`, respectively. (See the descriptions of `N1`, D, `TOL` and `NSWEEP`.)

#### LDA `[in]`

_INTEGER_

The leading dimension of the array A. $\mathrm{LDA} \ge \max (1,M)$.

#### D `[in,out]`

_DOUBLE PRECISION array, dimension (N)_

The array D accumulates the scaling factors from the fast scaled Jacobi rotations. On entry, $A \, \operatorname{diag}(D)$ represents the input matrix. On exit, A\_onexit\*diag(D\_onexit) represents the input matrix post-multiplied by a sequence of Jacobi rotations, where the rotation threshold and the total number of sweeps are given in `TOL` and `NSWEEP`, respectively. (See the descriptions of `N1`, A, `TOL` and `NSWEEP`.)

#### SVA `[in,out]`

_DOUBLE PRECISION array, dimension (N)_

On entry, `SVA` contains the Euclidean norms of the columns of the matrix $A \, \operatorname{diag}(D)$. On exit, `SVA` contains the Euclidean norms of the columns of the matrix onexit\*diag(D\_onexit).

#### MV `[in]`

_INTEGER_

If `JOBV = 'A'`, then `MV` rows of V are post-multiplied by a

sequence of Jacobi rotations.

If `JOBV = 'N'`, then `MV` is not referenced.

#### V `[in,out]`

_DOUBLE PRECISION array, dimension (LDV,N)_

If `JOBV = 'V'`, then N rows of V are post-multiplied by a

sequence of Jacobi rotations.

If `JOBV = 'A'`, then `MV` rows of V are post-multiplied by a

sequence of Jacobi rotations.

If `JOBV = 'N'`, then V is not referenced.

#### LDV `[in]`

_INTEGER_

The leading dimension of the array V, $\mathrm{LDV} \ge 1$. If `JOBV = 'V'`, $\mathrm{LDV} \ge N$. If `JOBV = 'A'`, $\mathrm{LDV} \ge \mathrm{MV}$.

#### EPS `[in]`

_DOUBLE PRECISION_

`EPS = DLAMCH('Epsilon')`

#### SFMIN `[in]`

_DOUBLE PRECISION_

`SFMIN` = DLAMCH('Safe Minimum')

#### TOL `[in]`

_DOUBLE PRECISION_

`TOL` is the threshold for Jacobi rotations. For a pair `A(:,p)`, `A(:,q)` of pivot columns, the Jacobi rotation is applied only if DABS(COS(angle(`A(:,p)`,`A(:,q)`))) \> `TOL`.

#### NSWEEP `[in]`

_INTEGER_

`NSWEEP` is the number of sweeps of Jacobi rotations to be performed.

#### WORK `[out]`

_DOUBLE PRECISION array, dimension (LWORK)_

#### LWORK `[in]`

_INTEGER_

`LWORK` is the dimension of `WORK`. $\mathrm{LWORK} \ge M$.

#### INFO `[out]`

_INTEGER_

-   `= 0`: successful exit.
-   `< 0`: if `INFO = -i`, then the i-th argument had an illegal value

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
