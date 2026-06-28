

// MODULES //

import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Returns the value of the one-norm, Frobenius norm, infinity-norm, or the.
* largest absolute value of any element of a complex symmetric matrix A.
*
* NOTE: This is for SYMMETRIC matrices (not Hermitian).
*
* @param {string} norm - `'max'`, `'one-norm'`, `'inf-norm'`, or `'frobenius'`
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the matrix
* @param {Complex128Array} A - the matrix
* @param {integer} strideA1 - first stride of A (complex elements)
* @param {integer} strideA2 - second stride of A (complex elements)
* @param {NonNegativeInteger} offsetA - offset into A (complex elements)
* @param {Float64Array} WORK - workspace of length N (only for `'one-norm'`/`'inf-norm'` norms)
* @param {integer} strideWORK - stride of WORK
* @param {NonNegativeInteger} offsetWORK - offset into WORK
* @throws {TypeError} Second argument must be a valid matrix triangle
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {number} the norm value
*/
function zlansy( norm, uplo, N, A, strideA1, strideA2, offsetA, WORK, strideWORK, offsetWORK ) { // eslint-disable-line max-len, max-params
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( norm, uplo, N, A, strideA1, strideA2, offsetA, WORK, strideWORK, offsetWORK ); // eslint-disable-line max-len
}


// EXPORTS //

export default zlansy;
