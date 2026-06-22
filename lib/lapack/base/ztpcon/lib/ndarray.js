
// MODULES //

import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import isDiagonalType from '@stdlib/blas/base/assert/is-diagonal-type/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Estimates the reciprocal condition number of a complex triangular matrix in packed storage.
*
* @param {string} norm - norm type: 'one-norm' or 'inf-norm'
* @param {string} uplo - 'upper' or 'lower'
* @param {string} diag - 'unit' or 'non-unit'
* @param {NonNegativeInteger} N - order of the matrix
* @param {Complex128Array} AP - packed triangular matrix
* @param {integer} strideAP - stride for `AP` (complex elements)
* @param {NonNegativeInteger} offsetAP - starting index for `AP` (complex elements)
* @param {Float64Array} RCOND - output array of length 1
* @param {Complex128Array} WORK - workspace of length 2*N
* @param {integer} strideWORK - stride for `WORK` (complex elements)
* @param {NonNegativeInteger} offsetWORK - starting index for `WORK` (complex elements)
* @param {Float64Array} RWORK - workspace of length N
* @param {integer} strideRWORK - stride for `RWORK`
* @param {NonNegativeInteger} offsetRWORK - starting index for `RWORK`
* @throws {TypeError} Second argument must be a valid matrix triangle
* @throws {TypeError} Third argument must be a valid diagonal type
* @returns {integer} info - 0 if successful
*/
function ztpcon( norm, uplo, diag, N, AP, strideAP, offsetAP, RCOND, WORK, strideWORK, offsetWORK, RWORK, strideRWORK, offsetRWORK ) { // eslint-disable-line max-len, max-params
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( !isDiagonalType( diag ) ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid diagonal type. Value: `%s`.', diag ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( norm, uplo, diag, N, AP, strideAP, offsetAP, RCOND, WORK, strideWORK, offsetWORK, RWORK, strideRWORK, offsetRWORK ); // eslint-disable-line max-len
}


// EXPORTS //

export default ztpcon;
