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

# zhetrd_he2hb

> Reduce a complex Hermitian matrix `A` to complex Hermitian band-diagonal form `AB` by a unitary similarity transformation `Q__H * A * Q = AB`.

This is the first ("stage 1") step of the two-stage reduction of a Hermitian matrix to tridiagonal form used by `xHETRD_2STAGE`. The routine produces band storage `AB` with bandwidth `kd`, plus reflector vectors and scalars (`A`, `TAU`) representing the unitary transformation `Q`.

<section class="usage">

## Usage

```javascript
var zhetrd_he2hb = require( '@stdlib/lapack/base/zhetrd_he2hb' );
```

#### zhetrd_he2hb( order, uplo, N, kd, A, LDA, AB, LDAB, TAU, strideTAU, WORK, strideWORK )

Reduces a complex Hermitian matrix `A` to complex Hermitian band-diagonal form `AB`.

```javascript
var Complex128Array = require( '@stdlib/array/complex128' );

var N = 4;
var kd = 1;
var A = new Complex128Array( N * N );
var AB = new Complex128Array( ( kd + 1 ) * N );
var TAU = new Complex128Array( N - kd );

var info = zhetrd_he2hb( 'column-major', 'lower', N, kd, A, N, AB, kd+1, TAU, 1, null, 1 );
// info => 0
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **uplo**: matrix triangle (`'upper'` or `'lower'`).
-   **N**: order of the matrix `A`.
-   **kd**: number of super-/sub-diagonals of the reduced band matrix.
-   **A**: input/output Hermitian matrix as a [`Complex128Array`][@stdlib/array/complex128]. On exit, contains the reflectors of `Q` outside the band.
-   **LDA**: leading dimension of `A` (≥ max(1, N)).
-   **AB**: output band matrix, dimensioned at least `(kd+1)*N` complex elements.
-   **LDAB**: leading dimension of `AB` (≥ kd+1).
-   **TAU**: output scalar factors of the reflectors, length at least `N-kd` complex elements.
-   **strideTAU**: stride length for `TAU` (in complex elements).
-   **WORK**: workspace. Pass `null` to allocate internally.
-   **strideWORK**: stride length for `WORK`. Unused — workspace is allocated internally.

#### zhetrd_he2hb.ndarray( uplo, N, kd, A, strideA1, strideA2, offsetA, AB, strideAB1, strideAB2, offsetAB, TAU, strideTAU, offsetTAU, WORK, strideWORK, offsetWORK )

ndarray variant with stride/offset semantics for `A`, `AB`, `TAU`, and `WORK`.

```javascript
var Complex128Array = require( '@stdlib/array/complex128' );

var N = 4;
var kd = 1;
var A = new Complex128Array( N * N );
var AB = new Complex128Array( ( kd + 1 ) * N );
var TAU = new Complex128Array( N - kd );

var info = zhetrd_he2hb.ndarray( 'lower', N, kd, A, 1, N, 0, AB, 1, kd+1, 0, TAU, 1, 0, null, 1, 0 );
// info => 0
```

The function has the following additional parameters:

-   **strideA1**, **strideA2**: strides of the first and second dimensions of `A` (in complex elements).
-   **offsetA**: starting index for `A`.
-   **strideAB1**, **strideAB2**: strides of the first and second dimensions of `AB`.
-   **offsetAB**: starting index for `AB`.
-   **offsetTAU**: starting index for `TAU`.
-   **offsetWORK**: starting index for `WORK`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   On entry, the relevant triangle of `A` (upper or lower) contains the Hermitian input. On exit, that triangle contains the band entries within `kd` of the diagonal, plus the reflectors representing `Q` for the entries further from the diagonal.
-   The Fortran reference uses an `ILAENV2STAGE` query to size the workspace. This implementation ignores the `WORK` argument and allocates scratch buffers internally (sized for the chosen block factor).
-   The "quick return" path triggers when `N <= kd+1`, in which case `AB` receives a direct copy of the relevant triangle of `A` and no reflectors are computed.

</section>

<!-- /.notes -->

<section class="examples">

## Examples

```javascript
var Complex128Array = require( '@stdlib/array/complex128' );
var reinterpret = require( '@stdlib/strided/base/reinterpret-complex128' );
var zhetrd_he2hb = require( '@stdlib/lapack/base/zhetrd_he2hb' );

var N = 6;
var kd = 2;
var A = new Complex128Array( N * N );
var AB = new Complex128Array( ( kd + 1 ) * N );
var TAU = new Complex128Array( N - kd );

// (build a Hermitian matrix in A, then call the routine)
var info = zhetrd_he2hb( 'column-major', 'lower', N, kd, A, N, AB, kd+1, TAU, 1, null, 1 );
console.log( info, reinterpret( AB, 0 ) );
```

</section>

<!-- /.examples -->

<!-- fortran-docs:start (generated by bin/fortran-docs.mjs from data/lapack-3.12.0/SRC/zhetrd_he2hb.f; do not edit) -->

<section class="fortran-docs">

## Reference documentation

From the reference LAPACK 3.12.0 source of `ZHETRD_HE2HB`, converted to Markdown with KaTeX math. Indices are the 1-based Fortran indices of the source.

### Purpose

ZHETRD\_HE2HB reduces a complex Hermitian matrix A to complex Hermitian band-diagonal form `AB` by a unitary similarity transformation: $Q^H \, A \, Q = \mathrm{AB}$.

### Arguments

#### UPLO `[in]`

_CHARACTER\*1_

-   `= 'U'`: Upper triangle of A is stored;
-   `= 'L'`: Lower triangle of A is stored.

#### N `[in]`

_INTEGER_

The order of the matrix A. $N \ge 0$.

#### KD `[in]`

_INTEGER_

The number of superdiagonals of the reduced matrix if `UPLO = 'U'`, or the number of subdiagonals if `UPLO = 'L'`. $\mathrm{KD} \ge 0$. The reduced matrix is stored in the array `AB`.

#### A `[in,out]`

_COMPLEX\*16 array, dimension (LDA,N)_

On entry, the Hermitian matrix A. If `UPLO = 'U'`, the leading N-by-N upper triangular part of A contains the upper triangular part of the matrix A, and the strictly lower triangular part of A is not referenced. If `UPLO = 'L'`, the leading N-by-N lower triangular part of A contains the lower triangular part of the matrix A, and the strictly upper triangular part of A is not referenced. On exit, if `UPLO = 'U'`, the diagonal and first superdiagonal of A are overwritten by the corresponding elements of the tridiagonal matrix T, and the elements above the first superdiagonal, with the array `TAU`, represent the unitary matrix Q as a product of elementary reflectors; if `UPLO = 'L'`, the diagonal and first subdiagonal of A are over- written by the corresponding elements of the tridiagonal matrix T, and the elements below the first subdiagonal, with the array `TAU`, represent the unitary matrix Q as a product of elementary reflectors. See Further Details.

#### LDA `[in]`

_INTEGER_

The leading dimension of the array A. $\mathrm{LDA} \ge \max (1,N)$.

#### AB `[out]`

_COMPLEX\*16 array, dimension (LDAB,N)_

On exit, the upper or lower triangle of the Hermitian band matrix A, stored in the first `KD`+1 rows of the array. The j-th column of A is stored in the j-th column of the array `AB` as follows: if `UPLO = 'U'`, `AB(kd+1+i-j,j) = A(i,j)` for $\max (1,j-\mathrm{kd}) \le i \le j$; if `UPLO = 'L'`, `AB(1+i-j,j) = A(i,j)` for $j \le i \le \min (n,j+\mathrm{kd})$.

#### LDAB `[in]`

_INTEGER_

The leading dimension of the array `AB`. $\mathrm{LDAB} \ge \mathrm{KD}+1$.

#### TAU `[out]`

_COMPLEX\*16 array, dimension (N-KD)_

The scalar factors of the elementary reflectors (see Further Details).

#### WORK `[out]`

_COMPLEX\*16 array, dimension (LWORK)_

On exit, if `INFO = 0`, or if `LWORK=-1`, `WORK(1)` returns the size of `LWORK`.

#### LWORK `[in]`

_INTEGER_

The dimension of the array `WORK` which should be calculated by a workspace query. `LWORK = MAX(1, LWORK_QUERY)` If `LWORK = -1`, then a workspace query is assumed; the routine only calculates the optimal size of the `WORK` array, returns this value as the first entry of the `WORK` array, and no error message related to `LWORK` is issued by XERBLA. $\mathrm{LWORK\_QUERY} = N \, \mathrm{KD} + N \, \max (\mathrm{KD},\mathrm{FACTOPTNB}) + 2 \, \mathrm{KD} \, \mathrm{KD}$ where FACTOPTNB is the blocking used by the QR or LQ algorithm, usually $\mathrm{FACTOPTNB}=128$ is a good choice otherwise putting `LWORK=-1` will provide the size of `WORK`.

#### INFO `[out]`

_INTEGER_

-   `= 0`: successful exit
-   `< 0`: if `INFO = -i`, the i-th argument had an illegal value

### Further Details

Implemented by Azzam Haidar.

All details are available on technical report, SC11, SC13 papers.

Azzam Haidar, Hatem Ltaief, and Jack Dongarra. Parallel reduction to condensed forms for symmetric eigenvalue problems using aggregated fine-grained and memory-aware kernels. In Proceedings of 2011 International Conference for High Performance Computing, Networking, Storage and Analysis (SC '11), New York, NY, USA, Article 8 , 11 pages. http://doi.acm.org/10.1145/2063384.2063394

A. Haidar, J. Kurzak, P. Luszczek, 2013. An improved parallel singular value algorithm and its implementation for multicore hardware, In Proceedings of 2013 International Conference for High Performance Computing, Networking, Storage and Analysis (SC '13). Denver, Colorado, USA, 2013. Article 90, 12 pages. http://doi.acm.org/10.1145/2503210.2503292

A. Haidar, R. Solca, S. Tomov, T. Schulthess and J. Dongarra. A novel hybrid CPU-GPU generalized eigensolver for electronic structure calculations based on fine-grained memory aware tasks. International Journal of High Performance Computing Applications. Volume 28 Issue 2, Pages 196-209, May 2014. http://hpc.sagepub.com/content/28/2/196

</section>

<!-- fortran-docs:end -->

<!-- Section for related `stdlib` packages. Do not manually edit this section, as it is automatically populated. -->

<section class="related">

</section>

<!-- /.related -->

<!-- Section for all links. Make sure to keep an empty line after the `section` element and another before the `/section` close. -->

<section class="links">

[@stdlib/array/complex128]: https://github.com/stdlib-js/array-complex128

</section>

<!-- /.links -->
