
// MODULES //

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import isDiagonalType from '@stdlib/blas/base/assert/is-diagonal-type/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Estimates the reciprocal condition number of a complex triangular band matrix.
*
* @param {string} norm - norm type: 'one-norm' or 'inf-norm'
* @param {string} uplo - 'upper' or 'lower'
* @param {string} diag - 'unit' or 'non-unit'
* @param {NonNegativeInteger} N - order of the matrix
* @param {NonNegativeInteger} kd - number of super/sub-diagonals
* @param {Complex128Array} AB - triangular band matrix in band storage
* @param {PositiveInteger} LDAB - leading dimension of `AB`
* @param {Float64Array} RCOND - output array of length 1
* @param {Complex128Array} WORK - workspace of length 2*N
* @param {integer} strideWORK - stride for `WORK`
* @param {Float64Array} RWORK - workspace of length N
* @param {integer} strideRWORK - stride for `RWORK`
* @throws {TypeError} if a string argument is not a valid option
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info - 0 if successful
*/
function ztbcon( norm, uplo, diag, N, kd, AB, LDAB, RCOND, WORK, strideWORK, RWORK, strideRWORK ) { // eslint-disable-line max-params, max-len
	var orwork;
	var owork;

	if ( WORK === null || WORK === void 0 ) {
		var minWork = Math.max( 1, 2 * N );
		WORK = new Float64Array( minWork );
		strideWORK = 1;
	}
	if ( RWORK === null || RWORK === void 0 ) {
		var minRwork = Math.max( 1, N );
		RWORK = new Float64Array( minRwork );
		strideRWORK = 1;
	}
	owork = stride2offset( 2 * N, strideWORK );
	orwork = stride2offset( N, strideRWORK );
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( norm !== 'one-norm' && norm !== 'inf-norm' ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid norm. Value: `%s`.', norm ) );
	}
	if ( !isDiagonalType( diag ) ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid diagonal type. Value: `%s`.', diag ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( LDAB < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be greater than or equal to max(1,N). Value: `%d`.', LDAB ) );
	}
	return base( norm, uplo, diag, N, kd, AB, 1, LDAB, 0, RCOND, WORK, strideWORK, owork, RWORK, strideRWORK, orwork ); // eslint-disable-line max-len
}


// EXPORTS //

export default ztbcon;
