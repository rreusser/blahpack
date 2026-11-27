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

# dorgtsqr_row

> Generates an M-by-N real matrix Q with orthonormal columns from the output of DLATSQR using a row-block (GETT) sweep

<section class="usage">

## Usage

```javascript
var dorgtsqr_row = require( '@stdlib/lapack/base/dorgtsqr_row' );
```

#### dorgtsqr_row( order, M, N, mb, nb, A, LDA, T, LDT, WORK, strideWORK )

Generates an M-by-N real matrix Q with orthonormal columns from the output of DLATSQR using a row-block (GETT) sweep

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var dlatsqr = require( '@stdlib/lapack/base/dlatsqr' );

var M = 8;
var N = 3;
var MB = 4;
var NB = 2;
var numblk = Math.ceil( ( M - N ) / ( MB - N ) );
var A = new Float64Array( M * N );
var T = new Float64Array( NB * numblk * N );
var WORK = new Float64Array( NB * N );
var WORK2 = new Float64Array( NB * NB );
// ... fill A with the matrix to factor ...
dlatsqr.ndarray( M, N, MB, NB, A, 1, M, 0, T, 1, NB, 0, WORK, 1, 0 );
dorgtsqr_row( 'column-major', M, N, MB, NB, A, M, T, NB, WORK2, 1 );
// A now holds the M-by-N orthonormal Q.
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **M**: number of rows of `A` (`M >= N`).
-   **N**: number of columns of `A`.
-   **mb**: row block size used by `dlatsqr` (`mb > N`).
-   **nb**: column block size used by `dlatsqr` (`nb >= 1`).
-   **A**: on entry, the strict lower trapezoidal part holds `V` from `dlatsqr`; on exit, the columns of `A` are the orthonormal columns of `Q`.
-   **LDA**: leading dimension of `A`.
-   **T**: block reflectors from `dlatsqr` (read-only).
-   **LDT**: leading dimension of `T`.
-   **WORK**: workspace of length at least `nblocal * max(nblocal, N - nblocal)`, where `nblocal = min(nb, N)`.
-   **strideWORK**: stride length for `WORK` (must be `1`).

#### dorgtsqr_row.ndarray( M, N, mb, nb, A, strideA1, strideA2, offsetA, T, strideT1, strideT2, offsetT, WORK, strideWORK, offsetWORK )

Generates an M-by-N real matrix Q with orthonormal columns from the output of DLATSQR using a row-block (GETT) sweep, using alternative indexing semantics.

```javascript
var Float64Array = require( '@stdlib/array/float64' );

var M = 4;
var N = 3;
var MB = 8;
var NB = 2;
// (After dlatsqr has populated A and T as in the example above.)
var A = new Float64Array( M * N );
var T = new Float64Array( NB * N );
var WORK = new Float64Array( NB * NB );
dorgtsqr_row.ndarray( M, N, MB, NB, A, 1, M, 0, T, 1, NB, 0, WORK, 1, 0 );
```

The function has the following additional parameters:

-   **strideA1**: stride of dimension 1 of `A`.
-   **strideA2**: stride of dimension 2 of `A`.
-   **offsetA**: starting index for `A`.
-   **strideT1**: stride of dimension 1 of `T`.
-   **strideT2**: stride of dimension 2 of `T`.
-   **offsetT**: starting index for `T`.
-   **offsetWORK**: starting index for `WORK`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `dorgtsqr_row` consumes the `V` (Householder vectors) and `T` (block reflectors) produced by [`dlatsqr`][@stdlib/lapack/base/dlatsqr] and reconstructs the leading `N` columns of the orthogonal factor `Q`.
-   The reconstruction sweeps row blocks of `A` bottom-up — the reverse of the order in which `dlatsqr` produced its output. Each row block is processed by applying its column-block reflectors right-to-left via `dlarfb_gett` (the GETT-form block reflector applier).
-   `MB` must satisfy `MB > N` (the `MB <= N` case is rejected by both this routine and `dlatsqr`).
-   The Fortran reference returns the optimal `LWORK` in `WORK[0]` on a workspace query; the JS port omits this query because callers allocate workspace directly.

</section>

<!-- /.notes -->

<section class="examples">

## Examples

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var dlatsqr = require( '@stdlib/lapack/base/dlatsqr' );
var dorgtsqr_row = require( '@stdlib/lapack/base/dorgtsqr_row' );

var M = 8;
var N = 3;
var MB = 4;
var NB = 2;
var numblk = Math.ceil( ( M - N ) / ( MB - N ) );
var A = new Float64Array( M * N );
var T = new Float64Array( NB * numblk * N );
var W1 = new Float64Array( NB * N );
var W2 = new Float64Array( NB * NB );
var i;
var j;
for ( j = 0; j < N; j++ ) {
    for ( i = 0; i < M; i++ ) {
        A[ i + j*M ] = ( i === j ) ? 4.0 + j : 1.0 / ( Math.abs( i - j ) + 1 );
    }
}
dlatsqr.ndarray( M, N, MB, NB, A, 1, M, 0, T, 1, NB, 0, W1, 1, 0 );
dorgtsqr_row.ndarray( M, N, MB, NB, A, 1, M, 0, T, 1, NB, 0, W2, 1, 0 );
console.log( A );
```

</section>

<!-- /.examples -->

<!-- fortran-docs:start (generated by bin/fortran-docs.mjs from data/lapack-3.12.0/SRC/dorgtsqr_row.f; do not edit) -->

<section class="fortran-docs">

## Reference documentation

From the reference LAPACK 3.12.0 source of `DORGTSQR_ROW`, converted to Markdown with KaTeX math. Indices are the 1-based Fortran indices of the source.

### Purpose

DORGTSQR\_ROW generates an M-by-N real matrix Q\_out with orthonormal columns from the output of DLATSQR. These N orthonormal columns are the first N columns of a product of complex unitary matrices Q(k)\_in of order M, which are returned by DLATSQR in a special format.

Q\_out = first\_N\_columns\_of( Q(1)\_in \* Q(2)\_in \* ... \* Q(k)\_in ).

The input matrices Q(k)\_in are stored in row and column blocks in A. See the documentation of DLATSQR for more details on the format of Q(k)\_in, where each Q(k)\_in is represented by block Householder transformations. This routine calls an auxiliary routine DLARFB\_GETT, where the computation is performed on each individual block. The algorithm first sweeps `NB`-sized column blocks from the right to left starting in the bottom row block and continues to the top row block (hence \_ROW in the routine name). This sweep is in reverse order of the order in which DLATSQR generates the output blocks.

### Arguments

#### M `[in]`

_INTEGER_

The number of rows of the matrix A. $M \ge 0$.

#### N `[in]`

_INTEGER_

The number of columns of the matrix A. $M \ge N \ge 0$.

#### MB `[in]`

_INTEGER_

The row block size used by DLATSQR to return arrays A and T. $\mathrm{MB} > N$. (Note that if $\mathrm{MB} > M$, then M is used instead of `MB` as the row block size).

#### NB `[in]`

_INTEGER_

The column block size used by DLATSQR to return arrays A and T. $\mathrm{NB} \ge 1$. (Note that if $\mathrm{NB} > N$, then N is used instead of `NB` as the column block size).

#### A `[in,out]`

_DOUBLE PRECISION array, dimension (LDA,N)_

On entry:

The elements on and above the diagonal are not used as input. The elements below the diagonal represent the unit lower-trapezoidal blocked matrix V computed by DLATSQR that defines the input matrices Q\_in(k) (ones on the diagonal are not stored). See DLATSQR for more details.

On exit:

The array A contains an M-by-N orthonormal matrix Q\_out, i.e the columns of A are orthogonal unit vectors.

#### LDA `[in]`

_INTEGER_

The leading dimension of the array A. $\mathrm{LDA} \ge \max (1,M)$.

#### T `[in]`

_DOUBLE PRECISION array_

dimension (`LDT`, N \* NIRB) where NIRB = Number\_of\_input\_row\_blocks

$$
= \max ( 1, \mathrm{CEIL}((M-N)/(\mathrm{MB}-N)) )
$$

Let NICB = Number\_of\_input\_col\_blocks

$$
= \mathrm{CEIL}(N/\mathrm{NB})
$$

The upper-triangular block reflectors used to define the input matrices Q\_in(k), $k=(1:\mathrm{NIRB} \, \mathrm{NICB})$. The block reflectors are stored in compact form in NIRB block reflector sequences. Each of the NIRB block reflector sequences is stored in a larger `NB`-by-N column block of T and consists of NICB smaller `NB`-by-`NB` upper-triangular column blocks. See DLATSQR for more details on the format of T.

#### LDT `[in]`

_INTEGER_

The leading dimension of the array T. $\mathrm{LDT} \ge \max (1,\min (\mathrm{NB},N))$.

#### WORK `[out]`

(workspace) DOUBLE PRECISION array, dimension (MAX(1,`LWORK`)) On exit, if `INFO = 0`, `WORK(1)` returns the optimal `LWORK`.

#### LWORK `[in]`

The dimension of the array `WORK`. $\mathrm{LWORK} \ge \mathrm{NBLOCAL} \, \max (\mathrm{NBLOCAL},(N-\mathrm{NBLOCAL}))$, where $\mathrm{NBLOCAL}=\min (\mathrm{NB},N)$. If `LWORK = -1`, then a workspace query is assumed. The routine only calculates the optimal size of the `WORK` array, returns this value as the first entry of the `WORK` array, and no error message related to `LWORK` is issued by XERBLA.

#### INFO `[out]`

_INTEGER_

-   `= 0`: successful exit
-   `< 0`: if `INFO = -i`, the i-th argument had an illegal value

### Contributors

November 2020, Igor Kozachenko,

-   Computer Science Division,
-   University of California, Berkeley

</section>

<!-- fortran-docs:end -->

<!-- Section for related `stdlib` packages. Do not manually edit this section, as it is automatically populated. -->

<section class="related">

</section>

<!-- /.related -->

<!-- Section for all links. Make sure to keep an empty line after the `section` element and another before the `/section` close. -->

<section class="links">

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array
[mdn-float32array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float32Array
[mdn-int32array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Int32Array
[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->
