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

# dptrfs

> Improves the computed solution to a system of linear equations when the coefficient matrix is symmetric positive definite and tridiagonal, and provides error bounds and backward error estimates for the solution.

<section class="usage">

## Usage

```javascript
var dptrfs = require( '@stdlib/lapack/base/dptrfs' );
```

#### dptrfs( N, nrhs, d, strideD, e, strideE, DF, strideDF, EF, strideEF, B, LDB, X, LDX, FERR, strideFERR, BERR, strideBERR, WORK, strideWORK )

Improves the computed solution to a system of linear equations when the coefficient matrix is symmetric positive definite and tridiagonal, and provides error bounds and backward error estimates for the solution.

```javascript
var dptrfs = require( '@stdlib/lapack/base/dptrfs' );

var N = 3;
var B = discreteUniform( N * N, -10, 10, opts );
var X = discreteUniform( N * N, -10, 10, opts );
var d = discreteUniform( N, -10, 10, opts );
var e = discreteUniform( N, -10, 10, opts );
var DF = discreteUniform( N, -10, 10, opts );
var EF = discreteUniform( N, -10, 10, opts );
var FERR = discreteUniform( N, -10, 10, opts );
var BERR = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );

dptrfs.ndarray( N, N, d, 1, 0, e, 1, 0, DF, 1, 0, EF, 1, 0, B, N, 1, 0, X, N, 1, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0 );
```

The function has the following parameters:

-   **N**: number of columns.
-   **nrhs**: number of right-hand sides.
-   **d**: `d`.
-   **strideD**: stride length for `D`.
-   **e**: `e`.
-   **strideE**: stride length for `E`.
-   **DF**: input array `DF`.
-   **strideDF**: stride length for `DF`.
-   **EF**: input array `EF`.
-   **strideEF**: stride length for `EF`.
-   **B**: input array `B`.
-   **LDB**: leading dimension of `B`.
-   **X**: input array `X`.
-   **LDX**: leading dimension of `X`.
-   **FERR**: input array `FERR`.
-   **strideFERR**: stride length for `FERR`.
-   **BERR**: input array `BERR`.
-   **strideBERR**: stride length for `BERR`.
-   **WORK**: input array `WORK`.
-   **strideWORK**: stride length for `WORK`.

#### dptrfs.ndarray( N, nrhs, d, strideD, offsetD, e, strideE, offsetE, DF, strideDF, offsetDF, EF, strideEF, offsetEF, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWORK, offsetWORK )

Improves the computed solution to a system of linear equations when the coefficient matrix is symmetric positive definite and tridiagonal, and provides error bounds and backward error estimates for the solution, using alternative indexing semantics.

```javascript
var dptrfs = require( '@stdlib/lapack/base/dptrfs' );

var N = 3;
var B = discreteUniform( N * N, -10, 10, opts );
var X = discreteUniform( N * N, -10, 10, opts );
var d = discreteUniform( N, -10, 10, opts );
var e = discreteUniform( N, -10, 10, opts );
var DF = discreteUniform( N, -10, 10, opts );
var EF = discreteUniform( N, -10, 10, opts );
var FERR = discreteUniform( N, -10, 10, opts );
var BERR = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );

dptrfs.ndarray( N, N, d, 1, 0, e, 1, 0, DF, 1, 0, EF, 1, 0, B, N, 1, 0, X, N, 1, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0 );
```

The function has the following additional parameters:

-   **offsetD**: starting index for `D`.
-   **offsetE**: starting index for `E`.
-   **offsetDF**: starting index for `DF`.
-   **offsetEF**: starting index for `EF`.
-   **strideB1**: stride of dimension 1 of `B`.
-   **strideB2**: stride of dimension 2 of `B`.
-   **offsetB**: starting index for `B`.
-   **strideX1**: stride of dimension 1 of `X`.
-   **strideX2**: stride of dimension 2 of `X`.
-   **offsetX**: starting index for `X`.
-   **offsetFERR**: starting index for `FERR`.
-   **offsetBERR**: starting index for `BERR`.
-   **offsetWORK**: starting index for `WORK`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `dptrfs()` corresponds to the [LAPACK][lapack] level routine [`dptrfs`][lapack-dptrfs].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var dptrfs = require( '@stdlib/lapack/base/dptrfs' );

var N = 3;
var B = discreteUniform( N * N, -10, 10, opts );
var X = discreteUniform( N * N, -10, 10, opts );
var d = discreteUniform( N, -10, 10, opts );
var e = discreteUniform( N, -10, 10, opts );
var DF = discreteUniform( N, -10, 10, opts );
var EF = discreteUniform( N, -10, 10, opts );
var FERR = discreteUniform( N, -10, 10, opts );
var BERR = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );

dptrfs.ndarray( N, N, d, 1, 0, e, 1, 0, DF, 1, 0, EF, 1, 0, B, N, 1, 0, X, N, 1, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0 );
```

</section>

<!-- /.examples -->

<!-- fortran-docs:start (generated by bin/fortran-docs.mjs from data/lapack-3.12.0/SRC/dptrfs.f; do not edit) -->

<section class="fortran-docs">

## Reference documentation

From the reference LAPACK 3.12.0 source of `DPTRFS`, converted to Markdown with KaTeX math. Indices are the 1-based Fortran indices of the source.

### Purpose

DPTRFS improves the computed solution to a system of linear equations when the coefficient matrix is symmetric positive definite and tridiagonal, and provides error bounds and backward error estimates for the solution.

### Arguments

#### N `[in]`

_INTEGER_

The order of the matrix A. $N \ge 0$.

#### NRHS `[in]`

_INTEGER_

The number of right hand sides, i.e., the number of columns of the matrix B. $\mathrm{NRHS} \ge 0$.

#### D `[in]`

_DOUBLE PRECISION array, dimension (N)_

The n diagonal elements of the tridiagonal matrix A.

#### E `[in]`

_DOUBLE PRECISION array, dimension (N-1)_

The (n-1) subdiagonal elements of the tridiagonal matrix A.

#### DF `[in]`

_DOUBLE PRECISION array, dimension (N)_

The n diagonal elements of the diagonal matrix D from the factorization computed by DPTTRF.

#### EF `[in]`

_DOUBLE PRECISION array, dimension (N-1)_

The (n-1) subdiagonal elements of the unit bidiagonal factor L from the factorization computed by DPTTRF.

#### B `[in]`

_DOUBLE PRECISION array, dimension (LDB,NRHS)_

The right hand side matrix B.

#### LDB `[in]`

_INTEGER_

The leading dimension of the array B. $\mathrm{LDB} \ge \max (1,N)$.

#### X `[in,out]`

_DOUBLE PRECISION array, dimension (LDX,NRHS)_

On entry, the solution matrix X, as computed by DPTTRS. On exit, the improved solution matrix X.

#### LDX `[in]`

_INTEGER_

The leading dimension of the array X. $\mathrm{LDX} \ge \max (1,N)$.

#### FERR `[out]`

_DOUBLE PRECISION array, dimension (NRHS)_

The forward error bound for each solution vector `X(j)` (the j-th column of the solution matrix X). If XTRUE is the true solution corresponding to `X(j)`, `FERR(j)` is an estimated upper bound for the magnitude of the largest element in (`X(j)` - XTRUE) divided by the magnitude of the largest element in `X(j)`.

#### BERR `[out]`

_DOUBLE PRECISION array, dimension (NRHS)_

The componentwise relative backward error of each solution vector `X(j)` (i.e., the smallest relative change in any element of A or B that makes `X(j)` an exact solution).

#### WORK `[out]`

_DOUBLE PRECISION array, dimension (2\*N)_

#### INFO `[out]`

_INTEGER_

-   `= 0`: successful exit
-   `< 0`: if `INFO = -i`, the i-th argument had an illegal value

</section>

<!-- fortran-docs:end -->

<!-- Section for related `stdlib` packages. Do not manually edit this section, as it is automatically populated. -->

<section class="related">

</section>

<!-- /.related -->

<!-- Section for all links. Make sure to keep an empty line after the `section` element and another before the `/section` close. -->

<section class="links">

[lapack]: https://www.netlib.org/lapack/explore-html/

[lapack-dptrfs]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__dptrfs.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->