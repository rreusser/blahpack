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
* Measures the linear dependence of two vectors X and Y by computing the.
* QR factorization of the N-by-2 matrix (X Y) and returning the smallest
* singular value of the resulting 2-by-2 upper triangular R factor.
*
* On exit, X and Y are overwritten.
*
* @param {NonNegativeInteger} N - length of the vectors
* @param {Float64Array} x - first vector (overwritten)
* @param {integer} strideX - stride for x
* @param {NonNegativeInteger} offsetX - starting index for x
* @param {Float64Array} y - second vector (overwritten)
* @param {integer} strideY - stride for y
* @param {NonNegativeInteger} offsetY - starting index for y
* @param {Float64Array} ssmin - output: `ssmin[0]` receives the smallest singular value
* @throws {RangeError} first argument must be a nonnegative integer
* @returns {void}
*/
function dlapll( N, x, strideX, offsetX, y, strideY, offsetY, ssmin ) {
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( N, x, strideX, offsetX, y, strideY, offsetY, ssmin );
}


// EXPORTS //

export default dlapll;
