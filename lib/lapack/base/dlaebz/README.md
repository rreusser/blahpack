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

# dlaebz

> Computes the number of eigenvalues of a real symmetric tridiagonal matrix which are less than or equal to a given value, and performs other tasks required by the routine sstebz.

<section class="usage">

## Usage

```javascript
var dlaebz = require( '@stdlib/lapack/base/dlaebz' );
```

#### dlaebz( ijob, nitmax, N, mmax, minp, nbmin, abstol, reltol, pivmin, d, strideD, e, strideE, E2, strideE2, NVAL, strideNVAL, AB, LDAB, c, strideC, mout, NAB, LDNAB, WORK, strideWORK, IWORK, strideIWORK )

Computes the number of eigenvalues of a real symmetric tridiagonal matrix which are less than or equal to a given value, and performs other tasks required by the routine sstebz.

```javascript
var dlaebz = require( '@stdlib/lapack/base/dlaebz' );

var N = 3;
var e = discreteUniform( N * N, -10, 10, opts );
var AB = discreteUniform( N * N, -10, 10, opts );
var NAB = discreteUniform( N * N, -10, 10, opts );
var d = discreteUniform( N, -10, 10, opts );
var e = discreteUniform( N * N, -10, 10, opts );
var NVAL = discreteUniform( N, -10, 10, opts );
var c = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );
var IWORK = discreteUniform( N, -10, 10, opts );

dlaebz.ndarray( 1, 1, N, 1, 1, 1, 1.0, 1, 1.0, d, 1, 0, e, 1, 0, 1, 1, 0, NVAL, 1, 0, AB, N, 1, 0, c, 1, 0, 1, NAB, N, 1, 0, WORK, 1, 0, IWORK, 1, 0 );
```

The function has the following parameters:

-   **ijob**: `ijob`.
-   **nitmax**: `nitmax`.
-   **N**: number of columns.
-   **mmax**: `mmax`.
-   **minp**: `minp`.
-   **nbmin**: `nbmin`.
-   **abstol**: `abstol`.
-   **reltol**: `reltol`.
-   **pivmin**: `pivmin`.
-   **d**: `d`.
-   **strideD**: stride length for `D`.
-   **e**: `e`.
-   **strideE**: stride length for `E`.
-   **E2**: input array `E2`.
-   **strideE2**: stride of dimension 2 of `E`.
-   **NVAL**: input array `NVAL`.
-   **strideNVAL**: stride length for `NVAL`.
-   **AB**: input array `AB`.
-   **LDAB**: leading dimension of `AB`.
-   **c**: `c`.
-   **strideC**: stride length for `C`.
-   **mout**: `mout`.
-   **NAB**: input array `NAB`.
-   **LDNAB**: leading dimension of `NAB`.
-   **WORK**: input array `WORK`.
-   **strideWORK**: stride length for `WORK`.
-   **IWORK**: input array `IWORK`.
-   **strideIWORK**: stride length for `IWORK`.

#### dlaebz.ndarray( ijob, nitmax, N, mmax, minp, nbmin, abstol, reltol, pivmin, d, strideD, offsetD, e, strideE, offsetE, E2, strideE2, offsetE2, NVAL, strideNVAL, offsetNVAL, AB, strideAB1, strideAB2, offsetAB, c, strideC, offsetC, mout, NAB, strideNAB1, strideNAB2, offsetNAB, WORK, strideWORK, offsetWORK, IWORK, strideIWORK, offsetIWORK )

Computes the number of eigenvalues of a real symmetric tridiagonal matrix which are less than or equal to a given value, and performs other tasks required by the routine sstebz, using alternative indexing semantics.

```javascript
var dlaebz = require( '@stdlib/lapack/base/dlaebz' );

var N = 3;
var e = discreteUniform( N * N, -10, 10, opts );
var AB = discreteUniform( N * N, -10, 10, opts );
var NAB = discreteUniform( N * N, -10, 10, opts );
var d = discreteUniform( N, -10, 10, opts );
var e = discreteUniform( N * N, -10, 10, opts );
var NVAL = discreteUniform( N, -10, 10, opts );
var c = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );
var IWORK = discreteUniform( N, -10, 10, opts );

dlaebz.ndarray( 1, 1, N, 1, 1, 1, 1.0, 1, 1.0, d, 1, 0, e, 1, 0, 1, 1, 0, NVAL, 1, 0, AB, N, 1, 0, c, 1, 0, 1, NAB, N, 1, 0, WORK, 1, 0, IWORK, 1, 0 );
```

The function has the following additional parameters:

-   **offsetD**: starting index for `D`.
-   **offsetE**: starting index for `E`.
-   **offsetE2**: starting index for `E2`.
-   **offsetNVAL**: starting index for `NVAL`.
-   **strideAB1**: stride of dimension 1 of `AB`.
-   **strideAB2**: stride of dimension 2 of `AB`.
-   **offsetAB**: starting index for `AB`.
-   **offsetC**: starting index for `C`.
-   **strideNAB1**: stride of dimension 1 of `NAB`.
-   **strideNAB2**: stride of dimension 2 of `NAB`.
-   **offsetNAB**: starting index for `NAB`.
-   **offsetWORK**: starting index for `WORK`.
-   **offsetIWORK**: starting index for `IWORK`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `dlaebz()` corresponds to the [LAPACK][lapack] level routine [`dlaebz`][lapack-dlaebz].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var dlaebz = require( '@stdlib/lapack/base/dlaebz' );

var N = 3;
var e = discreteUniform( N * N, -10, 10, opts );
var AB = discreteUniform( N * N, -10, 10, opts );
var NAB = discreteUniform( N * N, -10, 10, opts );
var d = discreteUniform( N, -10, 10, opts );
var e = discreteUniform( N * N, -10, 10, opts );
var NVAL = discreteUniform( N, -10, 10, opts );
var c = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );
var IWORK = discreteUniform( N, -10, 10, opts );

dlaebz.ndarray( 1, 1, N, 1, 1, 1, 1.0, 1, 1.0, d, 1, 0, e, 1, 0, 1, 1, 0, NVAL, 1, 0, AB, N, 1, 0, c, 1, 0, 1, NAB, N, 1, 0, WORK, 1, 0, IWORK, 1, 0 );
```

</section>

<!-- /.examples -->

<!-- fortran-docs:start (generated by bin/fortran-docs.mjs from data/lapack-3.12.0/SRC/dlaebz.f; do not edit) -->

<section class="fortran-docs">

## Reference documentation

From the reference LAPACK 3.12.0 source of `DLAEBZ`, converted to Markdown with KaTeX math. Indices are the 1-based Fortran indices of the source.

> Computes the number of eigenvalues of a real symmetric tridiagonal matrix which are less than or equal to a given value, and performs other tasks required by the routine sstebz.

### Purpose

DLAEBZ contains the iteration loops which compute and use the function `N(w)`, which is the count of eigenvalues of a symmetric tridiagonal matrix T less than or equal to its argument w. It performs a choice of two types of loops:

`IJOB=1`, followed by `IJOB=2`: It takes as input a list of intervals and returns a list of

-   sufficiently small intervals whose union contains the same
-   eigenvalues as the union of the original intervals.
-   The input intervals are (`AB(j,1)`,`AB(j,2)`\], $j=1$,...,`MINP`.
-   The output interval (`AB(j,1)`,`AB(j,2)`\] will contain
-   eigenvalues `NAB(j,1)`+1,...,`NAB(j,2)`, where $1 \le j \le \mathrm{MOUT}$.

`IJOB=3`: It performs a binary search in each input interval

-   (`AB(j,1)`,`AB(j,2)`\] for a point w(j) such that
-   $N(w(j))=\mathrm{NVAL}(j)$, and uses `C(j)` as the starting point of
-   the search. If such a w(j) is found, then on output
-   `AB(j,1)=AB(j,2)=w`. If no such w(j) is found, then on output
-   (`AB(j,1)`,`AB(j,2)`\] will be a small interval containing the
-   point where `N(w)` jumps through `NVAL(j)`, unless that point
-   lies outside the initial interval.

Note that the intervals are in all cases half-open intervals, i.e., of the form (a,b\] , which includes b but not a .

To avoid underflow, the matrix should be scaled so that its largest element is no greater than overflow\*\*(1/2) \* underflow\*\*(1/4) in absolute value. To assure the most accurate computation of small eigenvalues, the matrix should be scaled to be not much smaller than that, either.

See W. Kahan "Accurate Eigenvalues of a Symmetric Tridiagonal Matrix", Report CS41, Computer Science Dept., Stanford University, July 21, 1966

Note: the arguments are, in general, \*not\* checked for unreasonable values.

### Arguments

#### IJOB `[in]`

_INTEGER_

Specifies what is to be done:

-   `= 1`: Compute `NAB` for the initial intervals.
-   `= 2`: Perform bisection iteration to find eigenvalues of T.
-   `= 3`: Perform bisection iteration to invert `N(w)`, i.e., to find a point which has a specified number of eigenvalues of T to its left. Other values will cause DLAEBZ to return with `INFO=-1`.

#### NITMAX `[in]`

_INTEGER_

The maximum number of "levels" of bisection to be performed, i.e., an interval of width W will not be made smaller than 2^$(-\mathrm{NITMAX}) \, W$. If not all intervals have converged after `NITMAX` iterations, then `INFO` is set to the number of non-converged intervals.

#### N `[in]`

_INTEGER_

The dimension n of the tridiagonal matrix T. It must be at least 1.

#### MMAX `[in]`

_INTEGER_

The maximum number of intervals. If more than `MMAX` intervals are generated, then DLAEBZ will quit with $\mathrm{INFO}=\mathrm{MMAX}+1$.

#### MINP `[in]`

_INTEGER_

The initial number of intervals. It may not be greater than `MMAX`.

#### NBMIN `[in]`

_INTEGER_

The smallest number of intervals that should be processed using a vector loop. If zero, then only the scalar loop will be used.

#### ABSTOL `[in]`

_DOUBLE PRECISION_

The minimum (absolute) width of an interval. When an interval is narrower than `ABSTOL`, or than `RELTOL` times the larger (in magnitude) endpoint, then it is considered to be sufficiently small, i.e., converged. This must be at least zero.

#### RELTOL `[in]`

_DOUBLE PRECISION_

The minimum relative width of an interval. When an interval is narrower than `ABSTOL`, or than `RELTOL` times the larger (in magnitude) endpoint, then it is considered to be sufficiently small, i.e., converged. Note: this should always be at least radix\*machine $\epsilon$.

#### PIVMIN `[in]`

_DOUBLE PRECISION_

The minimum absolute value of a "pivot" in the Sturm sequence loop. This must be at least max \|$e(j)^2$\|\*safe\_min and at least safe\_min, where safe\_min is at least the smallest number that can divide one without overflow.

#### D `[in]`

_DOUBLE PRECISION array, dimension (N)_

The diagonal elements of the tridiagonal matrix T.

#### E `[in]`

_DOUBLE PRECISION array, dimension (N)_

The offdiagonal elements of the tridiagonal matrix T in positions 1 through N-1. `E(N)` is arbitrary.

#### E2 `[in]`

_DOUBLE PRECISION array, dimension (N)_

The squares of the offdiagonal elements of the tridiagonal matrix T. `E2(N)` is ignored.

#### NVAL `[in,out]`

_INTEGER array, dimension (MINP)_

If `IJOB=1` or 2, not referenced. If `IJOB=3`, the desired values of `N(w)`. The elements of `NVAL` will be reordered to correspond with the intervals in `AB`. Thus, `NVAL(j)` on output will not, in general be the same as `NVAL(j)` on input, but it will correspond with the interval (`AB(j,1)`,`AB(j,2)`\] on output.

#### AB `[in,out]`

_DOUBLE PRECISION array, dimension (MMAX,2)_

The endpoints of the intervals. `AB(j,1)` is a(j), the left endpoint of the j-th interval, and `AB(j,2)` is b(j), the right endpoint of the j-th interval. The input intervals will, in general, be modified, split, and reordered by the calculation.

#### C `[in,out]`

_DOUBLE PRECISION array, dimension (MMAX)_

If `IJOB=1`, ignored. If `IJOB=2`, workspace. If `IJOB=3`, then on input `C(j)` should be initialized to the first search point in the binary search.

#### MOUT `[out]`

_INTEGER_

If `IJOB=1`, the number of eigenvalues in the intervals. If `IJOB=2` or 3, the number of intervals output. If `IJOB=3`, `MOUT` will equal `MINP`.

#### NAB `[in,out]`

_INTEGER array, dimension (MMAX,2)_

If `IJOB=1`, then on output `NAB(i,j)` will be set to `N(AB(i,j))`. If `IJOB=2`, then on input, `NAB(i,j)` should be set. It must

-   satisfy the condition:
-   $N(\mathrm{AB}(i,1)) \le \mathrm{NAB}(i,1) \le \mathrm{NAB}(i,2) \le N(\mathrm{AB}(i,2))$,
-   which means that in interval i only eigenvalues
-   `NAB(i,1)`+1,...,`NAB(i,2)` will be considered. Usually,
-   `NAB(i,j)=N(AB(i,j))`, from a previous call to DLAEBZ with
-   `IJOB=1`.
-   On output, `NAB(i,j)` will contain
-   max(na(k),min(nb(k),`N(AB(i,j))`)), where k is the index of
-   the input interval that the output interval
-   (`AB(j,1)`,`AB(j,2)`\] came from, and na(k) and nb(k) are the
-   the input values of `NAB(k,1)` and `NAB(k,2)`.

If `IJOB=3`, then on output, `NAB(i,j)` contains `N(AB(i,j))`,

-   unless $N(w) > \mathrm{NVAL}(i)$ for all search points w , in which
-   case `NAB(i,1)` will not be modified, i.e., the output
-   value will be the same as the input value (modulo
-   reorderings -- see `NVAL` and `AB`), or unless $N(w) < \mathrm{NVAL}(i)$
-   for all search points w , in which case `NAB(i,2)` will
-   not be modified. Normally, `NAB` should be set to some
-   distinctive value(s) before DLAEBZ is called.

#### WORK `[out]`

_DOUBLE PRECISION array, dimension (MMAX)_

Workspace.

#### IWORK `[out]`

_INTEGER array, dimension (MMAX)_

Workspace.

#### INFO `[out]`

_INTEGER_

-   `= 0`: All intervals converged. = 1--`MMAX`: The last `INFO` intervals did not converge. = `MMAX`+1:  More than `MMAX` intervals were generated.

### Further Details

This routine is intended to be called only by other LAPACK routines, thus the interface is less user-friendly. It is intended for two purposes:

(a) finding eigenvalues. In this case, DLAEBZ should have one or

-   more initial intervals set up in `AB`, and DLAEBZ should be called
-   with `IJOB=1`. This sets up `NAB`, and also counts the eigenvalues.
-   Intervals with no eigenvalues would usually be thrown out at
-   this point. Also, if not all the eigenvalues in an interval i
-   are desired, `NAB(i,1)` can be increased or `NAB(i,2)` decreased.
-   For example, set $\mathrm{NAB}(i,1)=\mathrm{NAB}(i,2)-1$ to get the largest
-   eigenvalue. DLAEBZ is then called with `IJOB=2` and `MMAX`
-   no smaller than the value of `MOUT` returned by the call with
-   `IJOB=1`. After this (`IJOB`=2) call, eigenvalues `NAB(i,1)`+1
-   through `NAB(i,2)` are approximately `AB(i,1)` (or `AB(i,2)`) to the
-   tolerance specified by `ABSTOL` and `RELTOL`.

(b) finding an interval (a',b'\] containing eigenvalues w(f),...,w(l).

-   In this case, start with a Gershgorin interval (a,b). Set up
-   `AB` to contain 2 search intervals, both initially (a,b). One
-   `NVAL` element should contain f-1 and the other should contain l
-   , while C should contain a and b, resp. `NAB(i,1)` should be -1
-   and `NAB(i,2)` should be N+1, to flag an error if the desired
-   interval does not lie in (a,b). DLAEBZ is then called with
-   `IJOB=3`. On exit, if $w(f-1) < w(f)$, then one of the intervals --
-   j -- will have `AB(j,1)=AB(j,2)` and $\mathrm{NAB}(j,1)=\mathrm{NAB}(j,2)=f-1$, while
-   if, to the specified tolerance, w(f-k)=...=w(f+r), $k > 0$ and r
-   \>= 0, then the interval will have $N(\mathrm{AB}(j,1))=\mathrm{NAB}(j,1)=f-k$ and
-   $N(\mathrm{AB}(j,2))=\mathrm{NAB}(j,2)=f+r$. The cases $w(l) < w(l+1)$ and
-   w(l-r)=...=w(l+k) are handled similarly.

</section>

<!-- fortran-docs:end -->

<!-- Section for related `stdlib` packages. Do not manually edit this section, as it is automatically populated. -->

<section class="related">

</section>

<!-- /.related -->

<!-- Section for all links. Make sure to keep an empty line after the `section` element and another before the `/section` close. -->

<section class="links">

[lapack]: https://www.netlib.org/lapack/explore-html/

[lapack-dlaebz]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__dlaebz.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->