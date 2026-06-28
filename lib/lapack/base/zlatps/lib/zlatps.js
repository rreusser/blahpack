

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import isMatrixTranspose from '@stdlib/blas/base/assert/is-transpose-operation/lib/index.js';
import isDiagonalType from '@stdlib/blas/base/assert/is-diagonal-type/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Solves a complex triangular system with scaling to prevent overflow, where the matrix is in packed storage.
*
* @private
* @param {string} uplo - specifies whether the matrix is upper or lower triangular
* @param {string} trans - specifies the operation applied to A
* @param {string} diag - specifies whether the matrix is unit or non-unit triangular
* @param {string} normin - specifies whether CNORM is pre-computed
* @param {NonNegativeInteger} N - order of the matrix
* @param {Complex128Array} AP - packed triangular matrix
* @param {Complex128Array} x - right-hand side vector
* @param {Float64Array} scale - output scale factor
* @param {Float64Array} CNORM - column norm array
* @throws {TypeError} if a string argument is not a valid option
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info - 0 if successful
*/
function zlatps( uplo, trans, diag, normin, N, AP, x, scale, CNORM ) { // eslint-disable-line max-params
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( !isMatrixTranspose( trans ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid transpose operation. Value: `%s`.', trans ) );
	}
	if ( !isDiagonalType( diag ) ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid diagonal type. Value: `%s`.', diag ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( normin !== 'no' ) {
		throw new TypeError( format( 'invalid argument. Fourth argument must be a valid `normin` value. Value: `%s`.', normin ) );
	}
	return base( uplo, trans, diag, normin, N, AP, 1, 0, x, 1, 0, scale, CNORM, 1, 0 );
}


// EXPORTS //

export default zlatps;
