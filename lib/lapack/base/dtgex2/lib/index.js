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
* Swaps adjacent diagonal 1-by-1 or 2-by-2 blocks in an upper (quasi) triangular matrix pair.
*
* @module @rreusser/blahpack/lapack/base/dtgex2
*
* @example
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import dtgex2 from '@rreusser/blahpack/lapack/base/dtgex2';
*
* var A = new Float64Array( [ 1.0, 0.0, 0.5, 2.0 ] );
* var B = new Float64Array( [ 1.0, 0.0, 0.2, 1.5 ] );
* var Q = new Float64Array( [ 1, 0, 0, 1 ] );
* var Z = new Float64Array( [ 1, 0, 0, 1 ] );
* var WORK = new Float64Array( 20 );
*
* var info = dtgex2( 'column-major', true, true, 2, A, 2, B, 2, Q, 2, Z, 2, 0, 1, 1, WORK, 1, 20 );
* // returns 0
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dtgex2 from './dtgex2.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dtgex2, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof dtgex2 & { ndarray: typeof ndarray }} */ ( dtgex2 );
export { ndarray };
