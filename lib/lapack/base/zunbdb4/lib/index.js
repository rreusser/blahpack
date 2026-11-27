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
* Simultaneously bidiagonalizes the blocks of a tall and skinny complex matrix `[X11; X21]` with orthonormal columns (CSD-prep variant 4 — widest `M1`/`M2` partition).
*
* ## Notes
*
* -   `zunbdb4` is the CSD-prep variant where `M-Q` is the minimum dimension, meaning the matrix is "very tall" relative to the number of columns. Variants 1, 2, 3 handle the cases where `P`, `Q`, or `M-P` is the minimum dimension.
* -   The bidiagonal blocks `B11`, `B21` are `(M-Q)`-by-`(M-Q)` and are represented implicitly by the angles `THETA(0..Q-1)` and `PHI(0..Q-2)`. Every entry of the bidiagonal band is a product of a sine or cosine of a `THETA` with a sine or cosine of a `PHI`.
* -   `P1`, `P2`, `Q1` are unitary matrices represented as products of Householder reflectors. See `zuncsd2by1` for details on generating them via `zungqr` and `zunglq`.
* -   The diagonal entries of `X11` and `X21` after reduction are real and non-negative (a property of `zlarfgp`), enabling `PHI` and `THETA` to be computed from `atan2` of real parts directly.
* -   `PHANTOM` is an `M`-element scratch vector that, on the first iteration, holds a synthesized orthogonal direction constructed by `zunbdb5`. On exit, it stores the Householder vectors for that direction (split into top and bottom halves at index `P`).
*
* @module @rreusser/blahpack/lapack/base/zunbdb4
*
* @example
* import Complex128Array from '@stdlib/array/complex128/lib/index.js';
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import zunbdb4 from '@rreusser/blahpack/lapack/base/zunbdb4';
*
* var X11 = new Complex128Array( 32 );
* var X21 = new Complex128Array( 32 );
* var THETA = new Float64Array( 6 );
* var PHI = new Float64Array( 5 );
* var TAUP1 = new Complex128Array( 2 );
* var TAUP2 = new Complex128Array( 2 );
* var TAUQ1 = new Complex128Array( 6 );
* var PHANTOM = new Complex128Array( 8 );
* var WORK = new Complex128Array( 16 );
*
* zunbdb4( 'column-major', 8, 4, 6, X11, 8, X21, 8, THETA, 1, PHI, 1, TAUP1, 1, TAUP2, 1, TAUQ1, 1, PHANTOM, 1, WORK, 1 );
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zunbdb4 from './zunbdb4.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zunbdb4, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof zunbdb4 & { ndarray: typeof ndarray }} */ ( zunbdb4 );
export { ndarray };
