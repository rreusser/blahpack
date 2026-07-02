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
* Recursively computes an LQ factorization of a complex `M`-by-`N` matrix using the compact WY representation of `Q`.
*
* @param {NonNegativeInteger} M - number of rows of the matrix `A` (`M <= N`)
* @param {NonNegativeInteger} N - number of columns of the matrix `A`
* @param {Complex128Array} A - input/output matrix; on exit contains `L` and `V`
* @param {integer} strideA1 - stride of the first dimension of `A` (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of `A` (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for `A` (in complex elements)
* @param {Complex128Array} T - output upper triangular factor of the block reflector
* @param {integer} strideT1 - stride of the first dimension of `T` (in complex elements)
* @param {integer} strideT2 - stride of the second dimension of `T` (in complex elements)
* @param {NonNegativeInteger} offsetT - starting index for `T` (in complex elements)
* @throws {RangeError} first argument must be a nonnegative integer
* @throws {RangeError} second argument must be a nonnegative integer
* @throws {RangeError} second argument must be greater than or equal to the first argument
* @returns {integer} status code (`0` = success)
*/
function zgelqt3( M, N, A, strideA1, strideA2, offsetA, T, strideT1, strideT2, offsetT ) {
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( N < M ) {
		throw new RangeError( format( 'invalid argument. Second argument must be greater than or equal to the first argument. Value: `%d`.', N ) );
	}
	return base( M, N, A, strideA1, strideA2, offsetA, T, strideT1, strideT2, offsetT );
}


// EXPORTS //

export default zgelqt3;
