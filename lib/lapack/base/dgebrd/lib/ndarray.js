/**
 * Reduces a real M-by-N matrix A to upper or lower real bidiagonal form B.
 * by an orthogonal transformation: `Q__T*A*P = B`.
 *
 * This is the blocked version that processes NB columns at a time using
 * dlabrd for the panel factorization, dgemm for the trailing matrix update,
 * and dgebd2 for the final unblocked piece.
 *
 * If M >= N, B is upper bidiagonal; if M < N, B is lower bidiagonal.
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
 * @param {Float64Array} WORK - caller-provided workspace array. Required size: `max(M, N)` for the unblocked path; `(M + N) * NB` for the blocked path with `NB = 32` (default). A minimum of `(M + N) * 2` enables a reduced-NB blocked path; below that, the routine falls back to unblocked and only `max(M, N)` is needed
 * @param {integer} strideWork - stride for WORK
 * @param {NonNegativeInteger} offsetWork - starting index for WORK
 * @param {integer} lwork - length of WORK array
 * @returns {integer} info - 0 if successful
 */

/* eslint-disable max-len, max-params */

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Reduces a real M-by-N matrix A to upper or lower real bidiagonal form B.
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
* @param {Float64Array} WORK - workspace array
* @param {integer} strideWork - stride for WORK
* @param {NonNegativeInteger} offsetWork - starting index for WORK
* @param {integer} lwork - length of WORK array
* @throws {RangeError} first argument must be a nonnegative integer
* @throws {RangeError} second argument must be a nonnegative integer
* @returns {integer} info - 0 if successful
*/
function dgebrd( M, N, A, strideA1, strideA2, offsetA, d, strideD, offsetD, e, strideE, offsetE, TAUQ, strideTAUQ, offsetTAUQ, TAUP, strideTAUP, offsetTAUP, WORK, strideWork, offsetWork, lwork ) {
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( M === 0 || N === 0 ) {
		return 0;
	}
	var minWork = Math.max( 1, M, N );
	if ( !WORK || ( WORK.length - offsetWork ) < minWork ) {
		throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', minWork, offsetWork, ( WORK ) ? WORK.length : 0 ) );
	}
	return base( M, N, A, strideA1, strideA2, offsetA, d, strideD, offsetD, e, strideE, offsetE, TAUQ, strideTAUQ, offsetTAUQ, TAUP, strideTAUP, offsetTAUP, WORK, strideWork, offsetWork, lwork );
}


// EXPORTS //

export default dgebrd;
