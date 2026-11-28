/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Performs Householder reconstruction: given an M-by-N matrix `Q_in` with orthonormal columns (e.g. from TSQR), stored in `A`, reconstructs the Householder vectors `V` and the block reflector factors `T` of another matrix `Q_out` such that `Q_in = Q_out * S`, where `S` is an N-by-N diagonal matrix with entries `+1` or `-1`.
*
* @param {NonNegativeInteger} M - number of rows
* @param {NonNegativeInteger} N - number of columns
* @param {integer} nb - the column block size to be used in the reconstruction of Householder column vector blocks in the array A and corresponding block reflectors in the array T.
* @param {Complex128Array} A - input matrix
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Complex128Array} T - input matrix
* @param {integer} strideT1 - stride of the first dimension of `T`
* @param {integer} strideT2 - stride of the second dimension of `T`
* @param {NonNegativeInteger} offsetT - starting index for `T`
* @param {Complex128Array} d - output diagonal sign vector (±1, imaginary part zero)
* @param {integer} strideD - stride length for `d`
* @param {NonNegativeInteger} offsetD - starting index for `d`
* @throws {RangeError} first argument must be a nonnegative integer
* @throws {RangeError} second argument is invalid (rejected when `N < 0 || N > M`)
* @throws {RangeError} third argument is invalid (rejected when `nb < 1`)
* @returns {integer} status code (0 = success)
*/
function zunhr_col( M, N, nb, A, strideA1, strideA2, offsetA, T, strideT1, strideT2, offsetT, d, strideD, offsetD ) { // eslint-disable-line max-len, max-params
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 || N > M ) {
		throw new RangeError( format( 'invalid argument. Second argument is invalid (rejected when `N < 0 || N > M`). Value: `%d`.', N ) );
	}
	if ( nb < 1 ) {
		throw new RangeError( format( 'invalid argument. Third argument is invalid (rejected when `nb < 1`). Value: `%d`.', nb ) );
	}
	return base( M, N, nb, A, strideA1, strideA2, offsetA, T, strideT1, strideT2, offsetT, d, strideD, offsetD ); // eslint-disable-line max-len
}


// EXPORTS //

export default zunhr_col;
