
// MODULES //

import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes the Cholesky factorization with complete pivoting of a real symmetric positive semi-definite matrix (unblocked algorithm).
*
* @param {string} uplo - specifies whether upper or lower triangle is stored (`'upper'` or `'lower'`)
* @param {NonNegativeInteger} N - order of matrix A
* @param {Float64Array} A - input/output matrix
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Int32Array} PIV - output permutation array (0-based)
* @param {integer} stridePIV - stride length for `PIV`
* @param {NonNegativeInteger} offsetPIV - starting index for `PIV`
* @param {Int32Array} RANK - 1-element output array for computed rank
* @param {number} tol - user-defined tolerance (negative => use default)
* @param {Float64Array} WORK - workspace array of length 2*N
* @throws {TypeError} first argument must be a valid matrix triangle
* @returns {integer} status code (0 = full rank, 1 = rank-deficient)
*/
function dpstf2( uplo, N, A, strideA1, strideA2, offsetA, PIV, stridePIV, offsetPIV, RANK, tol, WORK ) { // eslint-disable-line max-len, max-params
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( uplo, N, A, strideA1, strideA2, offsetA, PIV, stridePIV, offsetPIV, RANK, tol, WORK ); // eslint-disable-line max-len
}


// EXPORTS //

export default dpstf2;
