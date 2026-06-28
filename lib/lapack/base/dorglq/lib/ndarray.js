/**
 * Generates an M-by-N real orthogonal matrix Q from the elementary.
 * reflectors returned by DGELQF (LQ factorization, blocked algorithm).
 *
 * Q is defined as the product of K elementary reflectors:
 *
 * Q = H(K) ... H(2) H(1)
 *
 * where each H(i) has the form `H(i) = I - tau(i)*v*v^T`, and v is
 * stored as row i of the input matrix A.
 *
 * This is the blocked version that uses DLARFT + DLARFB for efficiency
 * on large matrices, falling back to DORGL2 for small ones.
 *
 * ## Notes
 *
 * -   On entry, the i-th row of A must contain the reflector vector
 * for H(i), as returned by DGELQF.
 *
 * -   On exit, A contains the M-by-N orthogonal matrix Q.
 *
 * -   WORK must have length >= M*NB (where NB is the block size, 32).
 * The lwork parameter is ignored in this implementation; WORK is
 * assumed to be large enough.
 *
 *
 * @param {NonNegativeInteger} M - number of rows of Q (0 <= M <= N)
 * @param {NonNegativeInteger} N - number of columns of Q (N >= 0)
 * @param {NonNegativeInteger} K - number of elementary reflectors (0 <= K <= M)
 * @param {Float64Array} A - input/output matrix (M x N)
 * @param {integer} strideA1 - stride of the first dimension of A
 * @param {integer} strideA2 - stride of the second dimension of A
 * @param {NonNegativeInteger} offsetA - starting index for A
 * @param {Float64Array} TAU - scalar factors of reflectors (length K)
 * @param {integer} strideTAU - stride for TAU
 * @param {NonNegativeInteger} offsetTAU - starting index for TAU
 * @param {Float64Array} WORK - workspace (length >= M*NB)
 * @param {integer} strideWORK - stride for WORK
 * @param {NonNegativeInteger} offsetWORK - starting index for WORK
 * @returns {integer} status code (0 = success)
 */

/* eslint-disable max-len, max-params */

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Generates an M-by-N real orthogonal matrix Q from the elementary.
*
* @param {NonNegativeInteger} M - number of rows of Q (0 <= M <= N)
* @param {NonNegativeInteger} N - number of columns of Q (N >= 0)
* @param {NonNegativeInteger} K - number of elementary reflectors (0 <= K <= M)
* @param {Float64Array} A - input/output matrix (M x N)
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - starting index for A
* @param {Float64Array} TAU - scalar factors of reflectors (length K)
* @param {integer} strideTAU - stride for TAU
* @param {NonNegativeInteger} offsetTAU - starting index for TAU
* @param {Float64Array} WORK - workspace (length >= M*NB)
* @param {integer} strideWORK - stride for WORK
* @param {NonNegativeInteger} offsetWORK - starting index for WORK
* @throws {RangeError} first argument must be a nonnegative integer
* @throws {RangeError} second argument must be a nonnegative integer
* @throws {RangeError} third argument must be a nonnegative integer
* @returns {integer} status code (0 = success)
*/
function dorglq( M, N, K, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWORK, offsetWORK ) {
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( K < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', K ) );
	}
	if ( M === 0 || N === 0 ) {
		return 0;
	}
	var minWork = Math.max( 1, M );
	if ( !WORK || ( WORK.length - offsetWORK ) < minWork ) {
		throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', minWork, offsetWORK, ( WORK ) ? WORK.length : 0 ) );
	}

	return base(M, N, K, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWORK, offsetWORK );
}


// EXPORTS //

export default dorglq;
