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

# zunbdb4

> Simultaneously bidiagonalize the blocks of a tall and skinny complex matrix `[X11; X21]` with orthonormal columns. Variant 4 of the `zunbdb1`-`zunbdb6` family — used when `M-Q` is the minimum dimension (the widest `M1`/`M2` partition).

<section class="usage">

## Usage

```javascript
var zunbdb4 = require( '@stdlib/lapack/base/zunbdb4' );
```

#### zunbdb4( order, M, P, Q, X11, LDX11, X21, LDX21, THETA, strideTHETA, PHI, stridePHI, TAUP1, strideTAUP1, TAUP2, strideTAUP2, TAUQ1, strideTAUQ1, PHANTOM, stridePHANTOM, WORK, strideWORK )

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

var X11 = new Complex128Array( 32 );
var X21 = new Complex128Array( 32 );
var THETA = new Float64Array( 6 );
var PHI = new Float64Array( 5 );
var TAUP1 = new Complex128Array( 2 );
var TAUP2 = new Complex128Array( 2 );
var TAUQ1 = new Complex128Array( 6 );
var PHANTOM = new Complex128Array( 8 );
var WORK = new Complex128Array( 16 );

zunbdb4( 'column-major', 8, 4, 6, X11, 8, X21, 8, THETA, 1, PHI, 1, TAUP1, 1, TAUP2, 1, TAUQ1, 1, PHANTOM, 1, WORK, 1 );
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **M**: total number of rows.
-   **P**: number of rows in `X11` (`P >= M-Q` and `M-P >= M-Q`).
-   **Q**: number of columns in `X11` and `X21` (`0 <= Q <= M` and `M-Q <= Q`).
-   **X11**: top block ([`Complex128Array`][@stdlib/array/complex128]). On exit, the lower triangle holds reflectors for `P1` and the strict upper triangle holds reflectors for `Q1`.
-   **LDX11**: leading dimension of `X11`.
-   **X21**: bottom block ([`Complex128Array`][@stdlib/array/complex128]). On exit, the lower triangle holds reflectors for `P2`.
-   **LDX21**: leading dimension of `X21`.
-   **THETA**: output array of length at least `Q` ([`Float64Array`][mdn-float64array]); CSD bidiagonal angles.
-   **strideTHETA**: stride length for `THETA`.
-   **PHI**: output array of length at least `Q-1` ([`Float64Array`][mdn-float64array]); CSD bidiagonal angles.
-   **stridePHI**: stride length for `PHI`.
-   **TAUP1**: output array of length at least `M-Q` ([`Complex128Array`][@stdlib/array/complex128]); Householder scalars for `P1`.
-   **strideTAUP1**: stride length for `TAUP1` (in complex elements).
-   **TAUP2**: output array of length at least `M-Q` ([`Complex128Array`][@stdlib/array/complex128]); Householder scalars for `P2`.
-   **strideTAUP2**: stride length for `TAUP2` (in complex elements).
-   **TAUQ1**: output array of length at least `Q` ([`Complex128Array`][@stdlib/array/complex128]); Householder scalars for `Q1`.
-   **strideTAUQ1**: stride length for `TAUQ1` (in complex elements).
-   **PHANTOM**: workspace and output of length at least `M` complex elements ([`Complex128Array`][@stdlib/array/complex128]). On exit, `PHANTOM[0..P-1]` and `PHANTOM[P..M-1]` hold the Householder vectors of the synthesized orthogonal direction.
-   **stridePHANTOM**: stride length for `PHANTOM` (in complex elements).
-   **WORK**: workspace of length at least `max(P-1, M-P-1, Q-1, Q)` complex elements ([`Complex128Array`][@stdlib/array/complex128]).
-   **strideWORK**: stride length for `WORK` (in complex elements).

The function returns `info` (0 on success).

#### zunbdb4.ndarray( M, P, Q, X11, strideX111, strideX112, offsetX11, X21, strideX211, strideX212, offsetX21, THETA, strideTHETA, offsetTHETA, PHI, stridePHI, offsetPHI, TAUP1, strideTAUP1, offsetTAUP1, TAUP2, strideTAUP2, offsetTAUP2, TAUQ1, strideTAUQ1, offsetTAUQ1, PHANTOM, stridePHANTOM, offsetPHANTOM, WORK, strideWORK, offsetWORK )

ndarray-style version with explicit per-dimension strides and offsets:

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Complex128Array = require( '@stdlib/array/complex128' );

var X11 = new Complex128Array( 32 );
var X21 = new Complex128Array( 32 );
var THETA = new Float64Array( 6 );
var PHI = new Float64Array( 5 );
var TAUP1 = new Complex128Array( 2 );
var TAUP2 = new Complex128Array( 2 );
var TAUQ1 = new Complex128Array( 6 );
var PHANTOM = new Complex128Array( 8 );
var WORK = new Complex128Array( 16 );

// Column-major X11 (4-by-6 with LDX11=8) and X21 (4-by-6 with LDX21=8): strideX111=1, strideX112=8.
zunbdb4.ndarray( 8, 4, 6, X11, 1, 8, 0, X21, 1, 8, 0, THETA, 1, 0, PHI, 1, 0, TAUP1, 1, 0, TAUP2, 1, 0, TAUQ1, 1, 0, PHANTOM, 1, 0, WORK, 1, 0 );
```

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `zunbdb4` is the CSD-prep variant where `M-Q` is the minimum dimension, meaning the matrix is "very tall" relative to the number of columns. Variants 1, 2, 3 handle the cases where `P`, `Q`, or `M-P` is the minimum dimension.
-   The bidiagonal blocks `B11`, `B21` are `(M-Q)`-by-`(M-Q)` and are represented implicitly by the angles `THETA(0..Q-1)` and `PHI(0..Q-2)`. Every entry of the bidiagonal band is a product of a sine or cosine of a `THETA` with a sine or cosine of a `PHI`.
-   `P1`, `P2`, `Q1` are unitary matrices represented as products of Householder reflectors. See `zuncsd2by1` for details on generating them via `zungqr` and `zunglq`.
-   The diagonal entries of `X11` and `X21` after reduction are real and non-negative (a property of `zlarfgp`), enabling `PHI` and `THETA` to be computed from `atan2` of real parts directly.
-   `PHANTOM` is an `M`-element scratch vector that, on the first iteration, holds a synthesized orthogonal direction constructed by `zunbdb5`. On exit, it stores the Householder vectors for that direction (split into top and bottom halves at index `P`).

</section>

<!-- /.notes -->

<section class="examples">

## Examples

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Complex128Array = require( '@stdlib/array/complex128' );
var zunbdb4 = require( '@stdlib/lapack/base/zunbdb4' );

// Build a small tall, skinny complex matrix [X11; X21] with orthonormal columns. M=4, P=2, Q=4: M-Q=0 so the phantom loop is skipped and only the two cleanup loops run.
var X11 = new Complex128Array( [
    1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0,
    0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
] );
var X21 = new Complex128Array( [
    0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
    1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0
] );

var THETA = new Float64Array( 4 );
var PHI = new Float64Array( 3 );
var TAUP1 = new Complex128Array( 1 );
var TAUP2 = new Complex128Array( 1 );
var TAUQ1 = new Complex128Array( 4 );
var PHANTOM = new Complex128Array( 4 );
var WORK = new Complex128Array( 8 );

zunbdb4( 'column-major', 4, 2, 4, X11, 2, X21, 2, THETA, 1, PHI, 1, TAUP1, 1, TAUP2, 1, TAUQ1, 1, PHANTOM, 1, WORK, 1 );

console.log( 'THETA =', Array.prototype.slice.call( THETA ) );
console.log( 'PHI   =', Array.prototype.slice.call( PHI ) );
```

</section>

<!-- /.examples -->

<!-- fortran-docs:start (generated by bin/fortran-docs.mjs from data/lapack-3.12.0/SRC/zunbdb4.f; do not edit) -->

<section class="fortran-docs">

## Reference notes

The mathematical description from the reference LAPACK 3.12.0 source of `ZUNBDB4`. Indices are the 1-based Fortran indices of the source.

### Purpose

ZUNBDB4 simultaneously bidiagonalizes the blocks of a tall and skinny matrix X with orthonormal columns:

$$
\begin{bmatrix} X_{11} \\ ----- \\ X_{21} \end{bmatrix} = \begin{bmatrix} P_{1} | \\ --------- \\ | P_{2} \end{bmatrix} \begin{bmatrix} B_{11} \\ 0 \\ ----- \\ B_{21} \\ 0 \end{bmatrix} Q_{1}^T
$$

`X11` is P-by-Q, and `X21` is (M-P)-by-Q. M-Q must be no larger than P, M-P, or Q. Routines ZUNBDB1, ZUNBDB2, and ZUNBDB3 handle cases in which M-Q is not the minimum dimension.

The unitary matrices P1, P2, and Q1 are P-by-P, (M-P)-by-(M-P), and (M-Q)-by-(M-Q), respectively. They are represented implicitly by Householder vectors.

B11 and B12 are (M-Q)-by-(M-Q) bidiagonal matrices represented implicitly by angles `THETA`, `PHI`.

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

[@stdlib/array/complex128]: https://github.com/stdlib-js/stdlib

</section>

<!-- /.links -->
