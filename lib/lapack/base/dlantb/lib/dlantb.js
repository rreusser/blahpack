// MODULES //

import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import isDiagonalType from '@stdlib/blas/base/assert/is-diagonal-type/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Returns the value of the one norm, Frobenius norm, infinity norm, or largest absolute value of a real triangular band matrix using column-major order.
*
* @param {string} norm - norm type
* @param {string} uplo - specifies whether the matrix is upper or lower triangular
* @param {string} diag - specifies whether the diagonal is unit
* @param {NonNegativeInteger} N - order of the matrix
* @param {NonNegativeInteger} K - number of super-diagonals (upper) or sub-diagonals (lower)
* @param {Float64Array} AB - band matrix
* @param {NonNegativeInteger} LDAB - leading dimension of `AB`
* @param {Float64Array} WORK - workspace array
* @throws {TypeError} second argument must be a valid matrix triangle
* @throws {TypeError} third argument must be a valid diagonal type
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {number} norm value
*/
function dlantb( norm, uplo, diag, N, K, AB, LDAB, WORK ) { // eslint-disable-line max-params
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( norm !== 'max' && norm !== 'one-norm' && norm !== 'inf-norm' && norm !== 'frobenius' ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid norm. Value: `%s`.', norm ) );
	}
	if ( !isDiagonalType( diag ) ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid diagonal type. Value: `%s`.', diag ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( K < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', K ) );
	}
	if ( LDAB < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be greater than or equal to max(1,N). Value: `%d`.', LDAB ) );
	}
	if ( WORK === null || WORK === void 0 ) {
		var minWork = N;
		WORK = new Float64Array( minWork );
	}
	return base( norm, uplo, diag, N, K, AB, 1, LDAB, 0, WORK, 1, 0 );
}


// EXPORTS //

export default dlantb;
