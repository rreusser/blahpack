/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

// MODULES //

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import ndarray from './ndarray.js';


// MAIN //

/**
* Improves the computed solution to a complex system of linear equations when.
* the coefficient matrix is Hermitian positive definite stored in packed format,
* and provides error bounds and backward error estimates for the solution.
*
* @param {Layout} order - storage layout ('row-major' or 'column-major')
* @param {MatrixTriangle} uplo - specifies whether 'upper' or 'lower' triangle is stored
* @param {NonNegativeInteger} N - order of matrix A
* @param {NonNegativeInteger} nrhs - number of right-hand side columns
* @param {Complex128Array} AP - original Hermitian matrix in packed storage
* @param {Complex128Array} AFP - Cholesky-factored matrix in packed storage (from zpptrf)
* @param {Complex128Array} B - right-hand side matrix (column-major)
* @param {PositiveInteger} LDB - leading dimension of B
* @param {Complex128Array} X - solution matrix (improved on exit)
* @param {PositiveInteger} LDX - leading dimension of X
* @param {Float64Array} FERR - output forward error bounds (length nrhs)
* @param {integer} strideFERR - stride length for `FERR`
* @param {Float64Array} BERR - output backward error bounds (length nrhs)
* @param {integer} strideBERR - stride length for `BERR`
* @param {(Complex128Array|null)} WORK - workspace array (length >= 2*N)
* @param {(Float64Array|null)} RWORK - real workspace array (length >= N)
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be a valid matrix triangle
* @throws {RangeError} third argument must be a nonnegative integer
* @throws {RangeError} fourth argument must be a nonnegative integer
* @throws {RangeError} eighth argument must be greater than or equal to `max( 1, N )` (column-major)
* @throws {RangeError} eighth argument must be greater than or equal to `max( 1, nrhs )` (row-major)
* @throws {RangeError} tenth argument must be greater than or equal to `max( 1, N )` (column-major)
* @throws {RangeError} tenth argument must be greater than or equal to `max( 1, nrhs )` (row-major)
* @throws {TypeError} if a string argument is not a valid option
* @returns {integer} info - 0 if successful
*/
function zpprfs( order, uplo, N, nrhs, AP, AFP, B, LDB, X, LDX, FERR, strideFERR, BERR, strideBERR, WORK, RWORK ) { // eslint-disable-line max-len, max-params
	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( nrhs < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', nrhs ) );
	}
	if ( order === 'column-major' && ( LDB < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDB ) );
	}
	if ( order === 'row-major' && ( LDB < max( 1, nrhs ) ) ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be greater than or equal to max(1,%d). Value: `%d`.', nrhs, LDB ) );
	}
	if ( order === 'column-major' && ( LDX < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Tenth argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDX ) );
	}
	if ( order === 'row-major' && ( LDX < max( 1, nrhs ) ) ) {
		throw new RangeError( format( 'invalid argument. Tenth argument must be greater than or equal to max(1,%d). Value: `%d`.', nrhs, LDX ) );
	}
	const oferr = stride2offset( nrhs, strideFERR );
	const oberr = stride2offset( nrhs, strideBERR );
	const sb1 = ( order === 'column-major' ) ? 1 : LDB;
	const sb2 = ( order === 'column-major' ) ? LDB : 1;
	const sx1 = ( order === 'column-major' ) ? 1 : LDX;
	const sx2 = ( order === 'column-major' ) ? LDX : 1;
	if ( WORK === null || WORK === void 0 ) {
		const minWork = Math.max( 1, 2 * N );
		WORK = new Complex128Array( minWork );
	}
	if ( RWORK === null || RWORK === void 0 ) {
		const minRwork = Math.max( 1, N );
		RWORK = new Float64Array( minRwork );
	}
	return ndarray( uplo, N, nrhs, AP, 1, 0, AFP, 1, 0, B, sb1, sb2, 0, X, sx1, sx2, 0, FERR, strideFERR, oferr, BERR, strideBERR, oberr, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default zpprfs;
