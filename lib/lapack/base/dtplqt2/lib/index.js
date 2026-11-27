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
* Computes LQ factorization of a triangular-pentagonal matrix using compact WY representation (unblocked).
*
* @module @rreusser/blahpack/lapack/base/dtplqt2
*
* @example
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import dtplqt2 from '@rreusser/blahpack/lapack/base/dtplqt2';
*
* var A = new Float64Array( [ 2.0, 0.5, 0.0, 3.0 ] );
* var B = new Float64Array( [ 1.0, 0.3, 0.5, 1.1 ] );
* var T = new Float64Array( 4 );
*
* dtplqt2( 'column-major', 2, 2, 0, A, 2, B, 2, T, 2 );
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dtplqt2 from './dtplqt2.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dtplqt2, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof dtplqt2 & { ndarray: typeof ndarray }} */ ( dtplqt2 );
export { ndarray };
