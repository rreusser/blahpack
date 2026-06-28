/**
 * Reduces a complex M-by-N matrix A to upper or lower real bidiagonal form B.
 * by a unitary transformation: `Q^H*A*P = B`.
 *
 * If M >= N, B is upper bidiagonal; if M < N, B is lower bidiagonal.
 *
 *
 * @param {NonNegativeInteger} M - number of rows of A
 * @param {NonNegativeInteger} N - number of columns of A
 * @param {Complex128Array} A - input/output matrix (column-major)
 * @param {integer} strideA1 - stride of the first dimension of A (in complex elements)
 * @param {integer} strideA2 - stride of the second dimension of A (in complex elements)
 * @param {NonNegativeInteger} offsetA - starting index for A (in complex elements)
 * @param {Float64Array} d - output array of real diagonal elements of B
 * @param {integer} strideD - stride for d
 * @param {NonNegativeInteger} offsetD - starting index for d
 * @param {Float64Array} e - output array of real off-diagonal elements of B
 * @param {integer} strideE - stride for e
 * @param {NonNegativeInteger} offsetE - starting index for e
 * @param {Complex128Array} TAUQ - output array of scalar factors for Q
 * @param {integer} strideTAUQ - stride for TAUQ (in complex elements)
 * @param {NonNegativeInteger} offsetTAUQ - starting index for TAUQ (in complex elements)
 * @param {Complex128Array} TAUP - output array of scalar factors for P
 * @param {integer} strideTAUP - stride for TAUP (in complex elements)
 * @param {NonNegativeInteger} offsetTAUP - starting index for TAUP (in complex elements)
 * @param {Complex128Array} WORK - workspace array (length >= max(M,N))
 * @param {integer} strideWork - stride for WORK (in complex elements)
 * @param {NonNegativeInteger} offsetWork - starting index for WORK (in complex elements)
 * @returns {integer} info - 0 if successful
 */

/* eslint-disable max-len, max-params */

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Reduces a complex M-by-N matrix A to upper or lower real bidiagonal form B.
*
* @param {NonNegativeInteger} M - number of rows of A
* @param {NonNegativeInteger} N - number of columns of A
* @param {Complex128Array} A - input/output matrix (column-major)
* @param {integer} strideA1 - stride of the first dimension of A (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (in complex elements)
* @param {Float64Array} d - output array of real diagonal elements of B
* @param {integer} strideD - stride for d
* @param {NonNegativeInteger} offsetD - starting index for d
* @param {Float64Array} e - output array of real off-diagonal elements of B
* @param {integer} strideE - stride for e
* @param {NonNegativeInteger} offsetE - starting index for e
* @param {Complex128Array} TAUQ - output array of scalar factors for Q
* @param {integer} strideTAUQ - stride for TAUQ (in complex elements)
* @param {NonNegativeInteger} offsetTAUQ - starting index for TAUQ (in complex elements)
* @param {Complex128Array} TAUP - output array of scalar factors for P
* @param {integer} strideTAUP - stride for TAUP (in complex elements)
* @param {NonNegativeInteger} offsetTAUP - starting index for TAUP (in complex elements)
* @param {Complex128Array} WORK - workspace array (length >= max(M,N))
* @param {integer} strideWork - stride for WORK (in complex elements)
* @param {NonNegativeInteger} offsetWork - starting index for WORK (in complex elements)
* @throws {RangeError} first argument must be a nonnegative integer
* @throws {RangeError} second argument must be a nonnegative integer
* @returns {integer} info - 0 if successful
*/
function zgebd2( M, N, A, strideA1, strideA2, offsetA, d, strideD, offsetD, e, strideE, offsetE, TAUQ, strideTAUQ, offsetTAUQ, TAUP, strideTAUP, offsetTAUP, WORK, strideWork, offsetWork ) {
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( M === 0 || N === 0 ) {
		return 0;
	}
	return base( M, N, A, strideA1, strideA2, offsetA, d, strideD, offsetD, e, strideE, offsetE, TAUQ, strideTAUQ, offsetTAUQ, TAUP, strideTAUP, offsetTAUP, WORK, strideWork, offsetWork );
}


// EXPORTS //

export default zgebd2;
