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
* Simultaneously bidiagonalize the blocks of a tall and skinny complex matrix with orthonormal columns.
*
* ## Notes
*
* -   `zunbdb1` is one of four sister routines (`zunbdb1`/`zunbdb2`/`zunbdb3`/`zunbdb4`) that handle the four orientations of the input matrix in CS-decomposition reductions. `zunbdb1` is the variant for which `Q <= min(P, M-P, M-Q)` (i.e. the input is "tall enough" in both block directions).
* -   The bidiagonal blocks `B11` and `B21` are stored implicitly via the real angle arrays `THETA` (length `Q`) and `PHI` (length `Q-1`); each entry of the bidiagonal is a product of `sin`/`cos` of a `THETA` and a `PHI`. See [1] or `zuncsd` for details.
* -   `P1`, `P2`, and `Q1` are stored as products of elementary Householder reflectors; the reflector vectors live in the `X11`/`X21` blocks and the complex scalar factors live in `TAUP1`/`TAUP2`/`TAUQ1`.
*
*
* -   [1] Brian D. Sutton. _Computing the complete CS decomposition._ Numer. Algorithms, 50(1):33-65, 2009.
*
* @module @rreusser/blahpack/lapack/zunbdb1
*
* @example
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import Complex128Array from '@stdlib/array/complex128/lib/index.js';
* import zunbdb1 from '@rreusser/blahpack/lapack/zunbdb1';
*
* var X11 = new Complex128Array( 16 );
* var X21 = new Complex128Array( 16 );
* var THETA = new Float64Array( 2 );
* var PHI = new Float64Array( 1 );
* var TAUP1 = new Complex128Array( 4 );
* var TAUP2 = new Complex128Array( 4 );
* var TAUQ1 = new Complex128Array( 2 );
* var WORK = new Complex128Array( 6 );
*
* zunbdb1( 'column-major', 8, 4, 2, X11, 4, X21, 4, THETA, 1, PHI, 1, TAUP1, 1, TAUP2, 1, TAUQ1, 1, WORK, 1 );
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zunbdb1 from './zunbdb1.js';
import strided from './strided.js';


// MAIN //

setReadOnly( zunbdb1, 'strided', strided );


// EXPORTS //

export default /** @type {typeof zunbdb1 & { strided: typeof strided }} */ ( zunbdb1 );
export { strided };
