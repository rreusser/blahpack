/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable max-len, max-params, camelcase */

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Reconstructs the Householder vectors and block reflectors of a compact-WY TSQR factorization.
*
* @param {NonNegativeInteger} M - number of rows of `A`
* @param {NonNegativeInteger} N - number of columns of `A`
* @param {PositiveInteger} nb - block size used to build `T`
* @param {Float64Array} A - input/output matrix
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Float64Array} T - output block reflector matrix
* @param {integer} strideT1 - stride of the first dimension of `T`
* @param {integer} strideT2 - stride of the second dimension of `T`
* @param {NonNegativeInteger} offsetT - starting index for `T`
* @param {Float64Array} d - output diagonal sign vector, length `N`
* @param {integer} strideD - stride length for `d`
* @param {NonNegativeInteger} offsetD - starting index for `d`
* @throws {RangeError} first argument must be a nonnegative integer
* @throws {RangeError} second argument must be a nonnegative integer and less than or equal to `M`
* @throws {RangeError} third argument must be a positive integer
* @returns {integer} status code (0 = success)
*/
function dorhr_col( M, N, nb, A, strideA1, strideA2, offsetA, T, strideT1, strideT2, offsetT, d, strideD, offsetD ) {
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 || N > M ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer less than or equal to `M`. Value: `%d`.', N ) );
	}
	if ( nb < 1 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a positive integer. Value: `%d`.', nb ) );
	}
	return base( M, N, nb, A, strideA1, strideA2, offsetA, T, strideT1, strideT2, offsetT, d, strideD, offsetD );
}


// EXPORTS //

export default dorhr_col;
