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

## Reference documentation

From the reference LAPACK 3.12.0 source of `DLAED2`, converted to Markdown with KaTeX math. Indices are the 1-based Fortran indices of the source.

> Used by DSTEDC. Merges eigenvalues and deflates secular equation. Used when the original matrix is tridiagonal.

### Purpose

DLAED2 merges the two sets of eigenvalues together into a single sorted set. Then it tries to deflate the size of the problem. There are two ways in which deflation can occur: when two or more eigenvalues are close together or if there is a tiny entry in the Z vector. For each such occurrence the order of the related secular equation problem is reduced by one.

### Arguments

#### K `[out]`

_INTEGER_

The number of non-deflated eigenvalues, and the order of the related secular equation. $0 \le K \le N$.

#### N `[in]`

_INTEGER_

The dimension of the symmetric tridiagonal matrix. $N \ge 0$.

#### N1 `[in]`

_INTEGER_

The location of the last eigenvalue in the leading sub-matrix. $\min (1,N) \le N_{1} \le N/2$.

#### D `[in,out]`

_DOUBLE PRECISION array, dimension (N)_

On entry, D contains the eigenvalues of the two submatrices to be combined. On exit, D contains the trailing (N-K) updated eigenvalues (those which were deflated) sorted into increasing order.

#### Q `[in,out]`

_DOUBLE PRECISION array, dimension (LDQ, N)_

On entry, Q contains the eigenvectors of two submatrices in the two square blocks with corners at (1,1), (`N1`,`N1`) and (`N1`+1, `N1`+1), (N,N). On exit, Q contains the trailing (N-K) updated eigenvectors (those which were deflated) in its last N-K columns.

#### LDQ `[in]`

_INTEGER_

The leading dimension of the array Q. $\mathrm{LDQ} \ge \max (1,N)$.

#### INDXQ `[in,out]`

_INTEGER array, dimension (N)_

The permutation which separately sorts the two sub-problems in D into ascending order. Note that elements in the second half of this permutation must first have `N1` added to their values. Destroyed on exit.

#### RHO `[in,out]`

_DOUBLE PRECISION_

On entry, the off-diagonal element associated with the rank-1 cut which originally split the two submatrices which are now being recombined. On exit, `RHO` has been modified to the value required by DLAED3.

#### Z `[in]`

_DOUBLE PRECISION array, dimension (N)_

On entry, Z contains the updating vector (the last row of the first sub-eigenvector matrix and the first row of the second sub-eigenvector matrix). On exit, the contents of Z have been destroyed by the updating process.

#### DLAMBDA `[out]`

_DOUBLE PRECISION array, dimension (N)_

A copy of the first K eigenvalues which will be used by DLAED3 to form the secular equation.

#### W `[out]`

_DOUBLE PRECISION array, dimension (N)_

The first k values of the final deflation-altered z-vector which will be passed to DLAED3.

#### Q2 `[out]`

_DOUBLE PRECISION array, dimension (N1\*\*2+(N-N1)\*\*2)_

A copy of the first K eigenvectors which will be used by DLAED3 in a matrix multiply (DGEMM) to solve for the new eigenvectors.

#### INDX `[out]`

_INTEGER array, dimension (N)_

The permutation used to sort the contents of `DLAMBDA` into ascending order.

#### INDXC `[out]`

_INTEGER array, dimension (N)_

The permutation used to arrange the columns of the deflated Q matrix into three groups: the first group contains non-zero elements only at and above `N1`, the second contains non-zero elements only below `N1`, and the third is dense.

#### INDXP `[out]`

_INTEGER array, dimension (N)_

The permutation used to place deflated values of D at the end of the array. `INDXP(1:K)` points to the nondeflated D-values and `INDXP(K+1:N)` points to the deflated eigenvalues.

#### COLTYP `[out]`

_INTEGER array, dimension (N)_

During execution, a label which will indicate which of the following types a column in the `Q2` matrix is: 1 : non-zero in the upper half only; 2 : dense; 3 : non-zero in the lower half only; 4 : deflated. On exit, `COLTYP(i)` is the number of columns of type i, for $i=1$ to 4 only.

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

[lapack-dlaed2]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__dlaed2.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->