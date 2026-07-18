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
* Computes all the singular values of a real upper bidiagonal matrix of.
*
* @param {NonNegativeInteger} N - number of rows and columns
* @param {Float64Array} d - input array
* @param {integer} strideD - `d` stride length
* @param {Float64Array} e - input array
* @param {integer} strideE - `e` stride length
* @param {Float64Array} WORK - input array
* @param {integer} strideWork - `WORK` stride length
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info status code
*/
function dlasq1( N, d, strideD, e, strideE, WORK, strideWork ) {
	const od = stride2offset( N, strideD );
	const oe = stride2offset( N, strideE );
	if ( WORK === null || WORK === void 0 ) {
		const minWork = Math.max( 1, 4 * N );
		WORK = new Float64Array( minWork );
		strideWork = 1;
	}
	const ow = stride2offset( N, strideWork );
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( N, d, strideD, od, e, strideE, oe, WORK, strideWork, ow );
}


// EXPORTS //

export default dlasq1;
