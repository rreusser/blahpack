/**
 * Reduces the first NB rows and columns of a real general M-by-N matrix A.
 * to upper or lower bidiagonal form by an orthogonal transformation
 * `Q__T*A*P`, and returns the matrices X and Y which are needed to apply
 * the transformation to the unreduced part of A.
 *
 * If M >= N, A is reduced to upper bidiagonal form; if M < N, to lower
 * bidiagonal form.
 *
 * This is an auxiliary routine called by DGEBRD.
 *
 *
 * @param {NonNegativeInteger} M - number of rows
 * @param {NonNegativeInteger} N - number of columns
 * @param {integer} nb - number of leading rows and columns to reduce
 * @param {Float64Array} A - input matrix (M-by-N, column-major)
 * @param {integer} strideA1 - stride of the first dimension of `A`
 * @param {integer} strideA2 - stride of the second dimension of `A`
 * @param {NonNegativeInteger} offsetA - starting index for `A`
 * @param {Float64Array} d - real diagonal elements (length nb)
 * @param {integer} strideD - stride length for `d`
 * @param {NonNegativeInteger} offsetD - starting index for `d`
 * @param {Float64Array} e - real off-diagonal elements (length nb)
 * @param {integer} strideE - stride length for `e`
 * @param {NonNegativeInteger} offsetE - starting index for `e`
 * @param {Float64Array} TAUQ - scalars for Q reflectors (length nb)
 * @param {integer} strideTAUQ - stride length for `TAUQ`
 * @param {NonNegativeInteger} offsetTAUQ - starting index for `TAUQ`
 * @param {Float64Array} TAUP - scalars for P reflectors (length nb)
 * @param {integer} strideTAUP - stride length for `TAUP`
 * @param {NonNegativeInteger} offsetTAUP - starting index for `TAUP`
 * @param {Float64Array} X - output matrix (M-by-NB, column-major)
 * @param {integer} strideX1 - stride of the first dimension of `X`
 * @param {integer} strideX2 - stride of the second dimension of `X`
 * @param {NonNegativeInteger} offsetX - starting index for `X`
 * @param {Float64Array} Y - output matrix (N-by-NB, column-major)
 * @param {integer} strideY1 - stride of the first dimension of `Y`
 * @param {integer} strideY2 - stride of the second dimension of `Y`
 * @param {NonNegativeInteger} offsetY - starting index for `Y`
 */

/* eslint-disable max-len, max-params */

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Reduces the first NB rows and columns of a real general M-by-N matrix A.
*
* @param {NonNegativeInteger} M - number of rows
* @param {NonNegativeInteger} N - number of columns
* @param {integer} nb - number of leading rows and columns to reduce
* @param {Float64Array} A - input matrix (M-by-N, column-major)
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Float64Array} d - real diagonal elements (length nb)
* @param {integer} strideD - stride length for `d`
* @param {NonNegativeInteger} offsetD - starting index for `d`
* @param {Float64Array} e - real off-diagonal elements (length nb)
* @param {integer} strideE - stride length for `e`
* @param {NonNegativeInteger} offsetE - starting index for `e`
* @param {Float64Array} TAUQ - scalars for Q reflectors (length nb)
* @param {integer} strideTAUQ - stride length for `TAUQ`
* @param {NonNegativeInteger} offsetTAUQ - starting index for `TAUQ`
* @param {Float64Array} TAUP - scalars for P reflectors (length nb)
* @param {integer} strideTAUP - stride length for `TAUP`
* @param {NonNegativeInteger} offsetTAUP - starting index for `TAUP`
* @param {Float64Array} X - output matrix (M-by-NB, column-major)
* @param {integer} strideX1 - stride of the first dimension of `X`
* @param {integer} strideX2 - stride of the second dimension of `X`
* @param {NonNegativeInteger} offsetX - starting index for `X`
* @param {Float64Array} Y - output matrix (N-by-NB, column-major)
* @param {integer} strideY1 - stride of the first dimension of `Y`
* @param {integer} strideY2 - stride of the second dimension of `Y`
* @param {NonNegativeInteger} offsetY - starting index for `Y`
* @throws {RangeError} first argument must be a nonnegative integer
* @throws {RangeError} second argument must be a nonnegative integer
* @throws {RangeError} third argument must be a nonnegative integer
*/
function dlabrd( M, N, nb, A, strideA1, strideA2, offsetA, d, strideD, offsetD, e, strideE, offsetE, TAUQ, strideTAUQ, offsetTAUQ, TAUP, strideTAUP, offsetTAUP, X, strideX1, strideX2, offsetX, Y, strideY1, strideY2, offsetY ) {
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

export default dlabrd;
