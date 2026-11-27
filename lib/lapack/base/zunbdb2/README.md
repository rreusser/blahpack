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

# zunbdb2

> Simultaneously bidiagonalize the blocks of a tall and skinny complex matrix `[X11; X21]` with orthonormal columns. Variant 2 of the zunbdb1-4 family handles the case `P <= min(M-P, Q, M-Q)`.

<section class="usage">

## Usage

```javascript
var zunbdb2 = require( '@stdlib/lapack/base/zunbdb2' );
```

#### zunbdb2( order, M, P, Q, X11, LDX11, X21, LDX21, THETA, strideTHETA, PHI, stridePHI, TAUP1, strideTAUP1, TAUP2, strideTAUP2, TAUQ1, strideTAUQ1, WORK, strideWORK )

Reduces the tall and skinny complex matrix `[X11; X21]` (with orthonormal columns) to upper bidiagonal form via complex Householder reflectors:

```text
                          [ B11 ]
   [ X11 ]   [ P1 |    ] [  0  ]
   [-----] = [---------] [-----] Q1**H
   [ X21 ]   [    | P2 ] [ B21 ]
                          [  0  ]
```

```javascript
var Complex128Array = require( '@stdlib/array/complex128' );
var Float64Array = require( '@stdlib/array/float64' );

var sq2 = 1.0 / Math.sqrt( 2.0 );
var X11 = new Complex128Array( [ sq2, 0.0, 0.0, 0.0, 0.0, 0.0, sq2, 0.0 ] );
var X21 = new Complex128Array( 12 );
X21.set( [ sq2, 0.0 ], 0 );
X21.set( [ sq2, 0.0 ], 9 );
var THETA = new Float64Array( 2 );
var PHI = new Float64Array( 1 );
var TAUP1 = new Complex128Array( 1 );
var TAUP2 = new Complex128Array( 6 );
var TAUQ1 = new Complex128Array( 2 );
var WORK = new Complex128Array( 16 );

zunbdb2( 'column-major', 8, 2, 2, X11, 2, X21, 6, THETA, 1, PHI, 1, TAUP1, 1, TAUP2, 1, TAUQ1, 1, WORK, 1 );
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **M**: total number of rows.
-   **P**: number of rows in `X11` (`0 <= P <= min(M-P, Q, M-Q)`).
-   **Q**: number of columns in `X11` and `X21` (`0 <= Q <= M`).
-   **X11**: top block ([`Complex128Array`][mdn-complex128array]). On exit, the lower triangle holds reflectors for `P1` and the strict upper triangle holds reflectors for `Q1`.
-   **LDX11**: leading dimension of `X11`.
-   **X21**: bottom block ([`Complex128Array`][mdn-complex128array]). On exit, the lower triangle holds reflectors for `P2`.
-   **LDX21**: leading dimension of `X21`.
-   **THETA**: output array of length at least `Q` ([`Float64Array`][mdn-float64array]); CSD bidiagonal angles.
-   **strideTHETA**: stride length for `THETA`.
-   **PHI**: output array of length at least `Q-1` ([`Float64Array`][mdn-float64array]); CSD bidiagonal angles.
-   **stridePHI**: stride length for `PHI`.
-   **TAUP1**: output array of length at least `P-1` ([`Complex128Array`][mdn-complex128array]); Householder scalars for `P1`.
-   **strideTAUP1**: stride length for `TAUP1`.
-   **TAUP2**: output array of length at least `Q` ([`Complex128Array`][mdn-complex128array]); Householder scalars for `P2`.
-   **strideTAUP2**: stride length for `TAUP2`.
-   **TAUQ1**: output array of length at least `Q` ([`Complex128Array`][mdn-complex128array]); Householder scalars for `Q1`.
-   **strideTAUQ1**: stride length for `TAUQ1`.
-   **WORK**: workspace of length at least `max(P-1, M-P, Q-1)` ([`Complex128Array`][mdn-complex128array]).
-   **strideWORK**: stride length for `WORK`.

#### zunbdb2.ndarray( M, P, Q, X11, strideX111, strideX112, offsetX11, X21, strideX211, strideX212, offsetX21, THETA, strideTHETA, offsetTHETA, PHI, stridePHI, offsetPHI, TAUP1, strideTAUP1, offsetTAUP1, TAUP2, strideTAUP2, offsetTAUP2, TAUQ1, strideTAUQ1, offsetTAUQ1, WORK, strideWORK, offsetWORK )

Same as `zunbdb2` above, but with explicit per-array stride and offset parameters in place of the `order`/`LDX` layout convention.

```javascript
var Complex128Array = require( '@stdlib/array/complex128' );
var Float64Array = require( '@stdlib/array/float64' );

var X11 = new Complex128Array( 16 );
var X21 = new Complex128Array( 16 );
var THETA = new Float64Array( 2 );
var PHI = new Float64Array( 1 );
var TAUP1 = new Complex128Array( 1 );
var TAUP2 = new Complex128Array( 6 );
var TAUQ1 = new Complex128Array( 2 );
var WORK = new Complex128Array( 16 );

zunbdb2.ndarray( 8, 2, 2, X11, 1, 2, 0, X21, 1, 6, 0, THETA, 1, 0, PHI, 1, 0, TAUP1, 1, 0, TAUP2, 1, 0, TAUQ1, 1, 0, WORK, 1, 0 );
```

The function has the following additional parameters:

-   **strideX111**: stride of dimension 1 of `X11`.
-   **strideX112**: stride of dimension 2 of `X11`.
-   **offsetX11**: starting index for `X11`.
-   **strideX211**: stride of dimension 1 of `X21`.
-   **strideX212**: stride of dimension 2 of `X21`.
-   **offsetX21**: starting index for `X21`.
-   **offsetTHETA**: starting index for `THETA`.
-   **offsetPHI**: starting index for `PHI`.
-   **offsetTAUP1**: starting index for `TAUP1`.
-   **offsetTAUP2**: starting index for `TAUP2`.
-   **offsetTAUQ1**: starting index for `TAUQ1`.
-   **offsetWORK**: starting index for `WORK`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `zunbdb2` is one of four sister routines (`zunbdb1`/`zunbdb2`/`zunbdb3`/`zunbdb4`) that handle the four orientations of the input matrix in CS-decomposition reductions. `zunbdb2` is the variant for which `P <= min(M-P, Q, M-Q)` (i.e. `X11` is the "skinny" block).
-   The bidiagonal blocks `B11` and `B21` are real, stored implicitly via the angle arrays `THETA` (length `Q`) and `PHI` (length `Q-1`); each entry of the bidiagonal is a product of `sin`/`cos` of a `THETA` and a `PHI`. See [1] or `zuncsd` for details.
-   `P1`, `P2`, and `Q1` are stored as products of complex elementary Householder reflectors; the reflector vectors live in the `X11`/`X21` blocks and the scalar factors live in `TAUP1`/`TAUP2`/`TAUQ1`.

## References

-   [1] Brian D. Sutton. _Computing the complete CS decomposition._ Numer. Algorithms, 50(1):33-65, 2009.

</section>

<!-- /.notes -->

<section class="examples">

## Examples

```javascript
var Complex128Array = require( '@stdlib/array/complex128' );
var Float64Array = require( '@stdlib/array/float64' );
var zunbdb2 = require( '@stdlib/lapack/base/zunbdb2' );

var sq2 = 1.0 / Math.sqrt( 2.0 );
var X11 = new Complex128Array( [ sq2, 0.0, 0.0, 0.0, 0.0, 0.0, sq2, 0.0 ] );
var X21 = new Complex128Array( 12 );
X21.set( [ sq2, 0.0 ], 0 );
X21.set( [ sq2, 0.0 ], 9 );
var THETA = new Float64Array( 2 );
var PHI = new Float64Array( 1 );
var TAUP1 = new Complex128Array( 1 );
var TAUP2 = new Complex128Array( 6 );
var TAUQ1 = new Complex128Array( 2 );
var WORK = new Complex128Array( 16 );

zunbdb2( 'column-major', 8, 2, 2, X11, 2, X21, 6, THETA, 1, PHI, 1, TAUP1, 1, TAUP2, 1, TAUQ1, 1, WORK, 1 );
console.log( THETA );
console.log( PHI );
```

</section>

<!-- /.examples -->

<!-- fortran-docs:start (generated by bin/fortran-docs.mjs from data/lapack-3.12.0/SRC/zunbdb2.f; do not edit) -->

<section class="fortran-docs">

## Reference documentation

From the reference LAPACK 3.12.0 source of `ZUNBDB2`, converted to Markdown with KaTeX math. Indices are the 1-based Fortran indices of the source.

### Purpose

ZUNBDB2 simultaneously bidiagonalizes the blocks of a tall and skinny matrix X with orthonormal columns:

$$
\begin{bmatrix} X_{11} \\ ----- \\ X_{21} \end{bmatrix} = \begin{bmatrix} P_{1} | \\ --------- \\ | P_{2} \end{bmatrix} \begin{bmatrix} B_{11} \\ 0 \\ ----- \\ B_{21} \\ 0 \end{bmatrix} Q_{1}^T
$$

`X11` is P-by-Q, and `X21` is (M-P)-by-Q. P must be no larger than M-P, Q, or M-Q. Routines ZUNBDB1, ZUNBDB3, and ZUNBDB4 handle cases in which P is not the minimum dimension.

The unitary matrices P1, P2, and Q1 are P-by-P, (M-P)-by-(M-P), and (M-Q)-by-(M-Q), respectively. They are represented implicitly by Householder vectors.

B11 and B12 are P-by-P bidiagonal matrices represented implicitly by angles `THETA`, `PHI`.

### Arguments

#### M `[in]`

_INTEGER_

The number of rows `X11` plus the number of rows in `X21`.

#### P `[in]`

_INTEGER_

The number of rows in `X11`. $0 \le P \le \min (M-P,Q,M-Q)$.

#### Q `[in]`

_INTEGER_

The number of columns in `X11` and `X21`. $0 \le Q \le M$.

#### X11 `[in,out]`

_COMPLEX\*16 array, dimension (LDX11,Q)_

On entry, the top block of the matrix X to be reduced. On exit, the columns of tril(`X11`) specify reflectors for P1 and the rows of triu(`X11`,1) specify reflectors for Q1.

#### LDX11 `[in]`

_INTEGER_

The leading dimension of `X11`. $\mathrm{LDX11} \ge P$.

#### X21 `[in,out]`

_COMPLEX\*16 array, dimension (LDX21,Q)_

On entry, the bottom block of the matrix X to be reduced. On exit, the columns of tril(`X21`) specify reflectors for P2.

#### LDX21 `[in]`

_INTEGER_

The leading dimension of `X21`. $\mathrm{LDX21} \ge M-P$.

#### THETA `[out]`

_DOUBLE PRECISION array, dimension (Q)_

The entries of the bidiagonal blocks B11, B21 are defined by `THETA` and `PHI`. See Further Details.

#### PHI `[out]`

_DOUBLE PRECISION array, dimension (Q-1)_

The entries of the bidiagonal blocks B11, B21 are defined by `THETA` and `PHI`. See Further Details.

#### TAUP1 `[out]`

_COMPLEX\*16 array, dimension (P-1)_

The scalar factors of the elementary reflectors that define P1.

#### TAUP2 `[out]`

_COMPLEX\*16 array, dimension (Q)_

The scalar factors of the elementary reflectors that define P2.

#### TAUQ1 `[out]`

_COMPLEX\*16 array, dimension (Q)_

The scalar factors of the elementary reflectors that define Q1.

#### WORK `[out]`

_COMPLEX\*16 array, dimension (LWORK)_

#### LWORK `[in]`

_INTEGER_

The dimension of the array `WORK`. $\mathrm{LWORK} \ge M-Q$.

If `LWORK = -1`, then a workspace query is assumed; the routine only calculates the optimal size of the `WORK` array, returns this value as the first entry of the `WORK` array, and no error message related to `LWORK` is issued by XERBLA.

#### INFO `[out]`

_INTEGER_

-   `= 0`: successful exit.
-   `< 0`: if `INFO = -i`, the i-th argument had an illegal value.

### Further Details

The upper-bidiagonal blocks B11, B21 are represented implicitly by angles `THETA(1)`, ..., `THETA(Q)` and `PHI(1)`, ..., `PHI(Q-1)`. Every entry in each bidiagonal band is a product of a sine or cosine of a `THETA` with a sine or cosine of a `PHI`. See \[1\] or ZUNCSD for details.

P1, P2, and Q1 are represented as products of elementary reflectors. See ZUNCSD2BY1 for details on generating P1, P2, and Q1 using ZUNGQR and ZUNGLQ.

</section>

<!-- fortran-docs:end -->

<!-- Section for related `stdlib` packages. Do not manually edit this section, as it is automatically populated. -->

<section class="related">

</section>

<!-- /.related -->

<!-- Section for all links. Make sure to keep an empty line after the `section` element and another before the `/section` close. -->

<section class="links">

[mdn-complex128array]: https://github.com/stdlib-js/array-complex128
[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

</section>

<!-- /.links -->
