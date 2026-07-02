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

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Converts a double precision matrix `A` to a single precision matrix `SA`.
*
* @param {NonNegativeInteger} M - number of rows
* @param {NonNegativeInteger} N - number of columns
* @param {Float64Array} A - input double-precision matrix
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Float64Array} SA - output matrix receiving single-precision rounded values
* @param {integer} strideSA1 - stride of the first dimension of `SA`
* @param {integer} strideSA2 - stride of the second dimension of `SA`
* @param {NonNegativeInteger} offsetSA - starting index for `SA`
* @throws {RangeError} first argument must be a nonnegative integer
* @throws {RangeError} second argument must be a nonnegative integer
* @returns {integer} status code (`0` on success, `1` if any element exceeds single precision range)
*/
function dlag2s( M, N, A, strideA1, strideA2, offsetA, SA, strideSA1, strideSA2, offsetSA ) {
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( M, N, A, strideA1, strideA2, offsetA, SA, strideSA1, strideSA2, offsetSA );
}


// EXPORTS //

export default dlag2s;
