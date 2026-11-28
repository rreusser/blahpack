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
import strided from './strided.js';


// MAIN //

/**
* Computes all the singular values of a real upper bidiagonal matrix of.
*
* @param {NonNegativeInteger} N - number of rows and columns
* @param {Float64Array} d - input array
* @param {integer} strideD - `d` stride length
* @param {Float64Array} e - input array
* @param {integer} strideE - `e` stride length
* @param {(Float64Array|null)} WORK - input array
* @throws {RangeError} first argument must be a nonnegative integer
* @returns {integer} info status code
*/
function dlasq1( N, d, strideD, e, strideE, WORK ) {
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	const od = stride2offset( N, strideD );
	const oe = stride2offset( N, strideE );
	if ( WORK === null || WORK === void 0 ) {
		const minWork = Math.max( 1, 4 * N );
		WORK = new Float64Array( minWork );
	}
	return strided( N, d, strideD, od, e, strideE, oe, WORK, 1, 0 );
}


// EXPORTS //

export default dlasq1;
