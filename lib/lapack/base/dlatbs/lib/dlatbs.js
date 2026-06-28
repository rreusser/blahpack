
// MODULES //

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import isMatrixTranspose from '@stdlib/blas/base/assert/is-transpose-operation/lib/index.js';
import isDiagonalType from '@stdlib/blas/base/assert/is-diagonal-type/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* @license Apache-2.0
*
* @param {string} uplo - uplo
* @param {string} trans - trans
* @param {string} diag - diag
* @param {string} normin - normin
* @param {NonNegativeInteger} N - N
* @param {NonNegativeInteger} kd - kd
* @param {Float64Array} AB - AB
* @param {PositiveInteger} LDAB - leading dimension of `AB`
* @param {Float64Array} x - x
* @param {integer} strideX - strideX
* @param {Float64Array} scale - scale
* @param {Float64Array} CNORM - CNORM
* @param {integer} strideCNORM - strideCNORM
* @throws {TypeError} if a string argument is not a valid option
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info status code
*/
function dlatbs( uplo, trans, diag, normin, N, kd, AB, LDAB, x, strideX, scale, CNORM, strideCNORM ) { // eslint-disable-line max-len, max-params
	var ocnorm;
	var sab1;
	var sab2;
	var ox;

	sab1 = 1;
	sab2 = LDAB;
	ox = stride2offset( N, strideX );
	ocnorm = stride2offset( N, strideCNORM );
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
	if ( LDAB < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be greater than or equal to max(1,N). Value: `%d`.', LDAB ) );
	}
	if ( normin !== 'no' ) {
		throw new TypeError( format( 'invalid argument. Fourth argument must be a valid `normin` value. Value: `%s`.', normin ) );
	}
	return base( uplo, trans, diag, normin, N, kd, AB, sab1, sab2, 0, x, strideX, ox, scale, CNORM, strideCNORM, ocnorm ); // eslint-disable-line max-len
}


// EXPORTS //

export default dlatbs;
