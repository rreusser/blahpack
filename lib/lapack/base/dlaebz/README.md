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