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
* Computes a generalized RQ factorization of an M-by-N matrix A and a.
* P-by-N matrix B:
*
* ```text
* A = R*Q,        B = Z*T*Q,
* ```
*
* where Q is an N-by-N orthogonal matrix, Z is a P-by-P orthogonal matrix,
* and R and T are upper trapezoidal/triangular.
*
* The caller must supply `work` as a `Float64Array` of length at least
* `max(1, M, p, N)` elements from `offsetWork`. For optimum performance
* (blocked paths in `dgerqf`, `dormrq`, and `dgeqrf`), the length should be
* `max( max(M,P,N)*NB, P*NB + TSIZE )` (`NB = 32`, `TSIZE = 4160`): the reference's `max(M,P,N)*NB` with the dormrq optimum's T part, which enables the blocked paths.
*
* @param {NonNegativeInteger} M - number of rows of A
* @param {NonNegativeInteger} p - number of rows of B
* @param {NonNegativeInteger} N - number of columns of A and B
* @param {Float64Array} A - M-by-N matrix (overwritten with R and reflectors)
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - starting index for A
* @param {Float64Array} TAUA - output: scalar factors of reflectors for Q
* @param {integer} strideTAUA - stride for TAUA
* @param {NonNegativeInteger} offsetTAUA - offset for TAUA
* @param {Float64Array} B - P-by-N matrix (overwritten with T and reflectors)
* @param {integer} strideB1 - stride of the first dimension of B
* @param {integer} strideB2 - stride of the second dimension of B
* @param {NonNegativeInteger} offsetB - starting index for B
* @param {Float64Array} TAUB - output: scalar factors of reflectors for Z
* @param {integer} strideTAUB - stride for TAUB
* @param {NonNegativeInteger} offsetTAUB - offset for TAUB
* @param {Float64Array} work - workspace of length at least `max(1,M,P,N)`; for optimal performance at least `max( max(M,P,N)*NB, P*NB + TSIZE )` (`NB = 32`, `TSIZE = 4160`): the reference's `max(M,P,N)*NB` with the dormrq optimum's T part, which enables the blocked paths (from `offsetWork`)
* @param {integer} strideWork - stride for work
* @param {NonNegativeInteger} offsetWork - starting index for work
* @throws {RangeError} first argument must be a nonnegative integer
* @throws {RangeError} second argument must be a nonnegative integer
* @throws {RangeError} third argument must be a nonnegative integer
* @throws {RangeError} work array must have sufficient length
* @returns {integer} info - 0 on success
*/
function dggrqf( M, p, N, A, strideA1, strideA2, offsetA, TAUA, strideTAUA, offsetTAUA, B, strideB1, strideB2, offsetB, TAUB, strideTAUB, offsetTAUB, work, strideWork, offsetWork ) { // eslint-disable-line max-len, max-params

	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( p < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', p ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	const minWork = Math.max( 1, M, p, N );
	if ( !work || ( work.length - offsetWork ) < minWork ) {
		throw new RangeError( format( 'invalid argument. Work array must have at least %d elements from offset %d. Provided length: %d.', minWork, offsetWork, ( work ) ? work.length : 0 ) );
	}
	if ( strideWork !== 1 ) {
		throw new RangeError( format( 'invalid argument. `strideWork` must be 1 (only contiguous workspace is supported). Value: `%d`.', strideWork ) );
	}
	return base( M, p, N, A, strideA1, strideA2, offsetA, TAUA, strideTAUA, offsetTAUA, B, strideB1, strideB2, offsetB, TAUB, strideTAUB, offsetTAUB, work, strideWork, offsetWork ); // eslint-disable-line max-len
}


// EXPORTS //

export default dggrqf;
