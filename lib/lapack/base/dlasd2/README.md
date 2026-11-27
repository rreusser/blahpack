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

## Reference documentation

From the reference LAPACK 3.12.0 source of `DLASD2`, converted to Markdown with KaTeX math. Indices are the 1-based Fortran indices of the source.

> Merges the two sets of singular values together into a single sorted set. Used by sbdsdc.

### Purpose

DLASD2 merges the two sets of singular values together into a single sorted set. Then it tries to deflate the size of the problem. There are two ways in which deflation can occur: when two or more singular values are close together or if there is a tiny entry in the Z vector. For each such occurrence the order of the related secular equation problem is reduced by one.

DLASD2 is called from DLASD1.

### Arguments

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

Contains the dimension of the non-deflated matrix, This is the order of the related secular equation. $1 \le K \le N$.

#### D `[in,out]`

_DOUBLE PRECISION array, dimension(N)_

On entry D contains the singular values of the two submatrices to be combined. On exit D contains the trailing (N-K) updated singular values (those which were deflated) sorted into increasing order.

#### Z `[out]`

_DOUBLE PRECISION array, dimension(N)_

On exit Z contains the updating row vector in the secular equation.

#### ALPHA `[in]`

_DOUBLE PRECISION_

Contains the diagonal element associated with the added row.

#### BETA `[in]`

_DOUBLE PRECISION_

Contains the off-diagonal element associated with the added row.

#### U `[in,out]`

_DOUBLE PRECISION array, dimension(LDU,N)_

On entry U contains the left singular vectors of two submatrices in the two square blocks with corners at (1,1), (`NL`, `NL`), and (`NL`+2, `NL`+2), (N,N). On exit U contains the trailing (N-K) updated left singular vectors (those which were deflated) in its last N-K columns.

#### LDU `[in]`

_INTEGER_

The leading dimension of the array U. $\mathrm{LDU} \ge N$.

#### VT `[in,out]`

_DOUBLE PRECISION array, dimension(LDVT,M)_

On entry $\mathrm{VT}^T$ contains the right singular vectors of two submatrices in the two square blocks with corners at (1,1), (`NL`+1, `NL`+1), and (`NL`+2, `NL`+2), (M,M). On exit $\mathrm{VT}^T$ contains the trailing (N-K) updated right singular vectors (those which were deflated) in its last N-K columns. In case `SQRE =1`, the last row of `VT` spans the right null space.

#### LDVT `[in]`

_INTEGER_

The leading dimension of the array `VT`. $\mathrm{LDVT} \ge M$.

#### DSIGMA `[out]`

_DOUBLE PRECISION array, dimension (N)_

Contains a copy of the diagonal elements (K-1 singular values and one zero) in the secular equation.

#### U2 `[out]`

_DOUBLE PRECISION array, dimension(LDU2,N)_

Contains a copy of the first K-1 left singular vectors which will be used by DLASD3 in a matrix multiply (DGEMM) to solve for the new left singular vectors. `U2` is arranged into four blocks. The first block contains a column with 1 at `NL`+1 and zero everywhere else; the second block contains non-zero entries only at and above `NL`; the third contains non-zero entries only below `NL`+1; and the fourth is dense.

#### LDU2 `[in]`

_INTEGER_

The leading dimension of the array `U2`. $\mathrm{LDU2} \ge N$.

#### VT2 `[out]`

_DOUBLE PRECISION array, dimension(LDVT2,N)_

$\mathrm{VT2}^T$ contains a copy of the first K right singular vectors which will be used by DLASD3 in a matrix multiply (DGEMM) to solve for the new right singular vectors. `VT2` is arranged into three blocks. The first block contains a row that corresponds to the special 0 diagonal element in SIGMA; the second block contains non-zeros only at and before `NL` +1; the third block contains non-zeros only at and after `NL` +2.

#### LDVT2 `[in]`

_INTEGER_

The leading dimension of the array `VT2`. $\mathrm{LDVT2} \ge M$.

#### IDXP `[out]`

_INTEGER array, dimension(N)_

This will contain the permutation used to place deflated values of D at the end of the array. On output `IDXP(2:K)` points to the nondeflated D-values and `IDXP(K+1:N)` points to the deflated singular values.

#### IDX `[out]`

_INTEGER array, dimension(N)_

This will contain the permutation used to sort the contents of D into ascending order.

#### IDXC `[out]`

_INTEGER array, dimension(N)_

This will contain the permutation used to arrange the columns of the deflated U matrix into three groups: the first group contains non-zero entries only at and above `NL`, the second contains non-zero entries only below `NL`+2, and the third is dense.

#### IDXQ `[in,out]`

_INTEGER array, dimension(N)_

This contains the permutation which separately sorts the two sub-problems in D into ascending order. Note that entries in the first hlaf of this permutation must first be moved one position backward; and entries in the second half must first have `NL`+1 added to their values.

#### COLTYP `[out]`

_INTEGER array, dimension(N)_

As workspace, this will contain a label which will indicate which of the following types a column in the `U2` matrix or a row in the `VT2` matrix is: 1 : non-zero in the upper half only 2 : non-zero in the lower half only 3 : dense 4 : deflated

On exit, it is an array of dimension 4, with `COLTYP(I)` being the dimension of the I-th type columns.

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

[lapack-dlasd2]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__dlasd2.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->