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
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import ndarray from './ndarray.js';


// MAIN //

/**
* Solves the generalized Sylvester equation using a level-3 blocked algorithm.
*
* @param {Layout} order - storage layout ('row-major' or 'column-major')
* @param {('no-transpose'|'conjugate-transpose')} trans - `'no-transpose'`: solve the generalized sylvester equation (1). `'conjugate-transpose'`: solve the "conjugate transposed" system (3).
* @param {integer} ijob - specifies what kind of functionality to be performed. =0: solve (1) only. =1: The functionality of 0 and 3. =2: The functionality of 0 and 4. =3: Only an estimate of Dif[(A,D), (B,E)] is computed.
* @param {NonNegativeInteger} M - the order of the matrices A and D, and the row dimension of the matrices C, F, R and L.
* @param {NonNegativeInteger} N - the order of the matrices B and E, and the column dimension of the matrices C, F, R and L.
* @param {Complex128Array} A - the upper triangular matrix A.
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Complex128Array} B - the upper triangular matrix B.
* @param {PositiveInteger} LDB - leading dimension of `B`
* @param {Complex128Array} C - on entry, C contains the right-hand-side of the first matrix equation in (1) or (3). On exit, if IJOB = 0, 1 or 2, C has been overwritten by the solution R.
* @param {PositiveInteger} LDC - leading dimension of `C`
* @param {Complex128Array} D - the upper triangular matrix D.
* @param {PositiveInteger} LDD - leading dimension of `D`
* @param {Complex128Array} E - the upper triangular matrix E.
* @param {PositiveInteger} LDE - leading dimension of `E`
* @param {Complex128Array} F - on entry, F contains the right-hand-side of the second matrix equation in (1) or (3). On exit, if IJOB = 0, 1 or 2, F has been overwritten by the solution L.
* @param {PositiveInteger} LDF - leading dimension of `F`
* @param {Float64Array} scale - on exit SCALE is the scaling factor in (1) or (3).
* @param {Float64Array} dif - on exit DIF is the reciprocal of a lower bound of the reciprocal of the Dif-function, i.e. DIF is an upper bound of Dif[(A,D), (B,E)] = sigma-min(Z), where Z as in (2).
* @param {(Complex128Array|null)} WORK - workspace of length at least `max(1, 2*M*N)` when `trans = 'no-transpose'` and `ijob` is 1 or 2, otherwise 1; allocated (`max(1, 2*M*N)`) when `null`
* @param {(Int32Array|null)} IWORK - workspace of length at least `M+N+2`; allocated when `null`
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be one of the following: "conjugate-transpose", "no-transpose"
* @throws {RangeError} third argument is invalid (rejected when `trans === "no-transpose" && ( ijob < 0 || ijob > 4 )`)
* @throws {RangeError} fourth argument is invalid (rejected when `M <= 0`)
* @throws {RangeError} fifth argument is invalid (rejected when `N <= 0`)
* @throws {RangeError} seventh argument must be greater than or equal to `max( 1, M )`
* @throws {RangeError} ninth argument must be greater than or equal to `max( 1, N )`
* @throws {RangeError} eleventh argument must be greater than or equal to `max( 1, M )` (column-major)
* @throws {RangeError} eleventh argument must be greater than or equal to `max( 1, N )` (row-major)
* @throws {RangeError} thirteenth argument must be greater than or equal to `max( 1, M )`
* @throws {RangeError} fifteenth argument must be greater than or equal to `max( 1, N )`
* @throws {RangeError} seventeenth argument must be greater than or equal to `max( 1, M )` (column-major)
* @throws {RangeError} seventeenth argument must be greater than or equal to `max( 1, N )` (row-major)
* @throws {TypeError} if a string argument is not a valid option
* @returns {integer} info status code
*/
function ztgsyl( order, trans, ijob, M, N, A, LDA, B, LDB, C, LDC, D, LDD, E, LDE, F, LDF, scale, dif, WORK, IWORK ) { // eslint-disable-line max-len, max-params

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( trans !== 'conjugate-transpose' && trans !== 'no-transpose' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be one of the following: "conjugate-transpose", "no-transpose". Value: `%s`.', trans ) );
	}
	if ( trans === 'no-transpose' && ( ijob < 0 || ijob > 4 ) ) {
		throw new RangeError( format( 'invalid argument. Third argument is invalid (rejected when `trans === "no-transpose" && ( ijob < 0 || ijob > 4 )`). Value: `%d`.', ijob ) );
	}
	if ( M <= 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument is invalid (rejected when `M <= 0`). Value: `%d`.', M ) );
	}
	if ( N <= 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument is invalid (rejected when `N <= 0`). Value: `%d`.', N ) );
	}
	if ( LDA < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be greater than or equal to max(1,%d). Value: `%d`.', M, LDA ) );
	}
	if ( LDB < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Ninth argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDB ) );
	}
	if ( order === 'column-major' && ( LDC < max( 1, M ) ) ) {
		throw new RangeError( format( 'invalid argument. Eleventh argument must be greater than or equal to max(1,%d). Value: `%d`.', M, LDC ) );
	}
	if ( order === 'row-major' && ( LDC < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Eleventh argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDC ) );
	}
	if ( LDD < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Thirteenth argument must be greater than or equal to max(1,%d). Value: `%d`.', M, LDD ) );
	}
	if ( LDE < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Fifteenth argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDE ) );
	}
	if ( order === 'column-major' && ( LDF < max( 1, M ) ) ) {
		throw new RangeError( format( 'invalid argument. Seventeenth argument must be greater than or equal to max(1,%d). Value: `%d`.', M, LDF ) );
	}
	if ( order === 'row-major' && ( LDF < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Seventeenth argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDF ) );
	}
	const sa1 = ( order === 'column-major' ) ? 1 : LDA;
	const sa2 = ( order === 'column-major' ) ? LDA : 1;
	const sb1 = ( order === 'column-major' ) ? 1 : LDB;
	const sb2 = ( order === 'column-major' ) ? LDB : 1;
	const sc1 = ( order === 'column-major' ) ? 1 : LDC;
	const sc2 = ( order === 'column-major' ) ? LDC : 1;
	const sd1 = ( order === 'column-major' ) ? 1 : LDD;
	const sd2 = ( order === 'column-major' ) ? LDD : 1;
	const se1 = ( order === 'column-major' ) ? 1 : LDE;
	const se2 = ( order === 'column-major' ) ? LDE : 1;
	const sf1 = ( order === 'column-major' ) ? 1 : LDF;
	const sf2 = ( order === 'column-major' ) ? LDF : 1;
	if ( WORK === null || WORK === void 0 ) {
		const minWork = Math.max( 1, 2 * M * N);
		WORK = new Complex128Array( minWork );
	}
	if ( IWORK === null || IWORK === void 0 ) {
		const minIwork = Math.max( 1, M + N + 2 );
		IWORK = new Int32Array( minIwork );
	}
	return ndarray( trans, ijob, M, N, A, sa1, sa2, 0, B, sb1, sb2, 0, C, sc1, sc2, 0, D, sd1, sd2, 0, E, se1, se2, 0, F, sf1, sf2, 0, scale, dif, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default ztgsyl;
