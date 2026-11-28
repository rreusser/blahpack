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
* Simultaneously bidiagonalize the blocks of a tall and skinny matrix `[X11; X21]` with orthonormal columns (variant 2 of the dorbdb1-6 family).
*
* ## Notes
*
* -   `dorbdb2` is one of four sister routines (`dorbdb1`/`dorbdb2`/`dorbdb3`/`dorbdb4`) that handle the four orientations of the input matrix in CS-decomposition reductions. `dorbdb2` is the variant for which `P <= min(M-P, Q, M-Q)` (i.e. `X11` is the "skinny" block).
* -   The bidiagonal blocks `B11` and `B21` are stored implicitly via the angle arrays `THETA` (length `Q`) and `PHI` (length `Q-1`); each entry of the bidiagonal is a product of `sin`/`cos` of a `THETA` and a `PHI`. See [1] or `dorcsd` for details.
* -   `P1`, `P2`, and `Q1` are stored as products of elementary Householder reflectors; the reflector vectors live in the `X11`/`X21` blocks and the scalar factors live in `TAUP1`/`TAUP2`/`TAUQ1`.
*
*
* -   [1] Brian D. Sutton. _Computing the complete CS decomposition._ Numer. Algorithms, 50(1):33-65, 2009.
*
* @module @rreusser/blahpack/lapack/dorbdb2
*
* @example
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import dorbdb2 from '@rreusser/blahpack/lapack/dorbdb2';
*
* var X11 = new Float64Array( 16 );
* var X21 = new Float64Array( 16 );
* var THETA = new Float64Array( 2 );
* var PHI = new Float64Array( 1 );
* var TAUP1 = new Float64Array( 1 );
* var TAUP2 = new Float64Array( 6 );
* var TAUQ1 = new Float64Array( 2 );
* var WORK = new Float64Array( 16 );
*
* dorbdb2( 'column-major', 8, 2, 2, X11, 2, X21, 6, THETA, 1, PHI, 1, TAUP1, 1, TAUP2, 1, TAUQ1, 1, WORK, 1 );
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dorbdb2 from './dorbdb2.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dorbdb2, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof dorbdb2 & { ndarray: typeof ndarray }} */ ( dorbdb2 );
export { ndarray };
