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
* Computes a column-blocked QR factorization of a complex `M`-by-`N` matrix `A` using TSQR followed by Householder reconstruction.
*
* @param {NonNegativeInteger} M - number of rows of the matrix `A` (`M >= N`)
* @param {NonNegativeInteger} N - number of columns of the matrix `A`
* @param {PositiveInteger} mb1 - row block size for the internal TSQR (`mb1 > N`)
* @param {PositiveInteger} nb1 - column block size for the internal TSQR (`nb1 >= 1`)
* @param {PositiveInteger} nb2 - block size for the output blocked QR (`nb2 >= 1`)
* @param {Complex128Array} A - input/output matrix
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Complex128Array} T - output upper-triangular block reflector factors
* @param {integer} strideT1 - stride of the first dimension of `T`
* @param {integer} strideT2 - stride of the second dimension of `T`
* @param {NonNegativeInteger} offsetT - starting index for `T`
* @param {Complex128Array} WORK - complex workspace array
* @param {integer} strideWork - stride length for `WORK`
* @param {NonNegativeInteger} offsetWork - starting index for `WORK`
* @param {Float64Array} RWORK - real workspace array of length `N`
* @param {integer} strideRWork - stride length for `RWORK`
* @param {NonNegativeInteger} offsetRWork - starting index for `RWORK`
* @throws {RangeError} first argument must be a nonnegative integer
* @throws {RangeError} second argument must satisfy `0 <= N <= M`
* @throws {RangeError} third argument must satisfy `mb1 > N`
* @throws {RangeError} fourth argument must be a positive integer
* @throws {RangeError} fifth argument must be a positive integer
* @throws {RangeError} `WORK` array must have sufficient length
* @throws {RangeError} `RWORK` array must have sufficient length
* @returns {integer} status code (`0` = success)
*/
function zgetsqrhrt( M, N, mb1, nb1, nb2, A, strideA1, strideA2, offsetA, T, strideT1, strideT2, offsetT, WORK, strideWork, offsetWork, RWORK, strideRWork, offsetRWork ) {
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 || N > M ) {
		throw new RangeError( format( 'invalid argument. Second argument must satisfy `0 <= N <= M`. Value: `%d`.', N ) );
	}
	if ( mb1 <= N ) {
		throw new RangeError( format( 'invalid argument. Third argument must satisfy `mb1 > N`. Value: `%d`.', mb1 ) );
	}
	if ( nb1 < 1 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a positive integer. Value: `%d`.', nb1 ) );
	}
	if ( nb2 < 1 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a positive integer. Value: `%d`.', nb2 ) );
	}
	if ( N > 0 ) {
		const nb1local = Math.min( nb1, N );
		const numAllRowBlocks = Math.max( 1, Math.ceil( ( M - N ) / ( mb1 - N ) ) );
		const lwt = numAllRowBlocks * N * nb1local;
		const lw2 = nb1local * Math.max( nb1local, N - nb1local );
		const minWork = lwt + ( N * N ) + lw2;
		if ( !WORK || ( WORK.length - offsetWork ) < minWork ) {
			throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', minWork, offsetWork, ( WORK ) ? WORK.length : 0 ) );
		}
		if ( !RWORK || ( RWORK.length - offsetRWork ) < N ) {
			throw new RangeError( format( 'invalid argument. RWORK array must have at least %d elements from offset %d. Provided length: %d.', N, offsetRWork, ( RWORK ) ? RWORK.length : 0 ) );
		}
	}
	return base( M, N, mb1, nb1, nb2, A, strideA1, strideA2, offsetA, T, strideT1, strideT2, offsetT, WORK, strideWork, offsetWork, RWORK, strideRWork, offsetRWork );
}


// EXPORTS //

export default zgetsqrhrt;
