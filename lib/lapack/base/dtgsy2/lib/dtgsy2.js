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
import ndarray from './ndarray.js';


// MAIN //

/**
* Solves the generalized Sylvester equation (unblocked algorithm).
*
* @param {Layout} order - storage layout ('row-major' or 'column-major')
* @param {('no-transpose'|'transpose')} trans - `'no-transpose'`: solve the generalized Sylvester equation (1). `'transpose'`: solve the 'transposed' system (3).
* @param {integer} ijob - specifies what kind of functionality to be performed. = 0: solve (1) only. = 1: A contribution from this subsystem to a Frobenius norm-based estimate of the separation between two matrix pairs is computed.
* @param {NonNegativeInteger} M - the order of A and D, and the row dimension of C, F, R and L.
* @param {NonNegativeInteger} N - the order of B and E, and the column dimension of C, F, R and L.
* @param {Float64Array} A - on entry, A contains an upper quasi triangular matrix.
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Float64Array} B - on entry, B contains an upper quasi triangular matrix.
* @param {PositiveInteger} LDB - leading dimension of `B`
* @param {Float64Array} C - on entry, C contains the right-hand-side of the first matrix equation in (1). On exit, if IJOB = 0, C has been overwritten by the solution R.
* @param {PositiveInteger} LDC - leading dimension of `C`
* @param {Float64Array} D - on entry, D contains an upper triangular matrix.
* @param {PositiveInteger} LDD - leading dimension of `D`
* @param {Float64Array} E - on entry, E contains an upper triangular matrix.
* @param {PositiveInteger} LDE - leading dimension of `E`
* @param {Float64Array} F - on entry, F contains the right-hand-side of the second matrix equation in (1). On exit, if IJOB = 0, F has been overwritten by the solution L.
* @param {PositiveInteger} LDF - leading dimension of `F`
* @param {Float64Array} scale - on exit, 0 <= SCALE <= 1.
* @param {Float64Array} rdsum - on entry, the sum of squares of computed contributions to the Dif-estimate under computation by DTGSYL, where the scaling factor RDSCAL (see below) has been factored out. On exit, the corresponding sum of squares updated with the contributions from the current sub-system.
* @param {Float64Array} rdscal - on entry, scaling factor used to prevent overflow in RDSUM. On exit, RDSCAL is updated w.r.t. the current contributions in RDSUM.
* @param {(Int32Array|null)} IWORK - caller-owned integer workspace of length M+N+2 (allocated internally when `null`)
* @param {Int32Array} pq - on exit, the number of subsystems (of size 2-by-2, 4-by-4 and 8-by-8) solved by this routine.
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be one of the following: "no-transpose", "transpose"
* @throws {RangeError} third argument is invalid (rejected when `trans === "no-transpose" && ( ijob < 0 || ijob > 2 )`)
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
function dtgsy2( order, trans, ijob, M, N, A, LDA, B, LDB, C, LDC, D, LDD, E, LDE, F, LDF, scale, rdsum, rdscal, IWORK, pq ) { // eslint-disable-line max-len, max-params

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( trans !== 'no-transpose' && trans !== 'transpose' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be one of the following: "no-transpose", "transpose". Value: `%s`.', trans ) );
	}
	if ( trans === 'no-transpose' && ( ijob < 0 || ijob > 2 ) ) {
		throw new RangeError( format( 'invalid argument. Third argument is invalid (rejected when `trans === "no-transpose" && ( ijob < 0 || ijob > 2 )`). Value: `%d`.', ijob ) );
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
	if ( IWORK === null || IWORK === void 0 ) {
		const minIwork = Math.max( 1, M + N + 2 );
		IWORK = new Int32Array( minIwork );
	}
	return ndarray( trans, ijob, M, N, A, sa1, sa2, 0, B, sb1, sb2, 0, C, sc1, sc2, 0, D, sd1, sd2, 0, E, se1, se2, 0, F, sf1, sf2, 0, scale, rdsum, rdscal, IWORK, 1, 0, pq ); // eslint-disable-line max-len
}


// EXPORTS //

export default dtgsy2;
