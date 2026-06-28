/**
 * Generate an M-by-N complex unitary matrix Q with orthonormal columns.
 * which is defined as the last N columns of a product of K elementary
 * reflectors of order M
 *
 * Q = H(K) ... H(2) H(1)
 *
 * as returned by ZGEQLF (QL factorization, blocked algorithm).
 *
 * This is the blocked version that uses ZLARFT + ZLARFB for efficiency
 * on large matrices, falling back to ZUNG2L for small ones.
 *
 * ## Notes
 *
 * -   On entry, the (N-K+i)-th column of A must contain the vector which
 * defines the elementary reflector H(i), for i = 1, 2, ..., K, as
 * returned by ZGEQLF in the last K columns of its array argument A.
 *
 * -   On exit, A contains the M-by-N orthogonal matrix Q.
 *
 * -   WORK is allocated internally with sufficient size (N*NB).
 *
 *
 * @param {NonNegativeInteger} M - number of rows of Q (M >= 0)
 * @param {NonNegativeInteger} N - number of columns of Q (0 <= N <= M)
 * @param {NonNegativeInteger} K - number of elementary reflectors (0 <= K <= N)
 * @param {Complex128Array} A - input/output matrix (M x N)
 * @param {integer} strideA1 - stride of the first dimension of A (complex elements)
 * @param {integer} strideA2 - stride of the second dimension of A (complex elements)
 * @param {NonNegativeInteger} offsetA - starting index for A (complex elements)
 * @param {Complex128Array} TAU - scalar factors of reflectors (length K)
 * @param {integer} strideTAU - stride for TAU (complex elements)
 * @param {NonNegativeInteger} offsetTAU - starting index for TAU (complex elements)
 * @param {Complex128Array} WORK - workspace (ignored, allocated internally)
 * @param {integer} strideWork - stride for WORK (ignored)
 * @param {NonNegativeInteger} offsetWork - starting index for WORK (ignored)
 * @returns {integer} status code (0 = success)
 */

/* eslint-disable max-len, max-params */

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Generate an M-by-N complex unitary matrix Q with orthonormal columns.
*
* @param {NonNegativeInteger} M - number of rows of Q (M >= 0)
* @param {NonNegativeInteger} N - number of columns of Q (0 <= N <= M)
* @param {NonNegativeInteger} K - number of elementary reflectors (0 <= K <= N)
* @param {Complex128Array} A - input/output matrix (M x N)
* @param {integer} strideA1 - stride of the first dimension of A (complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (complex elements)
* @param {Complex128Array} TAU - scalar factors of reflectors (length K)
* @param {integer} strideTAU - stride for TAU (complex elements)
* @param {NonNegativeInteger} offsetTAU - starting index for TAU (complex elements)
* @param {Complex128Array} WORK - workspace (ignored, allocated internally)
* @param {integer} strideWork - stride for WORK (ignored)
* @param {NonNegativeInteger} offsetWork - starting index for WORK (ignored)
* @throws {RangeError} first argument must be a nonnegative integer
* @throws {RangeError} second argument must be a nonnegative integer
* @throws {RangeError} third argument must be a nonnegative integer
* @returns {integer} status code (0 = success)
*/
function zungql( M, N, K, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork ) {
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
	return base(M, N, K, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork );
}


// EXPORTS //

export default zungql;
