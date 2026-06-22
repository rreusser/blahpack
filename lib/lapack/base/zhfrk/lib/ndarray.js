
// MODULES //

import isTransposeOperation from '@stdlib/blas/base/assert/is-transpose-operation/lib/index.js';
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Performs a Hermitian rank-k operation for a matrix in Rectangular Full Packed format.
*
* @param {string} transr - specifies the storage format (`'no-transpose'` or `'conjugate-transpose'`)
* @param {string} uplo - specifies whether the upper or lower triangle is stored (`'upper'` or `'lower'`)
* @param {string} trans - specifies the operation (`'no-transpose'` or `'conjugate-transpose'`)
* @param {NonNegativeInteger} N - order of Hermitian matrix C
* @param {NonNegativeInteger} K - number of columns of A (trans='no-transpose') or rows (trans='conjugate-transpose')
* @param {number} alpha - real scalar
* @param {Complex128Array} A - complex input matrix
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {number} beta - real scalar
* @param {Complex128Array} C - RFP array of length N*(N+1)/2
* @param {integer} strideC - stride for `C`
* @param {NonNegativeInteger} offsetC - starting index for `C`
* @throws {TypeError} First argument must be a valid transpose operation
* @throws {TypeError} Second argument must be a valid matrix triangle
* @throws {TypeError} Third argument must be a valid transpose operation
* @returns {Complex128Array} `C`
*/
function zhfrk( transr, uplo, trans, N, K, alpha, A, strideA1, strideA2, offsetA, beta, C, strideC, offsetC ) { // eslint-disable-line max-len, max-params
	if ( !isTransposeOperation( transr ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid transpose operation. Value: `%s`.', transr ) );
	}
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( !isTransposeOperation( trans ) ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid transpose operation. Value: `%s`.', trans ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( K < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', K ) );
	}
	return base( transr, uplo, trans, N, K, alpha, A, strideA1, strideA2, offsetA, beta, C, strideC, offsetC ); // eslint-disable-line max-len
}


// EXPORTS //

export default zhfrk;
