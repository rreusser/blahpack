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

## Reference notes

The mathematical description from the reference LAPACK 3.12.0 source of `DLAEBZ`. Indices are the 1-based Fortran indices of the source.

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