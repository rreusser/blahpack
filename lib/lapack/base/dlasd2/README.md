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

# dlasd2

> Merge two sets of singular values in bidiagonal SVD divide and conquer.

<section class="usage">

## Usage

```javascript
var dlasd2 = require( '@stdlib/lapack/base/dlasd2' );
```

#### dlasd2( order, NL, NR, SQRE, K, D, Z, ALPHA, BETA, U, LDU, VT, LDVT, DSIGMA, U2, LDU2, VT2, LDVT2, IDXP, IDX, IDXC, IDXQ, COLTYP )

Merge two sets of singular values in bidiagonal SVD divide and conquer.

```javascript
var dlasd2 = require( '@stdlib/lapack/base/dlasd2' );

var N = 3;
var U = discreteUniform( N * N, -10, 10, opts );
var VT = discreteUniform( N * N, -10, 10, opts );
var U2 = discreteUniform( N * N, -10, 10, opts );
var VT2 = discreteUniform( N * N, -10, 10, opts );
var d = discreteUniform( N, -10, 10, opts );
var z = discreteUniform( N, -10, 10, opts );
var DSIGMA = discreteUniform( N, -10, 10, opts );
var IDXP = discreteUniform( N, -10, 10, opts );
var IDX = discreteUniform( N, -10, 10, opts );
var IDXC = discreteUniform( N, -10, 10, opts );
var IDXQ = discreteUniform( N, -10, 10, opts );
var COLTYP = discreteUniform( N, -10, 10, opts );

dlasd2.ndarray( 1, 1, 1, N, d, 1, 0, z, 1, 0, 1.0, 1.0, U, N, 1, 0, VT, N, 1, 0, DSIGMA, 1, 0, U2, N, 1, 0, VT2, N, 1, 0, IDXP, 1, 0, IDX, 1, 0, IDXC, 1, 0, IDXQ, 1, 0, COLTYP, 1, 0 );
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **NL**: input array `NL`.
-   **NR**: input array `NR`.
-   **SQRE**: input array `SQRE`.
-   **K**: inner dimension.
-   **D**: input array `D`.
-   **Z**: input array `Z`.
-   **ALPHA**: input array `ALPHA`.
-   **BETA**: input array `BETA`.
-   **U**: input array `U`.
-   **LDU**: leading dimension of `U`.
-   **VT**: input array `VT`.
-   **LDVT**: leading dimension of `VT`.
-   **DSIGMA**: input array `DSIGMA`.
-   **U2**: input array `U2`.
-   **LDU2**: input array `LDU2`.
-   **VT2**: input array `VT2`.
-   **LDVT2**: input array `LDVT2`.
-   **IDXP**: input array `IDXP`.
-   **IDX**: input array `IDX`.
-   **IDXC**: input array `IDXC`.
-   **IDXQ**: input array `IDXQ`.
-   **COLTYP**: input array `COLTYP`.

#### dlasd2.ndarray( nl, nr, sqre, K, d, strideD, offsetD, z, strideZ, offsetZ, alpha, beta, U, strideU1, strideU2, offsetU, VT, strideVT1, strideVT2, offsetVT, DSIGMA, strideDSIGMA, offsetDSIGMA, U2, strideU21, strideU22, offsetU2, VT2, strideVT21, strideVT22, offsetVT2, IDXP, strideIDXP, offsetIDXP, IDX, strideIDX, offsetIDX, IDXC, strideIDXC, offsetIDXC, IDXQ, strideIDXQ, offsetIDXQ, COLTYP, strideCOLTYP, offsetCOLTYP )

Merge two sets of singular values in bidiagonal SVD divide and conquer, using alternative indexing semantics.

```javascript
var dlasd2 = require( '@stdlib/lapack/base/dlasd2' );

var N = 3;
var U = discreteUniform( N * N, -10, 10, opts );
var VT = discreteUniform( N * N, -10, 10, opts );
var U2 = discreteUniform( N * N, -10, 10, opts );
var VT2 = discreteUniform( N * N, -10, 10, opts );
var d = discreteUniform( N, -10, 10, opts );
var z = discreteUniform( N, -10, 10, opts );
var DSIGMA = discreteUniform( N, -10, 10, opts );
var IDXP = discreteUniform( N, -10, 10, opts );
var IDX = discreteUniform( N, -10, 10, opts );
var IDXC = discreteUniform( N, -10, 10, opts );
var IDXQ = discreteUniform( N, -10, 10, opts );
var COLTYP = discreteUniform( N, -10, 10, opts );

dlasd2.ndarray( 1, 1, 1, N, d, 1, 0, z, 1, 0, 1.0, 1.0, U, N, 1, 0, VT, N, 1, 0, DSIGMA, 1, 0, U2, N, 1, 0, VT2, N, 1, 0, IDXP, 1, 0, IDX, 1, 0, IDXC, 1, 0, IDXQ, 1, 0, COLTYP, 1, 0 );
```

The function has the following additional parameters:

-   **nl**: `nl`.
-   **nr**: `nr`.
-   **sqre**: `sqre`.
-   **d**: `d`.
-   **strideD**: stride length for `D`.
-   **offsetD**: starting index for `D`.
-   **z**: `z`.
-   **strideZ**: stride length for `Z`.
-   **offsetZ**: starting index for `Z`.
-   **alpha**: scalar constant.
-   **beta**: scalar constant.
-   **strideU1**: stride of dimension 1 of `U`.
-   **strideU2**: stride of dimension 2 of `U`.
-   **offsetU**: starting index for `U`.
-   **strideVT1**: stride of dimension 1 of `VT`.
-   **strideVT2**: stride of dimension 2 of `VT`.
-   **offsetVT**: starting index for `VT`.
-   **strideDSIGMA**: stride length for `DSIGMA`.
-   **offsetDSIGMA**: starting index for `DSIGMA`.
-   **strideU21**: stride of dimension 1 of `U2`.
-   **strideU22**: stride of dimension 2 of `U2`.
-   **offsetU2**: starting index for `U2`.
-   **strideVT21**: stride of dimension 1 of `VT2`.
-   **strideVT22**: stride of dimension 2 of `VT2`.
-   **offsetVT2**: starting index for `VT2`.
-   **strideIDXP**: stride length for `IDXP`.
-   **offsetIDXP**: starting index for `IDXP`.
-   **strideIDX**: stride length for `IDX`.
-   **offsetIDX**: starting index for `IDX`.
-   **strideIDXC**: stride length for `IDXC`.
-   **offsetIDXC**: starting index for `IDXC`.
-   **strideIDXQ**: stride length for `IDXQ`.
-   **offsetIDXQ**: starting index for `IDXQ`.
-   **strideCOLTYP**: stride length for `COLTYP`.
-   **offsetCOLTYP**: starting index for `COLTYP`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `dlasd2()` corresponds to the [LAPACK][lapack] level routine [`dlasd2`][lapack-dlasd2].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var dlasd2 = require( '@stdlib/lapack/base/dlasd2' );

var N = 3;
var U = discreteUniform( N * N, -10, 10, opts );
var VT = discreteUniform( N * N, -10, 10, opts );
var U2 = discreteUniform( N * N, -10, 10, opts );
var VT2 = discreteUniform( N * N, -10, 10, opts );
var d = discreteUniform( N, -10, 10, opts );
var z = discreteUniform( N, -10, 10, opts );
var DSIGMA = discreteUniform( N, -10, 10, opts );
var IDXP = discreteUniform( N, -10, 10, opts );
var IDX = discreteUniform( N, -10, 10, opts );
var IDXC = discreteUniform( N, -10, 10, opts );
var IDXQ = discreteUniform( N, -10, 10, opts );
var COLTYP = discreteUniform( N, -10, 10, opts );

dlasd2.ndarray( 1, 1, 1, N, d, 1, 0, z, 1, 0, 1.0, 1.0, U, N, 1, 0, VT, N, 1, 0, DSIGMA, 1, 0, U2, N, 1, 0, VT2, N, 1, 0, IDXP, 1, 0, IDX, 1, 0, IDXC, 1, 0, IDXQ, 1, 0, COLTYP, 1, 0 );
```

</section>

<!-- /.examples -->

<!-- fortran-docs:start (generated by bin/fortran-docs.mjs from data/lapack-3.12.0/SRC/dlasd2.f; do not edit) -->

<section class="fortran-docs">

## Reference notes

The mathematical description from the reference LAPACK 3.12.0 source of `DLASD2`. Indices are the 1-based Fortran indices of the source.

### Purpose

DLASD2 merges the two sets of singular values together into a single sorted set. Then it tries to deflate the size of the problem. There are two ways in which deflation can occur: when two or more singular values are close together or if there is a tiny entry in the Z vector. For each such occurrence the order of the related secular equation problem is reduced by one.

DLASD2 is called from DLASD1.

</section>

<!-- fortran-docs:end -->

<!-- Section for related `stdlib` packages. Do not manually edit this section, as it is automatically populated. -->

<section class="related">

</section>

<!-- /.related -->

<!-- Section for all links. Make sure to keep an empty line after the `section` element and another before the `/section` close. -->

<section class="links">

[lapack]: https://www.netlib.org/lapack/explore-html/

[lapack-dlasd2]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__dlasd2.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->