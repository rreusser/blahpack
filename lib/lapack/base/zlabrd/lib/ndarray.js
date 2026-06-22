/**
 * Reduces the first NB rows and columns of a complex general M-by-N matrix A.
 * to upper or lower real bidiagonal form by a unitary transformation
 * `Q^H*A*P`, and returns the matrices X and Y which are needed to apply
 * the transformation to the unreduced part of A.
 *
 * If M >= N, A is reduced to upper bidiagonal form; if M < N, to lower
 * bidiagonal form.
 *
 * This is an auxiliary routine called by ZGEBRD.
 *
 *
 * @param {NonNegativeInteger} M - number of rows
 * @param {NonNegativeInteger} N - number of columns
 * @param {integer} nb - number of leading rows and columns to reduce
 * @param {Complex128Array} A - input matrix (M-by-N, column-major)
 * @param {integer} strideA1 - stride of the first dimension of `A` (in complex elements)
 * @param {integer} strideA2 - stride of the second dimension of `A` (in complex elements)
 * @param {NonNegativeInteger} offsetA - starting index for `A` (in complex elements)
 * @param {Float64Array} d - real diagonal elements (length nb)
 * @param {integer} strideD - stride length for `d`
 * @param {NonNegativeInteger} offsetD - starting index for `d`
 * @param {Float64Array} e - real off-diagonal elements (length nb)
 * @param {integer} strideE - stride length for `e`
 * @param {NonNegativeInteger} offsetE - starting index for `e`
 * @param {Complex128Array} TAUQ - complex scalars for Q reflectors (length nb)
 * @param {integer} strideTAUQ - stride length for `TAUQ` (in complex elements)
 * @param {NonNegativeInteger} offsetTAUQ - starting index for `TAUQ` (in complex elements)
 * @param {Complex128Array} TAUP - complex scalars for P reflectors (length nb)
 * @param {integer} strideTAUP - stride length for `TAUP` (in complex elements)
 * @param {NonNegativeInteger} offsetTAUP - starting index for `TAUP` (in complex elements)
 * @param {Complex128Array} X - output matrix (M-by-NB, column-major)
 * @param {integer} strideX1 - stride of the first dimension of `X` (in complex elements)
 * @param {integer} strideX2 - stride of the second dimension of `X` (in complex elements)
 * @param {NonNegativeInteger} offsetX - starting index for `X` (in complex elements)
 * @param {Complex128Array} Y - output matrix (N-by-NB, column-major)
 * @param {integer} strideY1 - stride of the first dimension of `Y` (in complex elements)
 * @param {integer} strideY2 - stride of the second dimension of `Y` (in complex elements)
 * @param {NonNegativeInteger} offsetY - starting index for `Y` (in complex elements)
 */

/* eslint-disable max-len, max-params */

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Reduces the first NB rows and columns of a complex general M-by-N matrix A.
*
* @param {NonNegativeInteger} M - number of rows
* @param {NonNegativeInteger} N - number of columns
* @param {integer} nb - number of leading rows and columns to reduce
* @param {Complex128Array} A - input matrix (M-by-N, column-major)
* @param {integer} strideA1 - stride of the first dimension of `A` (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of `A` (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for `A` (in complex elements)
* @param {Float64Array} d - real diagonal elements (length nb)
* @param {integer} strideD - stride length for `d`
* @param {NonNegativeInteger} offsetD - starting index for `d`
* @param {Float64Array} e - real off-diagonal elements (length nb)
* @param {integer} strideE - stride length for `e`
* @param {NonNegativeInteger} offsetE - starting index for `e`
* @param {Complex128Array} TAUQ - complex scalars for Q reflectors (length nb)
* @param {integer} strideTAUQ - stride length for `TAUQ` (in complex elements)
* @param {NonNegativeInteger} offsetTAUQ - starting index for `TAUQ` (in complex elements)
* @param {Complex128Array} TAUP - complex scalars for P reflectors (length nb)
* @param {integer} strideTAUP - stride length for `TAUP` (in complex elements)
* @param {NonNegativeInteger} offsetTAUP - starting index for `TAUP` (in complex elements)
* @param {Complex128Array} X - output matrix (M-by-NB, column-major)
* @param {integer} strideX1 - stride of the first dimension of `X` (in complex elements)
* @param {integer} strideX2 - stride of the second dimension of `X` (in complex elements)
* @param {NonNegativeInteger} offsetX - starting index for `X` (in complex elements)
* @param {Complex128Array} Y - output matrix (N-by-NB, column-major)
* @param {integer} strideY1 - stride of the first dimension of `Y` (in complex elements)
* @param {integer} strideY2 - stride of the second dimension of `Y` (in complex elements)
* @param {NonNegativeInteger} offsetY - starting index for `Y` (in complex elements)
* @throws {RangeError} first argument must be a nonnegative integer
* @throws {RangeError} second argument must be a nonnegative integer
* @throws {RangeError} third argument must be a nonnegative integer
*/
function zlabrd( M, N, nb, A, strideA1, strideA2, offsetA, d, strideD, offsetD, e, strideE, offsetE, TAUQ, strideTAUQ, offsetTAUQ, TAUP, strideTAUP, offsetTAUP, X, strideX1, strideX2, offsetX, Y, strideY1, strideY2, offsetY ) {
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( nb < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', nb ) );
	}
	if ( M === 0 || N === 0 ) {
		return;
	}
	return base( M, N, nb, A, strideA1, strideA2, offsetA, d, strideD, offsetD, e, strideE, offsetE, TAUQ, strideTAUQ, offsetTAUQ, TAUP, strideTAUP, offsetTAUP, X, strideX1, strideX2, offsetX, Y, strideY1, strideY2, offsetY );
}


// EXPORTS //

export default zlabrd;
