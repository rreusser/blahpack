
// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Estimates the reciprocal of the condition number of a complex Hermitian positive definite matrix in packed storage.
*
* @private
* @param {string} uplo - specifies whether the matrix is upper or lower triangular
* @param {NonNegativeInteger} N - order of the matrix
* @param {Complex128Array} AP - packed Cholesky factor
* @param {number} anorm - the 1-norm of the original matrix
* @param {Float64Array} rcond - output reciprocal condition number
* @param {Complex128Array} WORK - workspace array of length 2*N
* @param {Float64Array} RWORK - workspace array of length N
* @returns {integer} info - 0 if successful
*/
function zppcon( uplo, N, AP, anorm, rcond, WORK, RWORK ) {
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( WORK === null || WORK === void 0 ) {
		var minWork = Math.max( 1, 2 * N );
		WORK = new Float64Array( minWork );
	}
	if ( RWORK === null || RWORK === void 0 ) {
		var minRwork = Math.max( 1, N );
		RWORK = new Float64Array( minRwork );
	}
	return base( uplo, N, AP, 1, 0, anorm, rcond, WORK, 1, 0, RWORK, 1, 0 );
}


// EXPORTS //

export default zppcon;
