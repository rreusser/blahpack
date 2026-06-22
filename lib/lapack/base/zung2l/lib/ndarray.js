

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
 * Generate an M-by-N complex unitary matrix Q with orthonormal columns.
 * which is defined as the last N columns of a product of K elementary
 * reflectors of order M
 *
 * Q = H(K) ... H(2) H(1)
 *
 * as returned by ZGEQLF (QL factorization, unblocked algorithm).
 *
 * ## Notes
 *
 * -   On entry, the (N-K+i)-th column of A must contain the vector which
 * defines the elementary reflector H(i), for i = 1, 2, ..., K, as
 * returned by ZGEQLF in the last K columns of its array argument A.
 *
 * -   On exit, A contains the M-by-N matrix Q.
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
 * @param {Complex128Array} WORK - workspace (length >= N)
 * @param {integer} strideWORK - stride for WORK (complex elements)
 * @param {NonNegativeInteger} offsetWORK - starting index for WORK (complex elements)
 * @returns {integer} status code (0 = success)
 */
function zung2l( M, N, K, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWORK, offsetWORK ) { // eslint-disable-line max-len, max-params
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( K < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', K ) );
	}
	return base( M, N, K, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWORK, offsetWORK ); // eslint-disable-line max-len
}


// EXPORTS //

export default zung2l;
