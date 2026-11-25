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
import isTransposeOperation from '@stdlib/blas/base/assert/is-transpose-operation/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Solves the real Sylvester matrix equation: op(A)·X + X·op(B) = scale·C or op(A)·X - X·op(B) = scale·C.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {string} trana - specifies the option op(A): `'no-transpose'`: op(A) = A (No transpose) `'transpose'`: op(A) = A**T (Transpose)
* @param {string} tranb - specifies the option op(B): `'no-transpose'`: op(B) = B (No transpose) `'transpose'`: op(B) = B**T (Transpose)
* @param {integer} isgn - specifies the sign in the equation: = +1: solve op(A)*X + X*op(B) = scale*C = -1: solve op(A)*X - X*op(B) = scale*C.
* @param {NonNegativeInteger} M - the order of the matrix A, and the number of rows in the matrices X and C.
* @param {NonNegativeInteger} N - the order of the matrix B, and the number of columns in the matrices X and C.
* @param {Float64Array} A - the upper quasi-triangular matrix A, in Schur canonical form.
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Float64Array} B - the upper quasi-triangular matrix B, in Schur canonical form.
* @param {PositiveInteger} LDB - leading dimension of `B`
* @param {Float64Array} C - on entry, the M-by-N right hand side matrix C. On exit, C is overwritten by the solution matrix X.
* @param {PositiveInteger} LDC - leading dimension of `C`
* @param {Float64Array} scale - the scale factor, scale, set <= 1 to avoid overflow in X.
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be a valid transpose operation
* @throws {TypeError} third argument must be a valid transpose operation
* @throws {RangeError} fourth argument is invalid (rejected when `isgn !== 1 && isgn !== - 1`)
* @throws {RangeError} fifth argument must be a nonnegative integer
* @throws {RangeError} sixth argument must be a nonnegative integer
* @throws {RangeError} eighth argument must be greater than or equal to `max( 1, M )`
* @throws {RangeError} tenth argument must be greater than or equal to `max( 1, N )`
* @throws {RangeError} twelfth argument must be greater than or equal to `max( 1, M )` (column-major)
* @throws {RangeError} twelfth argument must be greater than or equal to `max( 1, N )` (row-major)
* @throws {TypeError} if a string argument is not a valid option
* @returns {integer} info status code
*/
function dtrsyl( order, trana, tranb, isgn, M, N, A, LDA, B, LDB, C, LDC, scale ) { // eslint-disable-line max-len, max-params

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( !isTransposeOperation( trana ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid transpose operation. Value: `%s`.', trana ) );
	}
	if ( !isTransposeOperation( tranb ) ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid transpose operation. Value: `%s`.', tranb ) );
	}
	if ( isgn !== 1 && isgn !== - 1 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument is invalid (rejected when `isgn !== 1 && isgn !== - 1`). Value: `%d`.', isgn ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( LDA < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be greater than or equal to max(1,%d). Value: `%d`.', M, LDA ) );
	}
	if ( LDB < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Tenth argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDB ) );
	}
	if ( order === 'column-major' && ( LDC < max( 1, M ) ) ) {
		throw new RangeError( format( 'invalid argument. Twelfth argument must be greater than or equal to max(1,%d). Value: `%d`.', M, LDC ) );
	}
	if ( order === 'row-major' && ( LDC < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Twelfth argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDC ) );
	}
	const sa1 = ( order === 'column-major' ) ? 1 : LDA;
	const sa2 = ( order === 'column-major' ) ? LDA : 1;
	const sb1 = ( order === 'column-major' ) ? 1 : LDB;
	const sb2 = ( order === 'column-major' ) ? LDB : 1;
	const sc1 = ( order === 'column-major' ) ? 1 : LDC;
	const sc2 = ( order === 'column-major' ) ? LDC : 1;
	return base( trana, tranb, isgn, M, N, A, sa1, sa2, 0, B, sb1, sb2, 0, C, sc1, sc2, 0, scale );
}


// EXPORTS //

export default dtrsyl;
