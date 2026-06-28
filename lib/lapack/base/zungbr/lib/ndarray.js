/**
 * Generate one of the complex unitary matrices Q or P^H determined by ZGEBRD.
 * when reducing a complex matrix A to bidiagonal form: `A = Q*B*P^H`.
 *
 * Q and P^H are defined as products of elementary reflectors H(i) or G(i)
 * respectively.
 *
 * If VECT = 'Q', A is assumed to have been an M-by-K matrix, and Q
 * is of order M:
 * if M >= K, Q = H(1) H(2) ... H(k) and zungbr returns the first N
 * columns of Q, where M >= N >= K;
 * if M < K, Q = H(1) H(2) ... H(m-1) and zungbr returns Q as an
 * M-by-M unitary matrix.
 *
 * If VECT = 'P', A is assumed to have been a K-by-N matrix, and P^H
 * is of order N:
 * if K < N, P^H = G(1) G(2) ... G(k) and zungbr returns the first M
 * rows of P^H, where N >= M >= K;
 * if K >= N, P^H = G(1) G(2) ... G(n-1) and zungbr returns P^H as an
 * N-by-N unitary matrix.
 *
 *
 * @param {string} vect - 'q' to generate Q, 'p' to generate P^H
 * @param {NonNegativeInteger} M - number of rows of the matrix Q or P^H
 * @param {NonNegativeInteger} N - number of columns of the matrix Q or P^H
 * @param {NonNegativeInteger} K - number of columns/rows in original matrix
 * @param {Complex128Array} A - matrix containing reflectors from ZGEBRD
 * @param {integer} strideA1 - stride of the first dimension of A (complex elements)
 * @param {integer} strideA2 - stride of the second dimension of A (complex elements)
 * @param {NonNegativeInteger} offsetA - starting index for A (complex elements)
 * @param {Complex128Array} TAU - scalar factors of reflectors
 * @param {integer} strideTAU - stride for TAU (complex elements)
 * @param {NonNegativeInteger} offsetTAU - starting index for TAU (complex elements)
 * @param {Complex128Array} WORK - workspace
 * @param {integer} strideWork - stride for WORK (complex elements)
 * @param {NonNegativeInteger} offsetWork - starting index for WORK (complex elements)
 * @returns {integer} info - 0 if successful
 */

/* eslint-disable max-len, max-params */

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Generate one of the complex unitary matrices Q or P^H determined by ZGEBRD.
*
* @param {string} vect - `'apply-Q'` to generate Q, `'apply-P'` to generate P^H
* @param {NonNegativeInteger} M - number of rows of the matrix Q or P^H
* @param {NonNegativeInteger} N - number of columns of the matrix Q or P^H
* @param {NonNegativeInteger} K - number of columns/rows in original matrix
* @param {Complex128Array} A - matrix containing reflectors from ZGEBRD
* @param {integer} strideA1 - stride of the first dimension of A (complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (complex elements)
* @param {Complex128Array} TAU - scalar factors of reflectors
* @param {integer} strideTAU - stride for TAU (complex elements)
* @param {NonNegativeInteger} offsetTAU - starting index for TAU (complex elements)
* @param {Complex128Array} WORK - workspace
* @param {integer} strideWork - stride for WORK (complex elements)
* @param {NonNegativeInteger} offsetWork - starting index for WORK (complex elements)
* @throws {TypeError} first argument must be a valid vector type
* @throws {RangeError} second argument must be a nonnegative integer
* @throws {RangeError} third argument must be a nonnegative integer
* @throws {RangeError} fourth argument must be a nonnegative integer
* @returns {integer} info - 0 if successful
*/
function zungbr( vect, M, N, K, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork ) {
	if ( vect !== 'apply-Q' && vect !== 'apply-P' ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid vector type. Value: `%s`.', vect ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( K < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', K ) );
	}
	if ( M === 0 || N === 0 ) {
		return 0;
	}
	return base( vect, M, N, K, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork );
}


// EXPORTS //

export default zungbr;
