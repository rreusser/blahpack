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

# dstein

> Computes the eigenvectors of a real symmetric tridiagonal matrix T corresponding to specified eigenvalues, using inverse iteration.

<section class="usage">

## Usage

```javascript
var dstein = require( '@stdlib/lapack/base/dstein' );
```

#### dstein( N, d, strideD, e, strideE, M, w, strideW, IBLOCK, strideIBLOCK, ISPLIT, strideISPLIT, Z, LDZ, WORK, strideWORK, IWORK, strideIWORK, IFAIL, strideIFAIL )

Computes the eigenvectors of a real symmetric tridiagonal matrix T corresponding to specified eigenvalues, using inverse iteration.

```javascript
var dstein = require( '@stdlib/lapack/base/dstein' );

var N = 3;
var Z = discreteUniform( N * N, -10, 10, opts );
var d = discreteUniform( N, -10, 10, opts );
var e = discreteUniform( N, -10, 10, opts );
var w = discreteUniform( N, -10, 10, opts );
var IBLOCK = discreteUniform( N, -10, 10, opts );
var ISPLIT = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );
var IWORK = discreteUniform( N, -10, 10, opts );
var IFAIL = discreteUniform( N, -10, 10, opts );

dstein.ndarray( N, d, 1, 0, e, 1, 0, N, w, 1, 0, IBLOCK, 1, 0, ISPLIT, 1, 0, Z, N, 1, 0, WORK, 1, 0, IWORK, 1, 0, IFAIL, 1, 0 );
```

The function has the following parameters:

-   **N**: number of columns.
-   **d**: `d`.
-   **strideD**: stride length for `D`.
-   **e**: `e`.
-   **strideE**: stride length for `E`.
-   **M**: number of rows.
-   **w**: `w`.
-   **strideW**: stride length for `W`.
-   **IBLOCK**: input array `IBLOCK`.
-   **strideIBLOCK**: stride length for `IBLOCK`.
-   **ISPLIT**: input array `ISPLIT`.
-   **strideISPLIT**: stride length for `ISPLIT`.
-   **Z**: input array `Z`.
-   **LDZ**: leading dimension of `Z`.
-   **WORK**: input array `WORK`.
-   **strideWORK**: stride length for `WORK`.
-   **IWORK**: input array `IWORK`.
-   **strideIWORK**: stride length for `IWORK`.
-   **IFAIL**: input array `IFAIL`.
-   **strideIFAIL**: stride length for `IFAIL`.

#### dstein.ndarray( N, d, strideD, offsetD, e, strideE, offsetE, M, w, strideW, offsetW, IBLOCK, strideIBLOCK, offsetIBLOCK, ISPLIT, strideISPLIT, offsetISPLIT, Z, strideZ1, strideZ2, offsetZ, WORK, strideWORK, offsetWORK, IWORK, strideIWORK, offsetIWORK, IFAIL, strideIFAIL, offsetIFAIL )

Computes the eigenvectors of a real symmetric tridiagonal matrix T corresponding to specified eigenvalues, using inverse iteration, using alternative indexing semantics.

```javascript
var dstein = require( '@stdlib/lapack/base/dstein' );

var N = 3;
var Z = discreteUniform( N * N, -10, 10, opts );
var d = discreteUniform( N, -10, 10, opts );
var e = discreteUniform( N, -10, 10, opts );
var w = discreteUniform( N, -10, 10, opts );
var IBLOCK = discreteUniform( N, -10, 10, opts );
var ISPLIT = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );
var IWORK = discreteUniform( N, -10, 10, opts );
var IFAIL = discreteUniform( N, -10, 10, opts );

dstein.ndarray( N, d, 1, 0, e, 1, 0, N, w, 1, 0, IBLOCK, 1, 0, ISPLIT, 1, 0, Z, N, 1, 0, WORK, 1, 0, IWORK, 1, 0, IFAIL, 1, 0 );
```

The function has the following additional parameters:

-   **offsetD**: starting index for `D`.
-   **offsetE**: starting index for `E`.
-   **offsetW**: starting index for `W`.
-   **offsetIBLOCK**: starting index for `IBLOCK`.
-   **offsetISPLIT**: starting index for `ISPLIT`.
-   **strideZ1**: stride of dimension 1 of `Z`.
-   **strideZ2**: stride of dimension 2 of `Z`.
-   **offsetZ**: starting index for `Z`.
-   **offsetWORK**: starting index for `WORK`.
-   **offsetIWORK**: starting index for `IWORK`.
-   **offsetIFAIL**: starting index for `IFAIL`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `dstein()` corresponds to the [LAPACK][lapack] level routine [`dstein`][lapack-dstein].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var dstein = require( '@stdlib/lapack/base/dstein' );

var N = 3;
var Z = discreteUniform( N * N, -10, 10, opts );
var d = discreteUniform( N, -10, 10, opts );
var e = discreteUniform( N, -10, 10, opts );
var w = discreteUniform( N, -10, 10, opts );
var IBLOCK = discreteUniform( N, -10, 10, opts );
var ISPLIT = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );
var IWORK = discreteUniform( N, -10, 10, opts );
var IFAIL = discreteUniform( N, -10, 10, opts );

dstein.ndarray( N, d, 1, 0, e, 1, 0, N, w, 1, 0, IBLOCK, 1, 0, ISPLIT, 1, 0, Z, N, 1, 0, WORK, 1, 0, IWORK, 1, 0, IFAIL, 1, 0 );
```

</section>

<!-- /.examples -->

<!-- fortran-docs:start (generated by bin/fortran-docs.mjs from data/lapack-3.12.0/SRC/dstein.f; do not edit) -->

<section class="fortran-docs">

## Reference documentation

From the reference LAPACK 3.12.0 source of `DSTEIN`, converted to Markdown with KaTeX math. Indices are the 1-based Fortran indices of the source.

### Purpose

DSTEIN computes the eigenvectors of a real symmetric tridiagonal matrix T corresponding to specified eigenvalues, using inverse iteration.

The maximum number of iterations allowed for each eigenvector is specified by an internal parameter MAXITS (currently set to 5).

### Arguments

#### N `[in]`

_INTEGER_

The order of the matrix. $N \ge 0$.

#### D `[in]`

_DOUBLE PRECISION array, dimension (N)_

The n diagonal elements of the tridiagonal matrix T.

#### E `[in]`

_DOUBLE PRECISION array, dimension (N-1)_

The (n-1) subdiagonal elements of the tridiagonal matrix T, in elements 1 to N-1.

#### M `[in]`

_INTEGER_

The number of eigenvectors to be found. $0 \le M \le N$.

#### W `[in]`

_DOUBLE PRECISION array, dimension (N)_

The first M elements of W contain the eigenvalues for which eigenvectors are to be computed. The eigenvalues should be grouped by split-off block and ordered from smallest to largest within the block. ( The output array W from DSTEBZ with `ORDER = 'B'` is expected here. )

#### IBLOCK `[in]`

_INTEGER array, dimension (N)_

The submatrix indices associated with the corresponding eigenvalues in W; `IBLOCK(i)=1` if eigenvalue `W(i)` belongs to the first submatrix from the top, =2 if `W(i)` belongs to the second submatrix, etc. ( The output array `IBLOCK` from DSTEBZ is expected here. )

#### ISPLIT `[in]`

_INTEGER array, dimension (N)_

The splitting points, at which T breaks up into submatrices. The first submatrix consists of rows/columns 1 to ISPLIT( 1 ), the second of rows/columns ISPLIT( 1 )+1 through ISPLIT( 2 ), etc. ( The output array `ISPLIT` from DSTEBZ is expected here. )

#### Z `[out]`

_DOUBLE PRECISION array, dimension (LDZ, M)_

The computed eigenvectors. The eigenvector associated with the eigenvalue `W(i)` is stored in the i-th column of Z. Any vector which fails to converge is set to its current iterate after MAXITS iterations.

#### LDZ `[in]`

_INTEGER_

The leading dimension of the array Z. $\mathrm{LDZ} \ge \max (1,N)$.

#### WORK `[out]`

_DOUBLE PRECISION array, dimension (5\*N)_

#### IWORK `[out]`

_INTEGER array, dimension (N)_

#### IFAIL `[out]`

_INTEGER array, dimension (M)_

On normal exit, all elements of `IFAIL` are zero. If one or more eigenvectors fail to converge after MAXITS iterations, then their indices are stored in array `IFAIL`.

#### INFO `[out]`

_INTEGER_

-   `= 0`: successful exit.
-   `< 0`: if `INFO = -i`, the i-th argument had an illegal value
-   `> 0`: if `INFO = i`, then i eigenvectors failed to converge in MAXITS iterations.  Their indices are stored in array `IFAIL`.

</section>

<!-- fortran-docs:end -->

<!-- Section for related `stdlib` packages. Do not manually edit this section, as it is automatically populated. -->

<section class="related">

</section>

<!-- /.related -->

<!-- Section for all links. Make sure to keep an empty line after the `section` element and another before the `/section` close. -->

<section class="links">

[lapack]: https://www.netlib.org/lapack/explore-html/

[lapack-dstein]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__dstein.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->