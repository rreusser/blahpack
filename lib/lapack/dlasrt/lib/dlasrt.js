/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable max-len, max-params */

// MODULES //

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Sort an array of doubles in increasing or decreasing order using quicksort.
*
* @param {('increasing'|'decreasing')} id - sort direction: 'increasing' or 'decreasing'
* @param {NonNegativeInteger} N - number of elements to sort
* @param {Float64Array} d - input array
* @param {integer} strideD - `d` stride length
* @throws {TypeError} first argument must be one of the following: "decreasing", "increasing"
* @throws {RangeError} second argument must be a nonnegative integer
* @throws {TypeError} if a string argument is not a valid option
* @returns {integer} info status code
*/
function dlasrt( id, N, d, strideD ) {
	if ( id !== 'decreasing' && id !== 'increasing' ) {
		throw new TypeError( format( 'invalid argument. First argument must be one of the following: "decreasing", "increasing". Value: `%s`.', id ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	const od = stride2offset( N, strideD );
	return base( id, N, d, strideD, od );
}


// EXPORTS //

export default dlasrt;
