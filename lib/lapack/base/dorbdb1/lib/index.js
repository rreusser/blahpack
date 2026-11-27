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
* Simultaneously bidiagonalize the blocks of a tall and skinny matrix with orthonormal columns.
*
* @module @rreusser/blahpack/lapack/base/dorbdb1
*
* @example
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import dorbdb1 from '@rreusser/blahpack/lapack/base/dorbdb1';
*
* var X11 = new Float64Array( 16 );
* var X21 = new Float64Array( 16 );
* var THETA = new Float64Array( 2 );
* var PHI = new Float64Array( 1 );
* var TAUP1 = new Float64Array( 4 );
* var TAUP2 = new Float64Array( 4 );
* var TAUQ1 = new Float64Array( 2 );
* var WORK = new Float64Array( 6 );
*
* dorbdb1( 'column-major', 8, 4, 2, X11, 4, X21, 4, THETA, 1, PHI, 1, TAUP1, 1, TAUP2, 1, TAUQ1, 1, WORK, 1 );
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dorbdb1 from './dorbdb1.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dorbdb1, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof dorbdb1 & { ndarray: typeof ndarray }} */ ( dorbdb1 );
export { ndarray };
