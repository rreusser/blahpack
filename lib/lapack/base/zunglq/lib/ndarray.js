/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/**
 * Generate an M-by-N complex unitary matrix Q from the elementary.
 * reflectors returned by ZGELQF (LQ factorization, blocked algorithm).
 *
 * Q is defined as the product of K elementary reflectors:
 *
 * Q = H(K)^H ... H(2)^H H(1)^H
 *
 * This is the blocked version that uses ZLARFT + ZLARFB for efficiency
 * on large matrices, falling back to ZUNGL2 for small ones.
 *
 * ## Notes
 *
 * -   On entry, the i-th row of A must contain the reflector vector
 * for H(i), as returned by ZGELQF.
 *
 * -   On exit, A contains the M-by-N unitary matrix Q.
 *
 * -   WORK must have at least `max(1,M)` elements. For optimum performance it
 * should have at least `M*NB` elements (`NB = 32`), which enables the blocked
 * path; with less, the block size is reduced to `floor(LWORK/M)`, and the
 * unblocked code is used when that is below 2.
 *
 *
 * @param {NonNegativeInteger} M - number of rows of Q (0 <= M <= N)
 * @param {NonNegativeInteger} N - number of columns of Q (N >= 0)
 * @param {NonNegativeInteger} K - number of elementary reflectors (0 <= K <= M)
 * @param {Complex128Array} A - input/output matrix (M x N)
 * @param {integer} strideA1 - stride of the first dimension of A (complex elements)
 * @param {integer} strideA2 - stride of the second dimension of A (complex elements)
 * @param {NonNegativeInteger} offsetA - starting index for A (complex elements)
 * @param {Complex128Array} TAU - scalar factors of reflectors (length K)
 * @param {integer} strideTAU - stride for TAU (complex elements)
 * @param {NonNegativeInteger} offsetTAU - starting index for TAU (complex elements)
 * @param {Complex128Array} WORK - workspace of length at least `max(1,M)`; `M*NB` (`NB = 32`) enables the blocked path
 * @param {integer} strideWork - stride for WORK (complex elements)
 * @param {NonNegativeInteger} offsetWork - starting index for WORK (complex elements)
 * @returns {integer} status code (0 = success)
 */

/* eslint-disable max-len, max-params */

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Generate an M-by-N complex unitary matrix Q from the elementary.
*
* @param {NonNegativeInteger} M - number of rows of Q (0 <= M <= N)
* @param {NonNegativeInteger} N - number of columns of Q (N >= 0)
* @param {NonNegativeInteger} K - number of elementary reflectors (0 <= K <= M)
* @param {Complex128Array} A - input/output matrix (M x N)
* @param {integer} strideA1 - stride of the first dimension of A (complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (complex elements)
* @param {Complex128Array} TAU - scalar factors of reflectors (length K)
* @param {integer} strideTAU - stride for TAU (complex elements)
* @param {NonNegativeInteger} offsetTAU - starting index for TAU (complex elements)
* @param {Complex128Array} WORK - workspace of length at least `max(1,M)`; `M*NB` (`NB = 32`) enables the blocked path
* @param {integer} strideWork - stride for WORK (complex elements)
* @param {NonNegativeInteger} offsetWork - starting index for WORK (complex elements)
* @throws {RangeError} first argument must be a nonnegative integer
* @throws {RangeError} second argument is invalid (rejected when `N < M`)
* @throws {RangeError} third argument is invalid (rejected when `K < 0 || K > M`)
* @returns {integer} status code (0 = success)
*/
function zunglq( M, N, K, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork ) {
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < M ) {
		throw new RangeError( format( 'invalid argument. Second argument is invalid (rejected when `N < M`). Value: `%d`.', N ) );
	}
	if ( K < 0 || K > M ) {
		throw new RangeError( format( 'invalid argument. Third argument is invalid (rejected when `K < 0 || K > M`). Value: `%d`.', K ) );
	}
	if ( strideWork !== 1 ) {
		throw new RangeError( format( 'invalid argument. `strideWork` must be 1 (only contiguous workspace is supported). Value: `%d`.', strideWork ) );
	}
	if ( M === 0 || N === 0 ) {
		return 0;
	}
	const minWork = Math.max( 1, M );
	if ( !WORK || ( WORK.length - offsetWork ) < minWork ) {
		throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', minWork, offsetWork, ( WORK ) ? WORK.length : 0 ) );
	}

	return base(M, N, K, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork );
}


// EXPORTS //

export default zunglq;
