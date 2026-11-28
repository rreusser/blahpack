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
* Simultaneously bidiagonalizes the blocks of a tall and skinny matrix with orthonormal columns (variant 3 — `M-P` is the minimum dimension).
*
* ## Notes
*
* -   `dorbdb3` is one of four sister routines (`dorbdb1`/`dorbdb2`/`dorbdb3`/`dorbdb4`) that handle the four orientations of the input matrix in CS-decomposition reductions. `dorbdb3` is the variant for which `M-P <= min(P, Q, M-Q)` — the lower block `X21` is the smallest dimension (complementary to `dorbdb2`).
* -   The bidiagonal blocks `B11` and `B21` are `(M-P)`-by-`(M-P)` and stored implicitly via the angle arrays `THETA` (only entries `0..M-P-1` are written) and `PHI` (only entries `0..M-P-2` are written). After the bidiagonalization, the bottom-right `Q-(M-P)` columns of `X11` are reduced to the identity by additional Householder reflectors stored in `TAUP1[M-P..Q-1]`.
* -   `P1`, `P2`, and `Q1` are stored as products of elementary Householder reflectors; the reflector vectors live in the `X11`/`X21` blocks and the scalar factors live in `TAUP1`/`TAUP2`/`TAUQ1`.
*
*
* -   [1] Brian D. Sutton. _Computing the complete CS decomposition._ Numer. Algorithms, 50(1):33-65, 2009.
*
* @module @rreusser/blahpack/lapack/dorbdb3
*
* @example
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import dorbdb3 from '@rreusser/blahpack/lapack/dorbdb3';
*
* var X11 = new Float64Array( 16 );
* var X21 = new Float64Array( 16 );
* var THETA = new Float64Array( 4 );
* var PHI = new Float64Array( 3 );
* var TAUP1 = new Float64Array( 5 );
* var TAUP2 = new Float64Array( 3 );
* var TAUQ1 = new Float64Array( 4 );
* var WORK = new Float64Array( 8 );
*
* dorbdb3( 'column-major', 8, 5, 4, X11, 8, X21, 8, THETA, 1, PHI, 1, TAUP1, 1, TAUP2, 1, TAUQ1, 1, WORK, 1 );
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dorbdb3 from './dorbdb3.js';
import strided from './strided.js';


// MAIN //

setReadOnly( dorbdb3, 'strided', strided );


// EXPORTS //

export default /** @type {typeof dorbdb3 & { strided: typeof strided }} */ ( dorbdb3 );
export { strided };
