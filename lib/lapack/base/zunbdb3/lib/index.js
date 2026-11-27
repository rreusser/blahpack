/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/**
* Simultaneously bidiagonalizes the blocks of a tall and skinny complex matrix `[X11; X21]` with orthonormal columns (variant 3 — `M-P` is the minimum dimension).
*
* ## Notes
*
* -   The bidiagonal blocks `B11`, `B21` are represented implicitly by the angles `THETA(1..M-P)` and `PHI(1..M-P-1)`. Every entry of the bidiagonal band is a product of a sine or cosine of a `THETA` with a sine or cosine of a `PHI`.
* -   `P1`, `P2`, `Q1` are unitary matrices represented as products of Householder reflectors. See `zuncsd2by1` for details on generating them via `zungqr` and `zunglq`.
* -   The diagonal entries of `X11` and `X21` after reduction are real-and-non-negative (a property of `zlarfgp`), enabling `PHI` and `THETA` to be computed from `atan2` of real parts directly.
*
* @module @rreusser/blahpack/lapack/base/zunbdb3
*
* @example
* import Complex128Array from '@stdlib/array/complex128/lib/index.js';
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import zunbdb3 from '@rreusser/blahpack/lapack/base/zunbdb3';
*
* var X11 = new Complex128Array( 16 );
* var X21 = new Complex128Array( 16 );
* var THETA = new Float64Array( 4 );
* var PHI = new Float64Array( 3 );
* var TAUP1 = new Complex128Array( 5 );
* var TAUP2 = new Complex128Array( 3 );
* var TAUQ1 = new Complex128Array( 4 );
* var WORK = new Complex128Array( 8 );
*
* zunbdb3( 'column-major', 8, 5, 4, X11, 8, X21, 8, THETA, 1, PHI, 1, TAUP1, 1, TAUP2, 1, TAUQ1, 1, WORK, 1 );
*/


// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "zunbdb3.ndarray" }
