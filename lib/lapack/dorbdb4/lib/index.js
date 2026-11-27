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
* Simultaneously bidiagonalize the blocks of a tall and skinny matrix [X11; X21] with orthonormal columns (CSD-prep variant 4 — widest M1/M2 partition).
*
* ## Notes
*
* -   `dorbdb4` is one of four sister routines (`dorbdb1`/`dorbdb2`/`dorbdb3`/`dorbdb4`) that handle the four orientations of the input matrix in CS-decomposition reductions. `dorbdb4` is the variant for which `M-Q <= min(P, M-P, Q)` (i.e. the matrix has many columns relative to the row partition).
* -   The bidiagonal blocks `B11` and `B21` are stored implicitly via the angle arrays `THETA` (length `Q`) and `PHI` (length `Q-1`); each entry of the bidiagonal is a product of `sin`/`cos` of a `THETA` and a `PHI`. See [1] or `dorcsd` for details.
* -   `P1`, `P2`, and `Q1` are stored as products of elementary Householder reflectors; the reflector vectors live in the `X11`/`X21` blocks (and `PHANTOM` for the first-iteration synthesized direction) and the scalar factors live in `TAUP1`/`TAUP2`/`TAUQ1`.
*
*
* -   [1] Brian D. Sutton. _Computing the complete CS decomposition._ Numer. Algorithms, 50(1):33-65, 2009.
*
* @module @rreusser/blahpack/lapack/dorbdb4
*
* @example
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import dorbdb4 from '@rreusser/blahpack/lapack/dorbdb4';
*
* var X11 = new Float64Array( 24 );
* var X21 = new Float64Array( 24 );
* var THETA = new Float64Array( 6 );
* var PHI = new Float64Array( 5 );
* var TAUP1 = new Float64Array( 2 );
* var TAUP2 = new Float64Array( 2 );
* var TAUQ1 = new Float64Array( 6 );
* var PHANTOM = new Float64Array( 8 );
* var WORK = new Float64Array( 16 );
*
* dorbdb4( 'column-major', 8, 4, 6, X11, 4, X21, 4, THETA, 1, PHI, 1, TAUP1, 1, TAUP2, 1, TAUQ1, 1, PHANTOM, 1, WORK, 1 );
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dorbdb4 from './dorbdb4.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dorbdb4, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof dorbdb4 & { ndarray: typeof ndarray }} */ ( dorbdb4 );
export { ndarray };
