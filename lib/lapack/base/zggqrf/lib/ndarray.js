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
* Computes a generalized QR factorization of an N-by-M matrix A and an N-by-P matrix B.
*
* @param {NonNegativeInteger} N - number of rows of A and B
* @param {NonNegativeInteger} M - number of columns of A
* @param {NonNegativeInteger} p - number of columns of B
* @param {Complex128Array} A - N-by-M matrix (overwritten with R and reflectors)
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Complex128Array} TAUA - output: scalar factors of reflectors for Q
* @param {integer} strideTAUA - stride for `TAUA`
* @param {NonNegativeInteger} offsetTAUA - offset for `TAUA`
* @param {Complex128Array} B - N-by-P matrix (overwritten with T and reflectors)
* @param {integer} strideB1 - stride of the first dimension of `B`
* @param {integer} strideB2 - stride of the second dimension of `B`
* @param {NonNegativeInteger} offsetB - starting index for `B`
* @param {Complex128Array} TAUB - output: scalar factors of reflectors for Z
* @param {integer} strideTAUB - stride for `TAUB`
* @param {NonNegativeInteger} offsetTAUB - offset for `TAUB`
* @param {Complex128Array} WORK - workspace of length at least `max(1,N,M,P)` (complex elements); for optimal performance at least `max( max(N,M,P)*NB, P*NB + TSIZE )` (`NB = 32` from `ilaenv`, `TSIZE = 4160`), the reference's `max(N,M,P)*NB` with the zunmqr optimum's T part, which enables the blocked paths
* @param {integer} strideWork - stride for `WORK`
* @param {NonNegativeInteger} offsetWork - offset for `WORK`
* @throws {RangeError} first argument must be a nonnegative integer
* @throws {RangeError} second argument must be a nonnegative integer
* @throws {RangeError} third argument must be a nonnegative integer
* @returns {integer} info - 0 on success
*/
function zggqrf( N, M, p, A, strideA1, strideA2, offsetA, TAUA, strideTAUA, offsetTAUA, B, strideB1, strideB2, offsetB, TAUB, strideTAUB, offsetTAUB, WORK, strideWork, offsetWork ) { // eslint-disable-line max-len, max-params
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( p < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', p ) );
	}
	const minWork = Math.max( 1, N, M, p );
	if ( !WORK || ( WORK.length - offsetWork ) < minWork ) {
		throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', minWork, offsetWork, ( WORK ) ? WORK.length : 0 ) );
	}
	if ( strideWork !== 1 ) {
		throw new RangeError( format( 'invalid argument. `strideWork` must be 1 (only contiguous workspace is supported). Value: `%d`.', strideWork ) );
	}
	return base( N, M, p, A, strideA1, strideA2, offsetA, TAUA, strideTAUA, offsetTAUA, B, strideB1, strideB2, offsetB, TAUB, strideTAUB, offsetTAUB, WORK, strideWork, offsetWork ); // eslint-disable-line max-len
}


// EXPORTS //

export default zggqrf;
