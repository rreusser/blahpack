/**
 * Reduces NB rows and columns of a complex Hermitian matrix A to Hermitian.
 * tridiagonal form by a unitary similarity transformation `Q__H*A*Q`,
 * and returns the matrices V and W which are needed to apply the
 * transformation to the unreduced part of A.
 *
 *
 * @param {string} uplo - `'upper'` or `'lower'`
 * @param {NonNegativeInteger} N - order of matrix A
 * @param {integer} nb - number of rows/columns to reduce
 * @param {Complex128Array} A - complex Hermitian matrix (complex-element strides)
 * @param {integer} strideA1 - stride of first dimension of A (complex elements)
 * @param {integer} strideA2 - stride of second dimension of A (complex elements)
 * @param {NonNegativeInteger} offsetA - starting index for A (complex elements)
 * @param {Float64Array} e - off-diagonal elements
 * @param {integer} strideE - stride for e
 * @param {NonNegativeInteger} offsetE - starting index for e
 * @param {Complex128Array} TAU - scalar factors of reflectors
 * @param {integer} strideTAU - stride for TAU (complex elements)
 * @param {NonNegativeInteger} offsetTAU - starting index for TAU (complex elements)
 * @param {Complex128Array} W - output workspace matrix (N-by-NB) (complex-element strides)
 * @param {integer} strideW1 - stride of first dimension of W (complex elements)
 * @param {integer} strideW2 - stride of second dimension of W (complex elements)
 * @param {NonNegativeInteger} offsetW - starting index for W (complex elements)
 * @throws {TypeError} First argument must be a valid matrix triangle
 */

/* eslint-disable max-len, max-params */

// MODULES //

import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Reduces NB rows and columns of a complex Hermitian matrix A to Hermitian.
*
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of matrix A
* @param {integer} nb - number of rows/columns to reduce
* @param {Complex128Array} A - complex Hermitian matrix (complex-element strides)
* @param {integer} strideA1 - stride of first dimension of A (complex elements)
* @param {integer} strideA2 - stride of second dimension of A (complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (complex elements)
* @param {Float64Array} e - off-diagonal elements
* @param {integer} strideE - stride for e
* @param {NonNegativeInteger} offsetE - starting index for e
* @param {Complex128Array} TAU - scalar factors of reflectors
* @param {integer} strideTAU - stride for TAU (complex elements)
* @param {NonNegativeInteger} offsetTAU - starting index for TAU (complex elements)
* @param {Complex128Array} W - output workspace matrix (N-by-NB) (complex-element strides)
* @param {integer} strideW1 - stride of first dimension of W (complex elements)
* @param {integer} strideW2 - stride of second dimension of W (complex elements)
* @param {NonNegativeInteger} offsetW - starting index for W (complex elements)
* @throws {TypeError} first argument must be a valid matrix triangle
* @throws {RangeError} second argument must be a nonnegative integer
* @throws {RangeError} third argument must be a nonnegative integer
*/
function zlatrd( uplo, N, nb, A, strideA1, strideA2, offsetA, e, strideE, offsetE, TAU, strideTAU, offsetTAU, W, strideW1, strideW2, offsetW ) {
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( nb < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', nb ) );
	}
	if ( N === 0 ) {
		return;
	}
	return base( uplo, N, nb, A, strideA1, strideA2, offsetA, e, strideE, offsetE, TAU, strideTAU, offsetTAU, W, strideW1, strideW2, offsetW );
}


// EXPORTS //

export default zlatrd;
