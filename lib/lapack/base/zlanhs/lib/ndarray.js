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
 * Returns the value of the one norm, Frobenius norm, infinity norm, or.
 * max absolute value of an upper Hessenberg complex matrix.
 *
 *
 * @param {string} norm - `'max'`, `'one-norm'`, `'inf-norm'`, or `'frobenius'`
 * @param {NonNegativeInteger} N - order of the matrix
 * @param {Complex128Array} A - upper Hessenberg matrix
 * @param {integer} strideA1 - stride of the first dimension of A (in complex elements)
 * @param {integer} strideA2 - stride of the second dimension of A (in complex elements)
 * @param {NonNegativeInteger} offsetA - starting index for A (in complex elements)
 * @param {Float64Array} WORK - workspace (length >= N, used for inf-norm only, real)
 * @param {integer} strideWork - stride for WORK
 * @param {NonNegativeInteger} offsetWork - starting index for WORK
 * @returns {number} matrix norm value
 */

/* eslint-disable max-len, max-params */

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Returns the value of the one norm, Frobenius norm, infinity norm, or.
*
* @param {string} norm - `'max'`, `'one-norm'`, `'inf-norm'`, or `'frobenius'`
* @param {NonNegativeInteger} N - order of the matrix
* @param {Complex128Array} A - upper Hessenberg matrix
* @param {integer} strideA1 - stride of the first dimension of A (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (in complex elements)
* @param {Float64Array} WORK - workspace (length >= N, used for inf-norm only, real)
* @param {integer} strideWork - stride for WORK
* @param {NonNegativeInteger} offsetWork - starting index for WORK
* @throws {TypeError} first argument must be a valid norm type
* @throws {RangeError} second argument must be a nonnegative integer
* @returns {number} matrix norm value
*/
function zlanhs( norm, N, A, strideA1, strideA2, offsetA, WORK, strideWork, offsetWork ) {
	var need;
	if ( norm !== 'one-norm' && norm !== 'inf-norm' && norm !== 'max' && norm !== 'frobenius' ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid norm type. Value: `%s`.', norm ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( N === 0 ) {
		return 0.0;
	}
	// Caller owns the workspace; assert it is a sufficiently large array so an
	// under-sized (or non-array) buffer is a loud RangeError, not a silent NaN.
	// Only the inf-norm path uses WORK (length >= N); other norms use none.
	if ( norm === 'inf-norm' && N > 0 ) {
		need = N;
		if ( !WORK || ( WORK.length - offsetWork ) < need ) {
			throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', need, offsetWork, ( WORK ) ? WORK.length : 0 ) ); // eslint-disable-line max-len
		}
	}
	return base( norm, N, A, strideA1, strideA2, offsetA, WORK, strideWork, offsetWork );
}


// EXPORTS //

export default zlanhs;
