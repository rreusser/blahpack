/**
 * Reduces a complex Hermitian matrix A to real symmetric tridiagonal form T.
 * by a unitary similarity transformation: `Q__H*A*Q = T`.
 *
 * Uses the blocked algorithm: reduces NB columns at a time using zlatrd
 * (panel factorization) and zher2k (trailing matrix update), then finishes
 * the remaining block with zhetd2 (unblocked).
 *
 *
 * @param {string} uplo - `'upper'` or `'lower'`
 * @param {NonNegativeInteger} N - order of the matrix A
 * @param {Complex128Array} A - input/output Hermitian matrix (complex-element strides)
 * @param {integer} strideA1 - stride of first dimension of A (complex elements)
 * @param {integer} strideA2 - stride of second dimension of A (complex elements)
 * @param {NonNegativeInteger} offsetA - starting index for A (complex elements)
 * @param {Float64Array} d - output diagonal elements of T (length N)
 * @param {integer} strideD - stride for d
 * @param {NonNegativeInteger} offsetD - starting index for d
 * @param {Float64Array} e - output off-diagonal elements of T (length N-1)
 * @param {integer} strideE - stride for e
 * @param {NonNegativeInteger} offsetE - starting index for e
 * @param {Complex128Array} TAU - output scalar factors of reflectors (length N-1)
 * @param {integer} strideTAU - stride for TAU (complex elements)
 * @param {NonNegativeInteger} offsetTAU - starting index for TAU (complex elements)
 * @throws {TypeError} First argument must be a valid matrix triangle
 * @returns {integer} info (0 = success)
 */

/* eslint-disable max-len, max-params */

// MODULES //

import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Reduces a complex Hermitian matrix A to real symmetric tridiagonal form T.
*
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the matrix A
* @param {Complex128Array} A - input/output Hermitian matrix (complex-element strides)
* @param {integer} strideA1 - stride of first dimension of A (complex elements)
* @param {integer} strideA2 - stride of second dimension of A (complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (complex elements)
* @param {Float64Array} d - output diagonal elements of T (length N)
* @param {integer} strideD - stride for d
* @param {NonNegativeInteger} offsetD - starting index for d
* @param {Float64Array} e - output off-diagonal elements of T (length N-1)
* @param {integer} strideE - stride for e
* @param {NonNegativeInteger} offsetE - starting index for e
* @param {Complex128Array} TAU - output scalar factors of reflectors (length N-1)
* @param {integer} strideTAU - stride for TAU (complex elements)
* @param {NonNegativeInteger} offsetTAU - starting index for TAU (complex elements)
* @throws {TypeError} first argument must be a valid matrix triangle
* @throws {RangeError} second argument must be a nonnegative integer
* @returns {integer} info (0 = success)
*/
function zhetrd( uplo, N, A, strideA1, strideA2, offsetA, d, strideD, offsetD, e, strideE, offsetE, TAU, strideTAU, offsetTAU ) {
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( N === 0 ) {
		return 0;
	}
	return base(uplo, N, A, strideA1, strideA2, offsetA, d, strideD, offsetD, e, strideE, offsetE, TAU, strideTAU, offsetTAU );
}


// EXPORTS //

export default zhetrd;
