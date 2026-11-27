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

# dlasd7

> @license Apache-2.0.

<section class="usage">

## Usage

```javascript
var dlasd7 = require( '@stdlib/lapack/base/dlasd7' );
```

#### dlasd7( order, icompq, nl, nr, sqre, k, d, strideD, z, strideZ, ZW, strideZW, VF, strideVF, VFW, strideVFW, VL, strideVL, VLW, strideVLW, alpha, beta, DSIGMA, strideDSIGMA, IDX, strideIDX, IDXP, strideIDXP, IDXQ, strideIDXQ, PERM, stridePERM, givptr, GIVCOL, LDGIVCOL, GIVNUM, LDGIVNUM, c, s )

@license Apache-2.0.

```javascript
var dlasd7 = require( '@stdlib/lapack/base/dlasd7' );

var N = 3;
var GIVCOL = discreteUniform( N * N, -10, 10, opts );
var GIVNUM = discreteUniform( N * N, -10, 10, opts );
var d = discreteUniform( N, -10, 10, opts );
var z = discreteUniform( N, -10, 10, opts );
var ZW = discreteUniform( N, -10, 10, opts );
var VF = discreteUniform( N, -10, 10, opts );
var VFW = discreteUniform( N, -10, 10, opts );
var VL = discreteUniform( N, -10, 10, opts );
var VLW = discreteUniform( N, -10, 10, opts );
var DSIGMA = discreteUniform( N, -10, 10, opts );
var IDX = discreteUniform( N, -10, 10, opts );
var IDXP = discreteUniform( N, -10, 10, opts );
var IDXQ = discreteUniform( N, -10, 10, opts );
var PERM = discreteUniform( N, -10, 10, opts );

dlasd7.ndarray( 1, 1, 1, 1, d, 1, 0, z, 1, 0, ZW, 1, 0, VF, 1, 0, VFW, 1, 0, VL, 1, 0, VLW, 1, 0, 1.0, 1.0, DSIGMA, 1, 0, IDX, 1, 0, IDXP, 1, 0, IDXQ, 1, 0, PERM, 1, 0, GIVCOL, N, 1, 0, GIVNUM, N, 1, 0 );
```

The function has the following parameters:

-   **order**: storage layout of `GIVCOL` and `GIVNUM` (`'row-major'` or `'column-major'`).
-   **icompq**: `icompq`.
-   **nl**: `nl`.
-   **nr**: `nr`.
-   **sqre**: `sqre`.
-   **d**: `d`.
-   **strideD**: stride length for `d`.
-   **z**: `z`.
-   **strideZ**: stride length for `z`.
-   **ZW**: input array `ZW`.
-   **strideZW**: stride length for `ZW`.
-   **VF**: input array `VF`.
-   **strideVF**: stride length for `VF`.
-   **VFW**: input array `VFW`.
-   **strideVFW**: stride length for `VFW`.
-   **VL**: input array `VL`.
-   **strideVL**: stride length for `VL`.
-   **VLW**: input array `VLW`.
-   **strideVLW**: stride length for `VLW`.
-   **alpha**: scalar constant.
-   **beta**: scalar constant.
-   **DSIGMA**: input array `DSIGMA`.
-   **strideDSIGMA**: stride length for `DSIGMA`.
-   **IDX**: input array `IDX`.
-   **strideIDX**: stride length for `IDX`.
-   **IDXP**: input array `IDXP`.
-   **strideIDXP**: stride length for `IDXP`.
-   **IDXQ**: input array `IDXQ`.
-   **strideIDXQ**: stride length for `IDXQ`.
-   **PERM**: input array `PERM`.
-   **stridePERM**: stride length for `PERM`.
-   **GIVCOL**: input array `GIVCOL`.
-   **LDGIVCOL**: leading dimension of `GIVCOL`.
-   **GIVNUM**: input array `GIVNUM`.
-   **LDGIVNUM**: leading dimension of `GIVNUM`.

#### dlasd7.ndarray( icompq, nl, nr, sqre, k, d, strideD, offsetD, z, strideZ, offsetZ, ZW, strideZW, offsetZW, VF, strideVF, offsetVF, VFW, strideVFW, offsetVFW, VL, strideVL, offsetVL, VLW, strideVLW, offsetVLW, alpha, beta, DSIGMA, strideDSIGMA, offsetDSIGMA, IDX, strideIDX, offsetIDX, IDXP, strideIDXP, offsetIDXP, IDXQ, strideIDXQ, offsetIDXQ, PERM, stridePERM, offsetPERM, givptr, GIVCOL, strideGIVCOL1, strideGIVCOL2, offsetGIVCOL, GIVNUM, strideGIVNUM1, strideGIVNUM2, offsetGIVNUM, c, s )

@license Apache-2.0, using alternative indexing semantics.

```javascript
var dlasd7 = require( '@stdlib/lapack/base/dlasd7' );

var N = 3;
var GIVCOL = discreteUniform( N * N, -10, 10, opts );
var GIVNUM = discreteUniform( N * N, -10, 10, opts );
var d = discreteUniform( N, -10, 10, opts );
var z = discreteUniform( N, -10, 10, opts );
var ZW = discreteUniform( N, -10, 10, opts );
var VF = discreteUniform( N, -10, 10, opts );
var VFW = discreteUniform( N, -10, 10, opts );
var VL = discreteUniform( N, -10, 10, opts );
var VLW = discreteUniform( N, -10, 10, opts );
var DSIGMA = discreteUniform( N, -10, 10, opts );
var IDX = discreteUniform( N, -10, 10, opts );
var IDXP = discreteUniform( N, -10, 10, opts );
var IDXQ = discreteUniform( N, -10, 10, opts );
var PERM = discreteUniform( N, -10, 10, opts );

dlasd7.ndarray( 1, 1, 1, 1, d, 1, 0, z, 1, 0, ZW, 1, 0, VF, 1, 0, VFW, 1, 0, VL, 1, 0, VLW, 1, 0, 1.0, 1.0, DSIGMA, 1, 0, IDX, 1, 0, IDXP, 1, 0, IDXQ, 1, 0, PERM, 1, 0, GIVCOL, N, 1, 0, GIVNUM, N, 1, 0 );
```

The function has the following additional parameters:

-   **strideD**: stride length for `D`.
-   **offsetD**: starting index for `D`.
-   **strideZ**: stride length for `Z`.
-   **offsetZ**: starting index for `Z`.
-   **strideZW**: stride length for `ZW`.
-   **offsetZW**: starting index for `ZW`.
-   **strideVF**: stride length for `VF`.
-   **offsetVF**: starting index for `VF`.
-   **strideVFW**: stride length for `VFW`.
-   **offsetVFW**: starting index for `VFW`.
-   **strideVL**: stride length for `VL`.
-   **offsetVL**: starting index for `VL`.
-   **strideVLW**: stride length for `VLW`.
-   **offsetVLW**: starting index for `VLW`.
-   **strideDSIGMA**: stride length for `DSIGMA`.
-   **offsetDSIGMA**: starting index for `DSIGMA`.
-   **strideIDX**: stride length for `IDX`.
-   **offsetIDX**: starting index for `IDX`.
-   **strideIDXP**: stride length for `IDXP`.
-   **offsetIDXP**: starting index for `IDXP`.
-   **strideIDXQ**: stride length for `IDXQ`.
-   **offsetIDXQ**: starting index for `IDXQ`.
-   **stridePERM**: stride length for `PERM`.
-   **offsetPERM**: starting index for `PERM`.
-   **strideGIVCOL1**: stride of dimension 1 of `GIVCOL`.
-   **strideGIVCOL2**: stride of dimension 2 of `GIVCOL`.
-   **offsetGIVCOL**: starting index for `GIVCOL`.
-   **strideGIVNUM1**: stride of dimension 1 of `GIVNUM`.
-   **strideGIVNUM2**: stride of dimension 2 of `GIVNUM`.
-   **offsetGIVNUM**: starting index for `GIVNUM`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `dlasd7()` corresponds to the [LAPACK][lapack] level routine [`dlasd7`][lapack-dlasd7].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var dlasd7 = require( '@stdlib/lapack/base/dlasd7' );

var N = 3;
var GIVCOL = discreteUniform( N * N, -10, 10, opts );
var GIVNUM = discreteUniform( N * N, -10, 10, opts );
var d = discreteUniform( N, -10, 10, opts );
var z = discreteUniform( N, -10, 10, opts );
var ZW = discreteUniform( N, -10, 10, opts );
var VF = discreteUniform( N, -10, 10, opts );
var VFW = discreteUniform( N, -10, 10, opts );
var VL = discreteUniform( N, -10, 10, opts );
var VLW = discreteUniform( N, -10, 10, opts );
var DSIGMA = discreteUniform( N, -10, 10, opts );
var IDX = discreteUniform( N, -10, 10, opts );
var IDXP = discreteUniform( N, -10, 10, opts );
var IDXQ = discreteUniform( N, -10, 10, opts );
var PERM = discreteUniform( N, -10, 10, opts );

dlasd7.ndarray( 1, 1, 1, 1, d, 1, 0, z, 1, 0, ZW, 1, 0, VF, 1, 0, VFW, 1, 0, VL, 1, 0, VLW, 1, 0, 1.0, 1.0, DSIGMA, 1, 0, IDX, 1, 0, IDXP, 1, 0, IDXQ, 1, 0, PERM, 1, 0, GIVCOL, N, 1, 0, GIVNUM, N, 1, 0 );
```

</section>

<!-- /.examples -->

<!-- fortran-docs:start (generated by bin/fortran-docs.mjs from data/lapack-3.12.0/SRC/dlasd7.f; do not edit) -->

<section class="fortran-docs">

## Reference notes

The mathematical description from the reference LAPACK 3.12.0 source of `DLASD7`. Indices are the 1-based Fortran indices of the source.

### Purpose

DLASD7 merges the two sets of singular values together into a single sorted set. Then it tries to deflate the size of the problem. There are two ways in which deflation can occur: when two or more singular values are close together or if there is a tiny entry in the Z vector. For each such occurrence the order of the related secular equation problem is reduced by one.

DLASD7 is called from DLASD6.

</section>

<!-- fortran-docs:end -->

<!-- Section for related `stdlib` packages. Do not manually edit this section, as it is automatically populated. -->

<section class="related">

</section>

<!-- /.related -->

<!-- Section for all links. Make sure to keep an empty line after the `section` element and another before the `/section` close. -->

<section class="links">

[lapack]: https://www.netlib.org/lapack/explore-html/

[lapack-dlasd7]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__dlasd7.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->