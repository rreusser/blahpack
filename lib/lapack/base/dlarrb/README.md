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

# dlarrb

> Provides limited bisection to locate eigenvalues for more accuracy

<section class="usage">

## Usage

```javascript
var dlarrb = require( '@stdlib/lapack/base/dlarrb' );
```

#### dlarrb( N, d, strideD, LLD, strideLLD, ifirst, ilast, rtol1, rtol2, offset, w, strideW, WGAP, strideWGAP, WERR, strideWERR, WORK, strideWORK, IWORK, strideIWORK, offsetIWORK, pivmin, spdiam, twist )

Provides limited bisection to locate eigenvalues for more accuracy

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Int32Array = require( '@stdlib/array/int32' );

var d = new Float64Array( [ 1.0, 3.0, 5.0, 7.0 ] );
var LLD = new Float64Array( [ 0.0, 0.0, 0.0, 0.0 ] );
var w = new Float64Array( [ 1.1, 2.9, 5.2, 6.8 ] );
var WERR = new Float64Array( [ 0.5, 0.5, 0.5, 0.5 ] );
var WGAP = new Float64Array( [ 1.5, 1.5, 1.5, 0.0 ] );
var WORK = new Float64Array( 8 );
var IWORK = new Int32Array( 8 );

dlarrb( 4, d, 1, LLD, 1, 1, 4, 1.0e-8, 1.0e-14, 0, w, 1, WGAP, 1, WERR, 1, WORK, 1, IWORK, 1, 0, 2.2e-308, 6.0, -1 );
// w => <Float64Array>[ ~1, ~3, ~5, ~7 ]
```

The function has the following parameters:

-   **N**: number of columns.
-   **d**: input array.
-   **strideD**: stride length for `d`.
-   **LLD**: input array.
-   **strideLLD**: stride length for `LLD`.
-   **ifirst**: ifirst.
-   **ilast**: ilast.
-   **rtol1**: rtol1.
-   **rtol2**: rtol2.
-   **offset**: offset.
-   **w**: input array.
-   **strideW**: stride length for `w`.
-   **WGAP**: input array.
-   **strideWGAP**: stride length for `WGAP`.
-   **WERR**: input array.
-   **strideWERR**: stride length for `WERR`.
-   **WORK**: input array.
-   **strideWORK**: stride length for `WORK`.
-   **IWORK**: output array.
-   **strideIWORK**: stride length for `IWORK`.
-   **offsetIWORK**: starting index for `IWORK`.
-   **pivmin**: pivmin.
-   **spdiam**: spdiam.
-   **twist**: twist.

#### dlarrb.ndarray( N, d, strideD, offsetD, LLD, strideLLD, offsetLLD, ifirst, ilast, rtol1, rtol2, offset, w, strideW, offsetW, WGAP, strideWGAP, offsetWGAP, WERR, strideWERR, offsetWERR, WORK, strideWORK, offsetWORK, IWORK, strideIWORK, offsetIWORK, pivmin, spdiam, twist )

Provides limited bisection to locate eigenvalues for more accuracy, using alternative indexing semantics.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Int32Array = require( '@stdlib/array/int32' );

var d = new Float64Array( [ 1.0, 3.0, 5.0, 7.0 ] );
var LLD = new Float64Array( [ 0.0, 0.0, 0.0, 0.0 ] );
var w = new Float64Array( [ 1.1, 2.9, 5.2, 6.8 ] );
var WERR = new Float64Array( [ 0.5, 0.5, 0.5, 0.5 ] );
var WGAP = new Float64Array( [ 1.5, 1.5, 1.5, 0.0 ] );
var WORK = new Float64Array( 8 );
var IWORK = new Int32Array( 8 );

dlarrb.ndarray( 4, d, 1, 0, LLD, 1, 0, 1, 4, 1.0e-8, 1.0e-14, 0, w, 1, 0, WGAP, 1, 0, WERR, 1, 0, WORK, 1, 0, IWORK, 1, 0, 2.2e-308, 6.0, -1 );
// w => <Float64Array>[ ~1, ~3, ~5, ~7 ]
```

The function has the following additional parameters:

-   **N**: number of columns.
-   **d**: input array.
-   **strideD**: stride length for `d`.
-   **offsetD**: starting index for `D`.
-   **LLD**: input array.
-   **strideLLD**: stride length for `LLD`.
-   **offsetLLD**: starting index for `LLD`.
-   **ifirst**: ifirst.
-   **ilast**: ilast.
-   **rtol1**: rtol1.
-   **rtol2**: rtol2.
-   **offset**: starting index for ``.
-   **w**: input array.
-   **strideW**: stride length for `w`.
-   **offsetW**: starting index for `W`.
-   **WGAP**: input array.
-   **strideWGAP**: stride length for `WGAP`.
-   **offsetWGAP**: starting index for `WGAP`.
-   **WERR**: input array.
-   **strideWERR**: stride length for `WERR`.
-   **offsetWERR**: starting index for `WERR`.
-   **WORK**: input array.
-   **strideWORK**: stride length for `WORK`.
-   **offsetWORK**: starting index for `WORK`.
-   **IWORK**: output array.
-   **strideIWORK**: stride length for `IWORK`.
-   **offsetIWORK**: starting index for `IWORK`.
-   **pivmin**: pivmin.
-   **spdiam**: spdiam.
-   **twist**: twist.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   The symmetric tridiagonal matrix `T` is represented by its factorization `T - sigma*I = L*D*L^T`, where `D` is stored in `d` and the off-diagonal terms `L(i)*L(i)*D(i)` are stored in `LLD`.
-   Given initial eigenvalue approximations in `w` with error bounds `WERR`, the routine refines eigenvalues `ifirst` through `ilast` using bisection driven by `dlaneg` Sturm counts.
-   `twist` selects a twist index for the factorization; values outside `[1, N]` default to `N`.
-   Returns `0` on success.

</section>

<!-- /.notes -->

<section class="examples">

## Examples

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Int32Array = require( '@stdlib/array/int32' );
var dlarrb = require( '@stdlib/lapack/base/dlarrb' );

var d = new Float64Array( [ 1.0, 3.0, 5.0, 7.0 ] );
var LLD = new Float64Array( [ 0.0, 0.0, 0.0, 0.0 ] );
var w = new Float64Array( [ 1.1, 2.9, 5.2, 6.8 ] );
var WERR = new Float64Array( [ 0.5, 0.5, 0.5, 0.5 ] );
var WGAP = new Float64Array( [ 1.5, 1.5, 1.5, 0.0 ] );
var WORK = new Float64Array( 8 );
var IWORK = new Int32Array( 8 );

dlarrb( 4, d, 1, LLD, 1, 1, 4, 1.0e-8, 1.0e-14, 0, w, 1, WGAP, 1, WERR, 1, WORK, 1, IWORK, 1, 0, 2.2e-308, 6.0, -1 );
console.log( w );
```

</section>

<!-- /.examples -->

<!-- fortran-docs:start (generated by bin/fortran-docs.mjs from data/lapack-3.12.0/SRC/dlarrb.f; do not edit) -->

<section class="fortran-docs">

## Reference documentation

From the reference LAPACK 3.12.0 source of `DLARRB`, converted to Markdown with KaTeX math. Indices are the 1-based Fortran indices of the source.

> Provides limited bisection to locate eigenvalues for more accuracy.

### Purpose

Given the relatively robust representation(RRR) L D L^T, DLARRB does "limited" bisection to refine the eigenvalues of L D L^T, W( `IFIRST`-`OFFSET` ) through W( `ILAST`-`OFFSET` ), to more accuracy. Initial guesses for these eigenvalues are input in W, the corresponding estimate of the error in these guesses and their gaps are input in `WERR` and `WGAP`, respectively. During bisection, intervals \[left, right\] are maintained by storing their mid-points and semi-widths in the arrays W and `WERR` respectively.

### Arguments

#### N `[in]`

_INTEGER_

The order of the matrix.

#### D `[in]`

_DOUBLE PRECISION array, dimension (N)_

The N diagonal elements of the diagonal matrix D.

#### LLD `[in]`

_DOUBLE PRECISION array, dimension (N-1)_

The (N-1) elements $L(i) \, L(i) \, D(i)$.

#### IFIRST `[in]`

_INTEGER_

The index of the first eigenvalue to be computed.

#### ILAST `[in]`

_INTEGER_

The index of the last eigenvalue to be computed.

#### RTOL1 `[in]`

_DOUBLE PRECISION_

#### RTOL2 `[in]`

_DOUBLE PRECISION_

Tolerance for the convergence of the bisection intervals. An interval \[LEFT,RIGHT\] has converged if $\mathrm{RIGHT}-\mathrm{LEFT} < \max ( \mathrm{RTOL1} \, \mathrm{GAP}, \mathrm{RTOL2} \, \max (|\mathrm{LEFT}|,|\mathrm{RIGHT}|) )$ where GAP is the (estimated) distance to the nearest eigenvalue.

#### OFFSET `[in]`

_INTEGER_

Offset for the arrays W, `WGAP` and `WERR`, i.e., the `IFIRST`-`OFFSET` through `ILAST`-`OFFSET` elements of these arrays are to be used.

#### W `[in,out]`

_DOUBLE PRECISION array, dimension (N)_

On input, W( `IFIRST`-`OFFSET` ) through W( `ILAST`-`OFFSET` ) are estimates of the eigenvalues of L D L^T indexed `IFIRST` through `ILAST`. On output, these estimates are refined.

#### WGAP `[in,out]`

_DOUBLE PRECISION array, dimension (N-1)_

On input, the (estimated) gaps between consecutive eigenvalues of L D L^T, i.e., `WGAP(I-OFFSET)` is the gap between eigenvalues I and I+1. Note that if `IFIRST = ILAST` then `WGAP(IFIRST-OFFSET)` must be set to ZERO. On output, these gaps are refined.

#### WERR `[in,out]`

_DOUBLE PRECISION array, dimension (N)_

On input, WERR( `IFIRST`-`OFFSET` ) through WERR( `ILAST`-`OFFSET` ) are the errors in the estimates of the corresponding elements in W. On output, these errors are refined.

#### WORK `[out]`

_DOUBLE PRECISION array, dimension (2\*N)_

Workspace.

#### IWORK `[out]`

_INTEGER array, dimension (2\*N)_

Workspace.

#### PIVMIN `[in]`

_DOUBLE PRECISION_

The minimum pivot in the Sturm sequence.

#### SPDIAM `[in]`

_DOUBLE PRECISION_

The spectral diameter of the matrix.

#### TWIST `[in]`

_INTEGER_

The twist index for the twisted factorization that is used for the negcount. `TWIST = N`: Compute negcount from L D L^T - LAMBDA $I = L+ D+ L$+^T `TWIST = 1`: Compute negcount from L D L^T - LAMBDA $I = U- D- U$-^T `TWIST = R`: Compute negcount from L D L^T - LAMBDA $I = N(r)$ `D(r)` `N(r)`

#### INFO `[out]`

_INTEGER_

Error flag.

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

</section>

<!-- /.links -->
