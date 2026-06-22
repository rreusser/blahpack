
// MODULES //

import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Improves the computed solution to a complex system of linear equations when.
* the coefficient matrix is Hermitian positive definite stored in packed format,
* and provides error bounds and backward error estimates for the solution.
*
* @param {string} uplo - specifies whether 'upper' or 'lower' triangle is stored
* @param {NonNegativeInteger} N - order of matrix A
* @param {NonNegativeInteger} nrhs - number of right-hand side columns
* @param {Complex128Array} AP - original Hermitian matrix in packed storage
* @param {Complex128Array} AFP - Cholesky-factored matrix in packed storage (from zpptrf)
* @param {Complex128Array} B - right-hand side matrix (column-major)
* @param {PositiveInteger} LDB - leading dimension of B
* @param {Complex128Array} X - solution matrix (improved on exit)
* @param {PositiveInteger} LDX - leading dimension of X
* @param {Float64Array} FERR - output forward error bounds (length nrhs)
* @param {Float64Array} BERR - output backward error bounds (length nrhs)
* @param {Complex128Array} WORK - workspace array (length >= 2*N)
* @param {Float64Array} RWORK - real workspace array (length >= N)
* @returns {integer} info - 0 if successful
*/
function zpprfs( uplo, N, nrhs, AP, AFP, B, LDB, X, LDX, FERR, BERR, WORK, RWORK ) { // eslint-disable-line max-len, max-params
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( nrhs < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', nrhs ) );
	}
	if ( LDB < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be greater than or equal to max(1,N). Value: `%d`.', LDB ) );
	}
	if ( LDX < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Ninth argument must be greater than or equal to max(1,N). Value: `%d`.', LDX ) );
	}
	return base( uplo, N, nrhs, AP, 1, 0, AFP, 1, 0, B, 1, LDB, 0, X, 1, LDX, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default zpprfs;
