/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the BLAS 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/**
 * Computes the Euclidean norm of a real double-precision vector.
 *
 * Uses the "blue" algorithm for overflow/underflow-safe computation.
 *
 *
 * @param {NonNegativeInteger} N - number of indexed elements
 * @param {Float64Array} x - input array
 * @param {integer} stride - stride length
 * @param {NonNegativeInteger} offset - starting index
 * @returns {number} Euclidean norm
 */

/* eslint-disable max-len, max-params */

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes the Euclidean norm of a real double-precision vector.
*
* @param {NonNegativeInteger} N - number of indexed elements
* @param {Float64Array} x - input array
* @param {integer} stride - stride length
* @param {NonNegativeInteger} offset - starting index
* @throws {RangeError} first argument must be a nonnegative integer
* @returns {number} Euclidean norm
*/
function dnrm2( N, x, stride, offset ) {
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( N === 0 ) {
		return 0.0;
	}
	return base( N, x, stride, offset );
}


// EXPORTS //

export default dnrm2;
