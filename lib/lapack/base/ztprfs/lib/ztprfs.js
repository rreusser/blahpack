
// MODULES //

import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import isTransposeOperation from '@stdlib/blas/base/assert/is-transpose-operation/lib/index.js';
import isDiagonalType from '@stdlib/blas/base/assert/is-diagonal-type/lib/index.js';
import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import isMatrixTranspose from '@stdlib/blas/base/assert/is-transpose-operation/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Provides error bounds and backward error estimates for the solution to a system of linear equations with a packed complex triangular coefficient matrix.
*
* @param {string} uplo - specifies whether the matrix is upper or lower triangular
* @param {string} trans - specifies the form of the system of equations
* @param {string} diag - specifies whether the matrix is unit triangular
* @param {NonNegativeInteger} N - order of the matrix A
* @param {NonNegativeInteger} nrhs - number of right-hand sides
* @param {Complex128Array} AP - packed triangular matrix A
* @param {Complex128Array} B - right-hand side matrix B
* @param {PositiveInteger} LDB - leading dimension of `B`
* @param {Complex128Array} X - solution matrix X
* @param {PositiveInteger} LDX - leading dimension of `X`
* @param {Float64Array} FERR - forward error bounds
* @param {integer} strideFERR - stride for `FERR`
* @param {Float64Array} BERR - backward errors
* @param {integer} strideBERR - stride for `BERR`
* @param {Complex128Array} WORK - complex workspace array
* @param {integer} strideWORK - stride for `WORK`
* @param {Float64Array} RWORK - real workspace array
* @param {integer} strideRWORK - stride for `RWORK`
* @throws {TypeError} First argument must be a valid matrix triangle
* @throws {TypeError} Second argument must be a valid transpose operation
* @throws {TypeError} Third argument must be a valid diagonal type
* @returns {integer} status code (0 = success)
*/
function ztprfs( uplo, trans, diag, N, nrhs, AP, B, LDB, X, LDX, FERR, strideFERR, BERR, strideBERR, WORK, strideWORK, RWORK, strideRWORK ) { // eslint-disable-line max-len, max-params
	var orwork;
	var oberr;
	var oferr;
	var owork;

	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( !isTransposeOperation( trans ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid transpose operation. Value: `%s`.', trans ) );
	}
	if ( !isDiagonalType( diag ) ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid diagonal type. Value: `%s`.', diag ) );
	}
	oferr = stride2offset( nrhs, strideFERR );
	oberr = stride2offset( nrhs, strideBERR );
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
	if ( !isMatrixTranspose( trans ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid transpose operation. Value: `%s`.', trans ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( nrhs < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', nrhs ) );
	}
	if ( LDB < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be greater than or equal to max(1,N). Value: `%d`.', LDB ) );
	}
	if ( LDX < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Tenth argument must be greater than or equal to max(1,N). Value: `%d`.', LDX ) );
	}
	return base( uplo, trans, diag, N, nrhs, AP, 1, 0, B, 1, LDB, 0, X, 1, LDX, 0, FERR, strideFERR, oferr, BERR, strideBERR, oberr, WORK, strideWORK, owork, RWORK, strideRWORK, orwork ); // eslint-disable-line max-len
}


// EXPORTS //

export default ztprfs;
