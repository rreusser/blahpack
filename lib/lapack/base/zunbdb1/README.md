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

# zunbdb1

> Simultaneously bidiagonalize the blocks of a tall and skinny complex matrix `[X11; X21]` with orthonormal columns. Used as a building block in the CS Decomposition (CSD).

<section class="usage">

## Usage

```javascript
var zunbdb1 = require( '@stdlib/lapack/base/zunbdb1' );
```

#### zunbdb1( order, M, P, Q, X11, LDX11, X21, LDX21, THETA, strideTHETA, PHI, stridePHI, TAUP1, strideTAUP1, TAUP2, strideTAUP2, TAUQ1, strideTAUQ1, WORK, strideWORK )

Reduces the tall and skinny complex matrix `[X11; X21]` (with orthonormal columns) to upper bidiagonal form via Householder reflectors:

```text
                          [ B11 ]
   [ X11 ]   [ P1 |    ] [  0  ]
   [-----] = [---------] [-----] Q1**H
   [ X21 ]   [    | P2 ] [ B21 ]
                          [  0  ]
```

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Complex128Array = require( '@stdlib/array/complex128' );
var reinterpret = require( '@stdlib/strided/base/reinterpret-complex128' );

var sq2 = 1.0 / Math.sqrt( 2.0 );
var X11 = new Complex128Array( 4 );
var X21 = new Complex128Array( 4 );
var v11 = reinterpret( X11, 0 );
var v21 = reinterpret( X21, 0 );
v11[ 0 ] = sq2; v11[ 6 ] = sq2;
v21[ 0 ] = sq2; v21[ 6 ] = sq2;

var THETA = new Float64Array( 2 );
var PHI = new Float64Array( 1 );
var TAUP1 = new Complex128Array( 2 );
var TAUP2 = new Complex128Array( 2 );
var TAUQ1 = new Complex128Array( 2 );
var WORK = new Complex128Array( 2 );

zunbdb1( 'column-major', 4, 2, 2, X11, 2, X21, 2, THETA, 1, PHI, 1, TAUP1, 1, TAUP2, 1, TAUQ1, 1, WORK, 1 );
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **M**: total number of rows.
-   **P**: number of rows in `X11` (`0 <= P <= M`).
-   **Q**: number of columns in `X11` and `X21` (`0 <= Q <= min(P, M-P, M-Q)`).
-   **X11**: top block (`Complex128Array`). On exit, the lower triangle holds reflectors for `P1` and the strict upper triangle holds reflectors for `Q1`.
-   **LDX11**: leading dimension of `X11`.
-   **X21**: bottom block (`Complex128Array`). On exit, the lower triangle holds reflectors for `P2`.
-   **LDX21**: leading dimension of `X21`.
-   **THETA**: real output array of length at least `Q` ([`Float64Array`][mdn-float64array]); CSD bidiagonal angles.
-   **strideTHETA**: stride length for `THETA`.
-   **PHI**: real output array of length at least `Q-1` ([`Float64Array`][mdn-float64array]); CSD bidiagonal angles.
-   **stridePHI**: stride length for `PHI`.
-   **TAUP1**: output array of length at least `P` (`Complex128Array`); Householder scalars for `P1`.
-   **strideTAUP1**: stride length for `TAUP1`.
-   **TAUP2**: output array of length at least `M-P` (`Complex128Array`); Householder scalars for `P2`.
-   **strideTAUP2**: stride length for `TAUP2`.
-   **TAUQ1**: output array of length at least `Q` (`Complex128Array`); Householder scalars for `Q1`.
-   **strideTAUQ1**: stride length for `TAUQ1`.
-   **WORK**: workspace of length at least `M-Q` (`Complex128Array`).
-   **strideWORK**: stride length for `WORK`.

#### zunbdb1.ndarray( M, P, Q, X11, strideX111, strideX112, offsetX11, X21, strideX211, strideX212, offsetX21, THETA, strideTHETA, offsetTHETA, PHI, stridePHI, offsetPHI, TAUP1, strideTAUP1, offsetTAUP1, TAUP2, strideTAUP2, offsetTAUP2, TAUQ1, strideTAUQ1, offsetTAUQ1, WORK, strideWORK, offsetWORK )

Same as `zunbdb1` above, but with explicit per-array stride and offset parameters in place of the `order`/`LDX` layout convention.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Complex128Array = require( '@stdlib/array/complex128' );

var X11 = new Complex128Array( 16 );
var X21 = new Complex128Array( 16 );
var THETA = new Float64Array( 2 );
var PHI = new Float64Array( 1 );
var TAUP1 = new Complex128Array( 4 );
var TAUP2 = new Complex128Array( 4 );
var TAUQ1 = new Complex128Array( 2 );
var WORK = new Complex128Array( 6 );

zunbdb1.ndarray( 8, 4, 0, X11, 1, 4, 0, X21, 1, 4, 0, THETA, 1, 0, PHI, 1, 0, TAUP1, 1, 0, TAUP2, 1, 0, TAUQ1, 1, 0, WORK, 1, 0 );
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

-   `zunbdb1` is one of four sister routines (`zunbdb1`/`zunbdb2`/`zunbdb3`/`zunbdb4`) that handle the four orientations of the input matrix in CS-decomposition reductions. `zunbdb1` is the variant for which `Q <= min(P, M-P, M-Q)` (i.e. the input is "tall enough" in both block directions).
-   The bidiagonal blocks `B11` and `B21` are stored implicitly via the real angle arrays `THETA` (length `Q`) and `PHI` (length `Q-1`); each entry of the bidiagonal is a product of `sin`/`cos` of a `THETA` and a `PHI`. See [1] or `zuncsd` for details.
-   `P1`, `P2`, and `Q1` are stored as products of elementary Householder reflectors; the reflector vectors live in the `X11`/`X21` blocks and the complex scalar factors live in `TAUP1`/`TAUP2`/`TAUQ1`.

## References

-   [1] Brian D. Sutton. _Computing the complete CS decomposition._ Numer. Algorithms, 50(1):33-65, 2009.

</section>

<!-- /.notes -->

<section class="examples">

## Examples

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Complex128Array = require( '@stdlib/array/complex128' );
var reinterpret = require( '@stdlib/strided/base/reinterpret-complex128' );
var zunbdb1 = require( '@stdlib/lapack/base/zunbdb1' );

var sq2 = 1.0 / Math.sqrt( 2.0 );
var X11 = new Complex128Array( 4 );
var X21 = new Complex128Array( 4 );
var v11 = reinterpret( X11, 0 );
var v21 = reinterpret( X21, 0 );
v11[ 0 ] = sq2; v11[ 6 ] = sq2;
v21[ 0 ] = sq2; v21[ 6 ] = sq2;

var THETA = new Float64Array( 2 );
var PHI = new Float64Array( 1 );
var TAUP1 = new Complex128Array( 2 );
var TAUP2 = new Complex128Array( 2 );
var TAUQ1 = new Complex128Array( 2 );
var WORK = new Complex128Array( 2 );

zunbdb1( 'column-major', 4, 2, 2, X11, 2, X21, 2, THETA, 1, PHI, 1, TAUP1, 1, TAUP2, 1, TAUQ1, 1, WORK, 1 );
console.log( THETA );
console.log( PHI );
```

</section>

<!-- /.examples -->

<!-- fortran-docs:start (generated by bin/fortran-docs.mjs from data/lapack-3.12.0/SRC/zunbdb1.f; do not edit) -->

<section class="fortran-docs">

## Reference notes

The mathematical description from the reference LAPACK 3.12.0 source of `ZUNBDB1`. Indices are the 1-based Fortran indices of the source.

### Purpose

ZUNBDB1 simultaneously bidiagonalizes the blocks of a tall and skinny matrix X with orthonormal columns:

$$
\begin{bmatrix} X_{11} \\ ----- \\ X_{21} \end{bmatrix} = \begin{bmatrix} P_{1} | \\ --------- \\ | P_{2} \end{bmatrix} \begin{bmatrix} B_{11} \\ 0 \\ ----- \\ B_{21} \\ 0 \end{bmatrix} Q_{1}^T
$$

`X11` is P-by-Q, and `X21` is (M-P)-by-Q. Q must be no larger than P, M-P, or M-Q. Routines ZUNBDB2, ZUNBDB3, and ZUNBDB4 handle cases in which Q is not the minimum dimension.

The unitary matrices P1, P2, and Q1 are P-by-P, (M-P)-by-(M-P), and (M-Q)-by-(M-Q), respectively. They are represented implicitly by Householder vectors.

B11 and B12 are Q-by-Q bidiagonal matrices represented implicitly by angles `THETA`, `PHI`.

### Further Details

The upper-bidiagonal blocks B11, B21 are represented implicitly by angles `THETA(1)`, ..., `THETA(Q)` and `PHI(1)`, ..., `PHI(Q-1)`. Every entry in each bidiagonal band is a product of a sine or cosine of a `THETA` with a sine or cosine of a `PHI`. See \[1\] or ZUNCSD for details.

P1, P2, and Q1 are represented as products of elementary reflectors. See ZUNCSD2BY1 for details on generating P1, P2, and Q1 using ZUNGQR and ZUNGLQ.

### References

\[1\] Brian D. Sutton. Computing the complete CS decomposition. Numer.

Algorithms, 50(1):33-65, 2009.

</section>

<!-- fortran-docs:end -->

<!-- Section for related `stdlib` packages. Do not manually edit this section, as it is automatically populated. -->

<section class="related">

</section>

<!-- /.related -->

<!-- Section for all links. Make sure to keep an empty line after the `section` element and another before the `/section` close. -->

<section class="links">

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

</section>

<!-- /.links -->
