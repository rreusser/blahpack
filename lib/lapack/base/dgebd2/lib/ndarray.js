/**
 * Reduces a real M-by-N matrix A to upper or lower bidiagonal form B.
 * by an orthogonal transformation: `Q__T*A*P = B`.
 *
 * If M >= N, B is upper bidiagonal; if M < N, B is lower bidiagonal.
 *
 * The matrices Q and P are represented as products of elementary reflectors:
 *
 * If M >= N,
 * Q = H(1) H(2) ... H(N)  and  P = G(1) G(2) ... G(N-1)
 * If M < N,
 * Q = H(1) H(2) ... H(M-1)  and  P = G(1) G(2) ... G(M)
 *
 *
 * @param {NonNegativeInteger} M - number of rows of A
 * @param {NonNegativeInteger} N - number of columns of A
 * @param {Float64Array} A - input/output matrix (column-major)
 * @param {integer} strideA1 - stride of the first dimension of A
 * @param {integer} strideA2 - stride of the second dimension of A
 * @param {NonNegativeInteger} offsetA - starting index for A
 * @param {Float64Array} d - output array of diagonal elements of B, length min(M,N)
 * @param {integer} strideD - stride for d
 * @param {NonNegativeInteger} offsetD - starting index for d
 * @param {Float64Array} e - output array of off-diagonal elements of B, length min(M,N)-1
 * @param {integer} strideE - stride for e
 * @param {NonNegativeInteger} offsetE - starting index for e
 * @param {Float64Array} TAUQ - output array of scalar factors for Q, length min(M,N)
 * @param {integer} strideTAUQ - stride for TAUQ
 * @param {NonNegativeInteger} offsetTAUQ - starting index for TAUQ
 * @param {Float64Array} TAUP - output array of scalar factors for P, length min(M,N)
 * @param {integer} strideTAUP - stride for TAUP
 * @param {NonNegativeInteger} offsetTAUP - starting index for TAUP
 * @param {Float64Array} WORK - workspace array (length >= max(M,N))
 * @param {integer} strideWORK - stride for WORK
 * @param {NonNegativeInteger} offsetWORK - starting index for WORK
 * @returns {integer} info - 0 if successful
 */

/* eslint-disable max-len, max-params */

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Reduces a real M-by-N matrix A to upper or lower bidiagonal form B.
*
* @param {NonNegativeInteger} M - number of rows of A
* @param {NonNegativeInteger} N - number of columns of A
* @param {Float64Array} A - input/output matrix (column-major)
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - starting index for A
* @param {Float64Array} d - output array of diagonal elements of B, length min(M,N)
* @param {integer} strideD - stride for d
* @param {NonNegativeInteger} offsetD - starting index for d
* @param {Float64Array} e - output array of off-diagonal elements of B, length min(M,N)-1
* @param {integer} strideE - stride for e
* @param {NonNegativeInteger} offsetE - starting index for e
* @param {Float64Array} TAUQ - output array of scalar factors for Q, length min(M,N)
* @param {integer} strideTAUQ - stride for TAUQ
* @param {NonNegativeInteger} offsetTAUQ - starting index for TAUQ
* @param {Float64Array} TAUP - output array of scalar factors for P, length min(M,N)
* @param {integer} strideTAUP - stride for TAUP
* @param {NonNegativeInteger} offsetTAUP - starting index for TAUP
* @param {Float64Array} WORK - workspace array (length >= max(M,N))
* @param {integer} strideWORK - stride for WORK
* @param {NonNegativeInteger} offsetWORK - starting index for WORK
* @throws {RangeError} first argument must be a nonnegative integer
* @throws {RangeError} second argument must be a nonnegative integer
* @returns {integer} info - 0 if successful
*/
function dgebd2( M, N, A, strideA1, strideA2, offsetA, d, strideD, offsetD, e, strideE, offsetE, TAUQ, strideTAUQ, offsetTAUQ, TAUP, strideTAUP, offsetTAUP, WORK, strideWORK, offsetWORK ) {
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( M === 0 || N === 0 ) {
		return 0;
	}
	var minWork = Math.max( 1, Math.max( M, N ) );
	if ( !WORK || ( WORK.length - offsetWORK ) < minWork ) {
		throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', minWork, offsetWORK, ( WORK ) ? WORK.length : 0 ) );
	}
	return base( M, N, A, strideA1, strideA2, offsetA, d, strideD, offsetD, e, strideE, offsetE, TAUQ, strideTAUQ, offsetTAUQ, TAUP, strideTAUP, offsetTAUP, WORK, strideWORK, offsetWORK );
}


// EXPORTS //

export default dgebd2;
