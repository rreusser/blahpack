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

# dlaed2

> Merges the two sets of eigenvalues together into a single sorted set, then tries to deflate the size of the problem.

<section class="usage">

## Usage

```javascript
var dlaed2 = require( '@stdlib/lapack/base/dlaed2' );
```

#### dlaed2( N, n1, d, Q, LDQ, INDXQ, rho, z, DLAMBDA, w, Q2, INDX, INDXC, INDXP, COLTYP )

Merges the two sets of eigenvalues together into a single sorted set, then tries to deflate the size of the problem.

```javascript
var dlaed2 = require( '@stdlib/lapack/base/dlaed2' );

var N = 3;
var Q = discreteUniform( N * N, -10, 10, opts );
var Q2 = discreteUniform( N * N, -10, 10, opts );
var d = discreteUniform( N, -10, 10, opts );
var INDXQ = discreteUniform( N, -10, 10, opts );
var z = discreteUniform( N, -10, 10, opts );
var DLAMBDA = discreteUniform( N, -10, 10, opts );
var w = discreteUniform( N, -10, 10, opts );
var INDX = discreteUniform( N, -10, 10, opts );
var INDXC = discreteUniform( N, -10, 10, opts );
var INDXP = discreteUniform( N, -10, 10, opts );
var COLTYP = discreteUniform( N, -10, 10, opts );

dlaed2.ndarray( N, 1, d, 1, 0, Q, N, 1, 0, INDXQ, 1, 0, 1.0, z, 1, 0, DLAMBDA, 1, 0, w, 1, 0, Q2, N, 0, INDX, 1, 0, INDXC, 1, 0, INDXP, 1, 0, COLTYP, 1, 0 );
```

The function has the following parameters:

-   **N**: number of columns.
-   **n1**: `n1`.
-   **d**: `d`.
-   **Q**: input array `Q`.
-   **LDQ**: leading dimension of `Q`.
-   **INDXQ**: input array `INDXQ`.
-   **rho**: `rho`.
-   **z**: `z`.
-   **DLAMBDA**: input array `DLAMBDA`.
-   **w**: `w`.
-   **Q2**: input array `Q2`.
-   **INDX**: input array `INDX`.
-   **INDXC**: input array `INDXC`.
-   **INDXP**: input array `INDXP`.
-   **COLTYP**: input array `COLTYP`.

#### dlaed2.ndarray( k, N, n1, d, strideD, offsetD, Q, strideQ1, strideQ2, offsetQ, INDXQ, strideINDXQ, offsetINDXQ, rho, z, strideZ, offsetZ, DLAMBDA, strideDLAMBDA, offsetDLAMBDA, w, strideW, offsetW, Q2, strideQ21, offsetQ2, INDX, strideINDX, offsetINDX, INDXC, strideINDXC, offsetINDXC, INDXP, strideINDXP, offsetINDXP, COLTYP, strideCOLTYP, offsetCOLTYP )

Merges the two sets of eigenvalues together into a single sorted set, then tries to deflate the size of the problem, using alternative indexing semantics.

```javascript
var dlaed2 = require( '@stdlib/lapack/base/dlaed2' );

var N = 3;
var Q = discreteUniform( N * N, -10, 10, opts );
var Q2 = discreteUniform( N * N, -10, 10, opts );
var d = discreteUniform( N, -10, 10, opts );
var INDXQ = discreteUniform( N, -10, 10, opts );
var z = discreteUniform( N, -10, 10, opts );
var DLAMBDA = discreteUniform( N, -10, 10, opts );
var w = discreteUniform( N, -10, 10, opts );
var INDX = discreteUniform( N, -10, 10, opts );
var INDXC = discreteUniform( N, -10, 10, opts );
var INDXP = discreteUniform( N, -10, 10, opts );
var COLTYP = discreteUniform( N, -10, 10, opts );

dlaed2.ndarray( N, 1, d, 1, 0, Q, N, 1, 0, INDXQ, 1, 0, 1.0, z, 1, 0, DLAMBDA, 1, 0, w, 1, 0, Q2, N, 0, INDX, 1, 0, INDXC, 1, 0, INDXP, 1, 0, COLTYP, 1, 0 );
```

The function has the following additional parameters:

-   **strideD**: stride length for `D`.
-   **offsetD**: starting index for `D`.
-   **strideQ1**: stride of dimension 1 of `Q`.
-   **strideQ2**: stride of dimension 2 of `Q`.
-   **offsetQ**: starting index for `Q`.
-   **strideINDXQ**: stride length for `INDXQ`.
-   **offsetINDXQ**: starting index for `INDXQ`.
-   **strideZ**: stride length for `Z`.
-   **offsetZ**: starting index for `Z`.
-   **strideDLAMBDA**: stride length for `DLAMBDA`.
-   **offsetDLAMBDA**: starting index for `DLAMBDA`.
-   **strideW**: stride length for `W`.
-   **offsetW**: starting index for `W`.
-   **strideQ21**: stride of dimension 1 of `Q2`.
-   **offsetQ2**: starting index for `Q2`.
-   **strideINDX**: stride length for `INDX`.
-   **offsetINDX**: starting index for `INDX`.
-   **strideINDXC**: stride length for `INDXC`.
-   **offsetINDXC**: starting index for `INDXC`.
-   **strideINDXP**: stride length for `INDXP`.
-   **offsetINDXP**: starting index for `INDXP`.
-   **strideCOLTYP**: stride length for `COLTYP`.
-   **offsetCOLTYP**: starting index for `COLTYP`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `dlaed2()` corresponds to the [LAPACK][lapack] level routine [`dlaed2`][lapack-dlaed2].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var dlaed2 = require( '@stdlib/lapack/base/dlaed2' );

var N = 3;
var Q = discreteUniform( N * N, -10, 10, opts );
var Q2 = discreteUniform( N * N, -10, 10, opts );
var d = discreteUniform( N, -10, 10, opts );
var INDXQ = discreteUniform( N, -10, 10, opts );
var z = discreteUniform( N, -10, 10, opts );
var DLAMBDA = discreteUniform( N, -10, 10, opts );
var w = discreteUniform( N, -10, 10, opts );
var INDX = discreteUniform( N, -10, 10, opts );
var INDXC = discreteUniform( N, -10, 10, opts );
var INDXP = discreteUniform( N, -10, 10, opts );
var COLTYP = discreteUniform( N, -10, 10, opts );

dlaed2.ndarray( N, 1, d, 1, 0, Q, N, 1, 0, INDXQ, 1, 0, 1.0, z, 1, 0, DLAMBDA, 1, 0, w, 1, 0, Q2, N, 0, INDX, 1, 0, INDXC, 1, 0, INDXP, 1, 0, COLTYP, 1, 0 );
```

</section>

<!-- /.examples -->

<!-- fortran-docs:start (generated by bin/fortran-docs.mjs from data/lapack-3.12.0/SRC/dlaed2.f; do not edit) -->

<section class="fortran-docs">

## Reference notes

The mathematical description from the reference LAPACK 3.12.0 source of `DLAED2`. Indices are the 1-based Fortran indices of the source.

### Purpose

DLAED2 merges the two sets of eigenvalues together into a single sorted set. Then it tries to deflate the size of the problem. There are two ways in which deflation can occur: when two or more eigenvalues are close together or if there is a tiny entry in the Z vector. For each such occurrence the order of the related secular equation problem is reduced by one.

</section>

<!-- fortran-docs:end -->

<!-- Section for related `stdlib` packages. Do not manually edit this section, as it is automatically populated. -->

<section class="related">

</section>

<!-- /.related -->

<!-- Section for all links. Make sure to keep an empty line after the `section` element and another before the `/section` close. -->

<section class="links">

[lapack]: https://www.netlib.org/lapack/explore-html/

[lapack-dlaed2]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__dlaed2.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->