
// MODULES //

import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Reduces a real symmetric-definite banded generalized eigenproblem to standard form.
*
* @param {string} vect - 'none' or 'update'
* @param {string} uplo - 'upper' or 'lower'
* @param {NonNegativeInteger} N - order of matrices A and B
* @param {integer} ka - number of super/subdiagonals of A
* @param {integer} kb - number of super/subdiagonals of B (ka >= kb >= 0)
* @param {Float64Array} AB - band matrix A in band storage
* @param {PositiveInteger} LDAB - leading dimension of AB (>= ka+1)
* @param {Float64Array} BB - split Cholesky factor from DPBSTF
* @param {PositiveInteger} LDBB - leading dimension of BB (>= kb+1)
* @param {Float64Array} X - transformation matrix
* @param {PositiveInteger} LDX - leading dimension of X
* @param {Float64Array} WORK - workspace of dimension 2*N
* @returns {integer} info - 0 if successful
*/
function dsbgst( vect, uplo, N, ka, kb, AB, LDAB, BB, LDBB, X, LDX, WORK ) { // eslint-disable-line max-len, max-params
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( LDAB < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be greater than or equal to max(1,N). Value: `%d`.', LDAB ) );
	}
	if ( LDBB < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Ninth argument must be greater than or equal to max(1,N). Value: `%d`.', LDBB ) );
	}
	if ( LDX < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Eleventh argument must be greater than or equal to max(1,N). Value: `%d`.', LDX ) );
	}
	if ( vect !== 'update' ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid `vect` value. Value: `%s`.', vect ) );
	}
	return base( vect, uplo, N, ka, kb, AB, 1, LDAB, 0, BB, 1, LDBB, 0, X, 1, LDX, 0, WORK, 1, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default dsbgst;
