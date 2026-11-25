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

import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes the solution to system of linear equations A·X = B.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {string} uplo - `'upper'`: Upper triangle of A is stored; `'lower'`: Lower triangle of A is stored.
* @param {NonNegativeInteger} N - the number of linear equations, i.e., the order of the matrix A.
* @param {NonNegativeInteger} kd - the number of superdiagonals of the matrix A if `uplo === 'upper'`, or the number of subdiagonals if `uplo === 'lower'`.
* @param {NonNegativeInteger} nrhs - the number of right hand sides, i.e., the number of columns of the matrix B.
* @param {Complex128Array} AB - on entry, the upper or lower triangle of the Hermitian band matrix A, stored in the first KD+1 rows of the array. On exit, if INFO = 0, the triangular factor U or L from the Cholesky factorization A = U**H *U or A = L*L**H of the band matrix A, in the same storage format as A.
* @param {PositiveInteger} LDAB - leading dimension of `AB`
* @param {Complex128Array} B - on entry, the N-by-NRHS right hand side matrix B. On exit, if INFO = 0, the N-by-NRHS solution matrix X.
* @param {PositiveInteger} LDB - leading dimension of `B`
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be a valid matrix triangle
* @throws {RangeError} third argument must be a nonnegative integer
* @throws {RangeError} fourth argument must be a nonnegative integer
* @throws {RangeError} fifth argument must be a nonnegative integer
* @throws {RangeError} seventh argument must be greater than or equal to `kd + 1` (column-major)
* @throws {RangeError} seventh argument must be greater than or equal to `max( 1, N )` (row-major)
* @throws {RangeError} ninth argument must be greater than or equal to `max( 1, N )` (column-major)
* @throws {RangeError} ninth argument must be greater than or equal to `max( 1, nrhs )` (row-major)
* @throws {TypeError} if a string argument is not a valid option
* @returns {integer} info status code
*/
function zpbsv( order, uplo, N, kd, nrhs, AB, LDAB, B, LDB ) { // eslint-disable-line max-len, max-params

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( kd < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', kd ) );
	}
	if ( nrhs < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', nrhs ) );
	}
	if ( order === 'column-major' && ( LDAB < kd + 1 ) ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be greater than or equal to %d. Value: `%d`.', kd + 1, LDAB ) );
	}
	if ( order === 'row-major' && ( LDAB < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDAB ) );
	}
	if ( order === 'column-major' && ( LDB < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Ninth argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDB ) );
	}
	if ( order === 'row-major' && ( LDB < max( 1, nrhs ) ) ) {
		throw new RangeError( format( 'invalid argument. Ninth argument must be greater than or equal to max(1,%d). Value: `%d`.', nrhs, LDB ) );
	}
	const sab1 = ( order === 'column-major' ) ? 1 : LDAB;
	const sab2 = ( order === 'column-major' ) ? LDAB : 1;
	const sb1 = ( order === 'column-major' ) ? 1 : LDB;
	const sb2 = ( order === 'column-major' ) ? LDB : 1;
	return base( uplo, N, kd, nrhs, AB, sab1, sab2, 0, B, sb1, sb2, 0 );
}


// EXPORTS //

export default zpbsv;
