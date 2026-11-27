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
