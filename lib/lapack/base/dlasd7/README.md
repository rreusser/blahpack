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

## Reference documentation

From the reference LAPACK 3.12.0 source of `DLASD7`, converted to Markdown with KaTeX math. Indices are the 1-based Fortran indices of the source.

> Merges the two sets of singular values together into a single sorted set. Then it tries to deflate the size of the problem. Used by sbdsdc.

### Purpose

DLASD7 merges the two sets of singular values together into a single sorted set. Then it tries to deflate the size of the problem. There are two ways in which deflation can occur: when two or more singular values are close together or if there is a tiny entry in the Z vector. For each such occurrence the order of the related secular equation problem is reduced by one.

DLASD7 is called from DLASD6.

### Arguments

#### ICOMPQ `[in]`

_INTEGER_

Specifies whether singular vectors are to be computed in compact form, as follows:

-   `= 0`: Compute singular values only.
-   `= 1`: Compute singular vectors of upper bidiagonal matrix in compact form.

#### NL `[in]`

_INTEGER_

The row dimension of the upper block. $\mathrm{NL} \ge 1$.

#### NR `[in]`

_INTEGER_

The row dimension of the lower block. $\mathrm{NR} \ge 1$.

#### SQRE `[in]`

_INTEGER_

-   `= 0`: the lower block is an `NR`-by-`NR` square matrix.
-   `= 1`: the lower block is an `NR`-by-(`NR`+1) rectangular matrix.

The bidiagonal matrix has $N = \mathrm{NL} + \mathrm{NR} + 1$ rows and $M = N + \mathrm{SQRE} \ge N$ columns.

#### K `[out]`

_INTEGER_

Contains the dimension of the non-deflated matrix, this is the order of the related secular equation. $1 \le K \le N$.

#### D `[in,out]`

_DOUBLE PRECISION array, dimension ( N )_

On entry D contains the singular values of the two submatrices to be combined. On exit D contains the trailing (N-K) updated singular values (those which were deflated) sorted into increasing order.

#### Z `[out]`

_DOUBLE PRECISION array, dimension ( M )_

On exit Z contains the updating row vector in the secular equation.

#### ZW `[out]`

_DOUBLE PRECISION array, dimension ( M )_

Workspace for Z.

#### VF `[in,out]`

_DOUBLE PRECISION array, dimension ( M )_

On entry, `VF(1:NL+1)` contains the first components of all right singular vectors of the upper block; and `VF(NL+2:M)` contains the first components of all right singular vectors of the lower block. On exit, `VF` contains the first components of all right singular vectors of the bidiagonal matrix.

#### VFW `[out]`

_DOUBLE PRECISION array, dimension ( M )_

Workspace for `VF`.

#### VL `[in,out]`

_DOUBLE PRECISION array, dimension ( M )_

On entry, `VL(1:NL+1)` contains the last components of all right singular vectors of the upper block; and `VL(NL+2:M)` contains the last components of all right singular vectors of the lower block. On exit, `VL` contains the last components of all right singular vectors of the bidiagonal matrix.

#### VLW `[out]`

_DOUBLE PRECISION array, dimension ( M )_

Workspace for `VL`.

#### ALPHA `[in]`

_DOUBLE PRECISION_

Contains the diagonal element associated with the added row.

#### BETA `[in]`

_DOUBLE PRECISION_

Contains the off-diagonal element associated with the added row.

#### DSIGMA `[out]`

_DOUBLE PRECISION array, dimension ( N )_

Contains a copy of the diagonal elements (K-1 singular values and one zero) in the secular equation.

#### IDX `[out]`

_INTEGER array, dimension ( N )_

This will contain the permutation used to sort the contents of D into ascending order.

#### IDXP `[out]`

_INTEGER array, dimension ( N )_

This will contain the permutation used to place deflated values of D at the end of the array. On output `IDXP(2:K)` points to the nondeflated D-values and `IDXP(K+1:N)` points to the deflated singular values.

#### IDXQ `[in]`

_INTEGER array, dimension ( N )_

This contains the permutation which separately sorts the two sub-problems in D into ascending order. Note that entries in the first half of this permutation must first be moved one position backward; and entries in the second half must first have `NL`+1 added to their values.

#### PERM `[out]`

_INTEGER array, dimension ( N )_

The permutations (from deflation and sorting) to be applied to each singular block. Not referenced if `ICOMPQ = 0`.

#### GIVPTR `[out]`

_INTEGER_

The number of Givens rotations which took place in this subproblem. Not referenced if `ICOMPQ = 0`.

#### GIVCOL `[out]`

_INTEGER array, dimension ( LDGCOL, 2 )_

Each pair of numbers indicates a pair of columns to take place in a Givens rotation. Not referenced if `ICOMPQ = 0`.

#### LDGCOL `[in]`

_INTEGER_

The leading dimension of `GIVCOL`, must be at least N.

#### GIVNUM `[out]`

_DOUBLE PRECISION array, dimension ( LDGNUM, 2 )_

Each number indicates the C or S value to be used in the corresponding Givens rotation. Not referenced if `ICOMPQ = 0`.

#### LDGNUM `[in]`

_INTEGER_

The leading dimension of `GIVNUM`, must be at least N.

#### C `[out]`

_DOUBLE PRECISION_

C contains garbage if `SQRE =0` and the C-value of a Givens rotation related to the right null space if `SQRE = 1`.

#### S `[out]`

_DOUBLE PRECISION_

S contains garbage if `SQRE =0` and the S-value of a Givens rotation related to the right null space if `SQRE = 1`.

#### INFO `[out]`

_INTEGER_

-   `= 0`: successful exit.
-   `< 0`: if `INFO = -i`, the i-th argument had an illegal value.

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