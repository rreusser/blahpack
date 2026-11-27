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

# dlarrd

> Computes eigenvalues of a symmetric tridiagonal matrix to suitable accuracy

<section class="usage">

## Usage

```javascript
var dlarrd = require( '@stdlib/lapack/base/dlarrd' );
```

#### dlarrd( range, order, N, vl, vu, il, iu, GERS, strideGERS, reltol, d, strideD, e, strideE, E2, strideE2, pivmin, nsplit, ISPLIT, strideISPLIT, offsetISPLIT, M, w, strideW, WERR, strideWERR, wl, wu, IBLOCK, strideIBLOCK, offsetIBLOCK, INDEXW, strideINDEXW, offsetINDEXW, WORK, strideWORK, IWORK, strideIWORK, offsetIWORK )

Computes eigenvalues of a symmetric tridiagonal matrix to suitable accuracy

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Int32Array = require( '@stdlib/array/int32' );
var dlarrd = require( '@stdlib/lapack/base/dlarrd' );

var N = 4;
var d = new Float64Array( [ 2.0, -1.0, 3.0, 0.5 ] );
var e = new Float64Array( [ 1.0, 1.0, 1.0, 0.0 ] );
var E2 = new Float64Array( [ 1.0, 1.0, 1.0, 0.0 ] );
var GERS = new Float64Array( [ 1.0, 3.0, -3.0, 1.0, 1.0, 5.0, -0.5, 1.5 ] );
var ISPLIT = new Int32Array( [ N ] );
var w = new Float64Array( N );
var WERR = new Float64Array( N );
var IBLOCK = new Int32Array( N );
var INDEXW = new Int32Array( N );

dlarrd( 'all', 'entire', N, 0.0, 0.0, 0, 0, GERS, 1, 8.881784197001252e-16, d, 1, e, 1, E2, 1, 2.2250738585072014e-308, 1, ISPLIT, 1, w, 1, WERR, 1, IBLOCK, 1, INDEXW, 1 );
```

The function has the following parameters:

-   **range**: specifies the operation type.
-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **N**: number of columns.
-   **vl**: vl.
-   **vu**: vu.
-   **il**: il.
-   **iu**: iu.
-   **GERS**: input array.
-   **strideGERS**: stride length for `GERS`.
-   **reltol**: reltol.
-   **d**: input array.
-   **strideD**: stride length for `d`.
-   **e**: input array.
-   **strideE**: stride length for `e`.
-   **E2**: input array.
-   **strideE2**: stride length for `E2`.
-   **pivmin**: pivmin.
-   **nsplit**: nsplit.
-   **ISPLIT**: input array.
-   **strideISPLIT**: stride length for `ISPLIT`.
-   **offsetISPLIT**: starting index for `ISPLIT`.
-   **M**: number of rows.
-   **w**: input array.
-   **strideW**: stride length for `w`.
-   **WERR**: input array.
-   **strideWERR**: stride length for `WERR`.
-   **wl**: wl.
-   **wu**: wu.
-   **IBLOCK**: input array.
-   **strideIBLOCK**: stride length for `IBLOCK`.
-   **offsetIBLOCK**: starting index for `IBLOCK`.
-   **INDEXW**: input array.
-   **strideINDEXW**: stride length for `INDEXW`.
-   **offsetINDEXW**: starting index for `INDEXW`.
-   **WORK**: input array.
-   **strideWORK**: stride length for `WORK`.
-   **IWORK**: output array.
-   **strideIWORK**: stride length for `IWORK`.
-   **offsetIWORK**: starting index for `IWORK`.

#### dlarrd.ndarray( range, order, N, vl, vu, il, iu, GERS, strideGERS, offsetGERS, reltol, d, strideD, offsetD, e, strideE, offsetE, E2, strideE2, offsetE2, pivmin, nsplit, ISPLIT, strideISPLIT, offsetISPLIT, M, w, strideW, offsetW, WERR, strideWERR, offsetWERR, wl, wu, IBLOCK, strideIBLOCK, offsetIBLOCK, INDEXW, strideINDEXW, offsetINDEXW, WORK, strideWORK, offsetWORK, IWORK, strideIWORK, offsetIWORK )

Computes eigenvalues of a symmetric tridiagonal matrix to suitable accuracy, using alternative indexing semantics.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Int32Array = require( '@stdlib/array/int32' );
var dlarrd = require( '@stdlib/lapack/base/dlarrd' );

var N = 4;
var d = new Float64Array( [ 2.0, -1.0, 3.0, 0.5 ] );
var e = new Float64Array( [ 1.0, 1.0, 1.0, 0.0 ] );
var E2 = new Float64Array( [ 1.0, 1.0, 1.0, 0.0 ] );
var GERS = new Float64Array( [ 1.0, 3.0, -3.0, 1.0, 1.0, 5.0, -0.5, 1.5 ] );
var ISPLIT = new Int32Array( [ N ] );
var w = new Float64Array( N );
var WERR = new Float64Array( N );
var IBLOCK = new Int32Array( N );
var INDEXW = new Int32Array( N );

dlarrd( 'all', 'entire', N, 0.0, 0.0, 0, 0, GERS, 1, 8.881784197001252e-16, d, 1, e, 1, E2, 1, 2.2250738585072014e-308, 1, ISPLIT, 1, w, 1, WERR, 1, IBLOCK, 1, INDEXW, 1 );
```

The function has the following additional parameters:

-   **range**: specifies the operation type.
-   **order**: specifies the operation type.
-   **N**: number of columns.
-   **vl**: vl.
-   **vu**: vu.
-   **il**: il.
-   **iu**: iu.
-   **GERS**: input array.
-   **strideGERS**: stride length for `GERS`.
-   **offsetGERS**: starting index for `GERS`.
-   **reltol**: reltol.
-   **d**: input array.
-   **strideD**: stride length for `d`.
-   **offsetD**: starting index for `D`.
-   **e**: input array.
-   **strideE**: stride length for `e`.
-   **offsetE**: starting index for `E`.
-   **E2**: input array.
-   **strideE2**: stride of dimension 2 of `E`.
-   **offsetE2**: starting index for `E2`.
-   **pivmin**: pivmin.
-   **nsplit**: nsplit.
-   **ISPLIT**: input array.
-   **strideISPLIT**: stride length for `ISPLIT`.
-   **offsetISPLIT**: starting index for `ISPLIT`.
-   **M**: number of rows.
-   **w**: input array.
-   **strideW**: stride length for `w`.
-   **offsetW**: starting index for `W`.
-   **WERR**: input array.
-   **strideWERR**: stride length for `WERR`.
-   **offsetWERR**: starting index for `WERR`.
-   **wl**: wl.
-   **wu**: wu.
-   **IBLOCK**: input array.
-   **strideIBLOCK**: stride length for `IBLOCK`.
-   **offsetIBLOCK**: starting index for `IBLOCK`.
-   **INDEXW**: input array.
-   **strideINDEXW**: stride length for `INDEXW`.
-   **offsetINDEXW**: starting index for `INDEXW`.
-   **WORK**: input array.
-   **strideWORK**: stride length for `WORK`.
-   **offsetWORK**: starting index for `WORK`.
-   **IWORK**: output array.
-   **strideIWORK**: stride length for `IWORK`.
-   **offsetIWORK**: starting index for `IWORK`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   See LAPACK reference documentation for full algorithmic details.
</section>

<!-- /.notes -->

<section class="examples">

## Examples

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Int32Array = require( '@stdlib/array/int32' );
var dlarrd = require( '@stdlib/lapack/base/dlarrd' );

var N = 4;
var d = new Float64Array( [ 2.0, -1.0, 3.0, 0.5 ] );
var e = new Float64Array( [ 1.0, 1.0, 1.0, 0.0 ] );
var E2 = new Float64Array( [ 1.0, 1.0, 1.0, 0.0 ] );
var GERS = new Float64Array( [ 1.0, 3.0, -3.0, 1.0, 1.0, 5.0, -0.5, 1.5 ] );
var ISPLIT = new Int32Array( [ N ] );
var w = new Float64Array( N );
var WERR = new Float64Array( N );
var IBLOCK = new Int32Array( N );
var INDEXW = new Int32Array( N );

dlarrd( 'all', 'entire', N, 0.0, 0.0, 0, 0, GERS, 1, 8.881784197001252e-16, d, 1, e, 1, E2, 1, 2.2250738585072014e-308, 1, ISPLIT, 1, w, 1, WERR, 1, IBLOCK, 1, INDEXW, 1 );
```

</section>

<!-- /.examples -->

<!-- fortran-docs:start (generated by bin/fortran-docs.mjs from data/lapack-3.12.0/SRC/dlarrd.f; do not edit) -->

<section class="fortran-docs">

## Reference documentation

From the reference LAPACK 3.12.0 source of `DLARRD`, converted to Markdown with KaTeX math. Indices are the 1-based Fortran indices of the source.

> Computes the eigenvalues of a symmetric tridiagonal matrix to suitable accuracy.

### Purpose

DLARRD computes the eigenvalues of a symmetric tridiagonal matrix T to suitable accuracy. This is an auxiliary code to be called from DSTEMR. The user may ask for all eigenvalues, all eigenvalues in the half-open interval (`VL`, `VU`\], or the `IL`-th through `IU`-th eigenvalues.

To avoid overflow, the matrix must be scaled so that its largest element is no greater than overflow\*\*(1/2) \* underflow\*\*(1/4) in absolute value, and for greatest accuracy, it should not be much smaller than that.

See W. Kahan "Accurate Eigenvalues of a Symmetric Tridiagonal Matrix", Report CS41, Computer Science Dept., Stanford University, July 21, 1966.

### Arguments

#### RANGE `[in]`

_CHARACTER\*1_

-   `= 'A'`: ("All")   all eigenvalues will be found.
-   `= 'V'`: ("Value") all eigenvalues in the half-open interval (`VL`, `VU`\] will be found.
-   `= 'I'`: ("Index") the `IL`-th through `IU`-th eigenvalues (of the entire matrix) will be found.

#### ORDER `[in]`

_CHARACTER\*1_

-   `= 'B'`: ("By Block") the eigenvalues will be grouped by split-off block (see `IBLOCK`, `ISPLIT`) and ordered from smallest to largest within the block.
-   `= 'E'`: ("Entire matrix") the eigenvalues for the entire matrix will be ordered from smallest to largest.

#### N `[in]`

_INTEGER_

The order of the tridiagonal matrix T. $N \ge 0$.

#### VL `[in]`

_DOUBLE PRECISION_

If `RANGE='V'`, the lower bound of the interval to be searched for eigenvalues. Eigenvalues less than or equal to `VL`, or greater than `VU`, will not be returned. $\mathrm{VL} < \mathrm{VU}$. Not referenced if `RANGE = 'A'` or 'I'.

#### VU `[in]`

_DOUBLE PRECISION_

If `RANGE='V'`, the upper bound of the interval to be searched for eigenvalues. Eigenvalues less than or equal to `VL`, or greater than `VU`, will not be returned. $\mathrm{VL} < \mathrm{VU}$. Not referenced if `RANGE = 'A'` or 'I'.

#### IL `[in]`

_INTEGER_

If `RANGE='I'`, the index of the smallest eigenvalue to be returned. $1 \le \mathrm{IL} \le \mathrm{IU} \le N$, if $N > 0$; `IL = 1` and `IU = 0` if $N = 0$. Not referenced if `RANGE = 'A'` or 'V'.

#### IU `[in]`

_INTEGER_

If `RANGE='I'`, the index of the largest eigenvalue to be returned. $1 \le \mathrm{IL} \le \mathrm{IU} \le N$, if $N > 0$; `IL = 1` and `IU = 0` if $N = 0$. Not referenced if `RANGE = 'A'` or 'V'.

#### GERS `[in]`

_DOUBLE PRECISION array, dimension (2\*N)_

The N Gerschgorin intervals (the i-th Gerschgorin interval is (`GERS(2*i-1)`, `GERS(2*i)`).

#### RELTOL `[in]`

_DOUBLE PRECISION_

The minimum relative width of an interval. When an interval is narrower than `RELTOL` times the larger (in magnitude) endpoint, then it is considered to be sufficiently small, i.e., converged. Note: this should always be at least radix\*machine $\epsilon$.

#### D `[in]`

_DOUBLE PRECISION array, dimension (N)_

The n diagonal elements of the tridiagonal matrix T.

#### E `[in]`

_DOUBLE PRECISION array, dimension (N-1)_

The (n-1) off-diagonal elements of the tridiagonal matrix T.

#### E2 `[in]`

_DOUBLE PRECISION array, dimension (N-1)_

The (n-1) squared off-diagonal elements of the tridiagonal matrix T.

#### PIVMIN `[in]`

_DOUBLE PRECISION_

The minimum pivot allowed in the Sturm sequence for T.

#### NSPLIT `[in]`

_INTEGER_

The number of diagonal blocks in the matrix T. $1 \le \mathrm{NSPLIT} \le N$.

#### ISPLIT `[in]`

_INTEGER array, dimension (N)_

The splitting points, at which T breaks up into submatrices. The first submatrix consists of rows/columns 1 to `ISPLIT(1)`, the second of rows/columns `ISPLIT(1)`+1 through `ISPLIT(2)`, etc., and the `NSPLIT`-th consists of rows/columns `ISPLIT(NSPLIT-1)`+1 through `ISPLIT(NSPLIT)=N`. (Only the first `NSPLIT` elements will actually be used, but since the user cannot know a priori what value `NSPLIT` will have, N words must be reserved for `ISPLIT`.)

#### M `[out]`

_INTEGER_

The actual number of eigenvalues found. $0 \le M \le N$. (See also the description of `INFO=2`,3.)

#### W `[out]`

_DOUBLE PRECISION array, dimension (N)_

On exit, the first M elements of W will contain the eigenvalue approximations. DLARRD computes an interval I\_j = (a\_j, b\_j\] that includes eigenvalue j. The eigenvalue approximation is given as the interval midpoint `W(j)`= ( a\_j + b\_j)/2. The corresponding error is bounded by `WERR(j)` = abs( a\_j - b\_j)/2

#### WERR `[out]`

_DOUBLE PRECISION array, dimension (N)_

The error bound on the corresponding eigenvalue approximation in W.

#### WL `[out]`

_DOUBLE PRECISION_

#### WU `[out]`

_DOUBLE PRECISION_

The interval (`WL`, `WU`\] contains all the wanted eigenvalues. If `RANGE='V'`, then `WL=VL` and `WU=VU`. If `RANGE='A'`, then `WL` and `WU` are the global Gerschgorin bounds

on the spectrum.

If `RANGE='I'`, then `WL` and `WU` are computed by DLAEBZ from the

index range specified.

#### IBLOCK `[out]`

_INTEGER array, dimension (N)_

At each row/column j where `E(j)` is zero or small, the matrix T is considered to split into a block diagonal matrix. On exit, if `INFO = 0`, `IBLOCK(i)` specifies to which block (from 1 to the number of blocks) the eigenvalue `W(i)` belongs. (DLARRD may use the remaining N-M elements as workspace.)

#### INDEXW `[out]`

_INTEGER array, dimension (N)_

The indices of the eigenvalues within each block (submatrix); for example, `INDEXW(i)= j` and `IBLOCK(i)=k` imply that the i-th eigenvalue `W(i)` is the j-th eigenvalue in block k.

#### WORK `[out]`

_DOUBLE PRECISION array, dimension (4\*N)_

#### IWORK `[out]`

_INTEGER array, dimension (3\*N)_

#### INFO `[out]`

_INTEGER_

-   `= 0`: successful exit
-   `< 0`: if `INFO = -i`, the i-th argument had an illegal value
-   `> 0`: some or all of the eigenvalues failed to converge or were not computed: =1 or 3: Bisection failed to converge for some eigenvalues; these eigenvalues are flagged by a negative block number.  The effect is that the eigenvalues may not be as accurate as the absolute and relative tolerances.  This is generally caused by unexpectedly inaccurate arithmetic. =2 or 3: `RANGE='I'` only: Not all of the eigenvalues `IL`:`IU` were found. Effect: $M < \mathrm{IU}+1-\mathrm{IL}$ Cause:  non-monotonic arithmetic, causing the Sturm sequence to be non-monotonic. Cure:   recalculate, using `RANGE='A'`, and pick out eigenvalues `IL`:`IU`.  In some cases, increasing the PARAMETER "FUDGE" may make things work.
-   `= 4`: `RANGE='I'`, and the Gershgorin interval initially used was too small.  No eigenvalues were computed. Probable cause: your machine has sloppy floating-point arithmetic. Cure: Increase the PARAMETER "FUDGE", recompile, and try again.

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
