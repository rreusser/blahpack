/**
 * Generates an M-by-N real orthogonal matrix Q from the elementary.
 * reflectors returned by DGEQRF (QR factorization, blocked algorithm).
 *
 * Q is defined as the product of K elementary reflectors:
 *
 * Q = H(1) H(2) ... H(K)
 *
 * where each H(i) has the form `H(i) = I - tau(i)*v*v^T`.
 *
 * This is the blocked version that uses DLARFT + DLARFB for efficiency
 * on large matrices, falling back to DORG2R for small ones.
 *
 * ## Notes
 *
 * -   On entry, the i-th column of A must contain the reflector vector
 * for H(i), as returned by DGEQRF.
 *
 * -   On exit, A contains the M-by-N orthogonal matrix Q.
 *
 * -   WORK must be caller-provided with at least `max(1, N*NB)` elements
 * where `NB = 32`. The buffer stores the block-reflector T factor.
 *
 *
 * @param {NonNegativeInteger} M - number of rows of Q (M >= 0)
 * @param {NonNegativeInteger} N - number of columns of Q (0 <= N <= M)
 * @param {NonNegativeInteger} K - number of elementary reflectors (0 <= K <= N)
 * @param {Float64Array} A - input/output matrix (M x N)
 * @param {integer} strideA1 - stride of the first dimension of A
 * @param {integer} strideA2 - stride of the second dimension of A
 * @param {NonNegativeInteger} offsetA - starting index for A
 * @param {Float64Array} TAU - scalar factors of reflectors (length K)
 * @param {integer} strideTAU - stride for TAU
 * @param {NonNegativeInteger} offsetTAU - starting index for TAU
 * @param {Float64Array} WORK - workspace (ignored, allocated internally)
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
* Generates an M-by-N real orthogonal matrix Q from the elementary.
*
* @param {NonNegativeInteger} M - number of rows of Q (M >= 0)
* @param {NonNegativeInteger} N - number of columns of Q (0 <= N <= M)
* @param {NonNegativeInteger} K - number of elementary reflectors (0 <= K <= N)
* @param {Float64Array} A - input/output matrix (M x N)
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - starting index for A
* @param {Float64Array} TAU - scalar factors of reflectors (length K)
* @param {integer} strideTAU - stride for TAU
* @param {NonNegativeInteger} offsetTAU - starting index for TAU
* @param {Float64Array} WORK - caller-provided workspace (`>= max(1, N*NB)` elements, `NB = 32`)
* @param {integer} strideWork - stride for WORK (must be 1)
* @param {NonNegativeInteger} offsetWork - starting index for WORK
* @throws {RangeError} first argument must be a nonnegative integer
* @throws {RangeError} second argument must be a nonnegative integer
* @throws {RangeError} third argument must be a nonnegative integer
* @returns {integer} status code (0 = success)
*/
function dorgqr( M, N, K, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork ) {
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
	var NB = 32;
	var minWork = ( K > NB ) ? Math.max( 1, N * NB ) : Math.max( 1, N );
	if ( !WORK || ( WORK.length - offsetWork ) < minWork ) {
		throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', minWork, offsetWork, ( WORK ) ? WORK.length : 0 ) );
	}
	return base(M, N, K, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork );
}


// EXPORTS //

export default dorgqr;
