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
* Applies an elementary reflector from RZ factorization to a general matrix.
*
* @module @rreusser/blahpack/lapack/base/dlarz
*
* @example
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import dlarz from '@rreusser/blahpack/lapack/base/dlarz';
*
* var v = new Float64Array( [ 0.5, 0.25 ] );
* var C = new Float64Array( [ 1, 5, 9, 13, 2, 6, 10, 14, 3, 7, 11, 15, 4, 8, 12, 16 ] );
* var WORK = new Float64Array( 4 );
*
* dlarz( 'column-major', 'left', 4, 4, 2, v, 1, 1.5, C, 4, WORK, 1 );
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dlarz from './dlarz.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dlarz, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof dlarz & { ndarray: typeof ndarray }} */ ( dlarz );
export { ndarray };
