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
import base from './base.js';


// MAIN //

/**
* Solves the generalized Sylvester matrix equation for small subsystems.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {string} trans - 'no-transpose' or 'conjugate-transpose'
* @param {integer} ijob - 0: solve only; 2: solve + estimate DIF
* @param {PositiveInteger} M - number of rows in C, F and order of (A,D)
* @param {PositiveInteger} N - number of columns in C, F and order of (B,E)
* @param {Complex128Array} A - M-by-M upper triangular matrix
* @param {PositiveInteger} LDA - leading dimension of A
* @param {Complex128Array} B - N-by-N upper triangular matrix
* @param {PositiveInteger} LDB - leading dimension of B
* @param {Complex128Array} C - M-by-N right-hand side / solution
* @param {PositiveInteger} LDC - leading dimension of C
* @param {Complex128Array} D - M-by-M upper triangular matrix
* @param {PositiveInteger} LDD - leading dimension of D
* @param {Complex128Array} E - N-by-N upper triangular matrix
* @param {PositiveInteger} LDE - leading dimension of E
* @param {Complex128Array} F - M-by-N right-hand side / solution
* @param {PositiveInteger} LDF - leading dimension of F
* @param {Float64Array} scale - output: scale[0] is the scaling factor
* @param {Float64Array} rdsum - in/out: rdsum[0]
* @param {Float64Array} rdscal - in/out: rdscal[0]
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} if a string argument is not a valid option
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info - 0 if successful, >0 from zgetc2
*/
function ztgsy2( order, trans, ijob, M, N, A, LDA, B, LDB, C, LDC, D, LDD, E, LDE, F, LDF, scale, rdsum, rdscal ) { // eslint-disable-line max-len, max-params
	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( trans !== 'conjugate-transpose' && trans !== 'no-transpose' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be one of the following: "conjugate-transpose", "no-transpose". Value: `%s`.', trans ) );
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
	return base( trans, ijob, M, N, A, sa1, sa2, 0, B, sb1, sb2, 0, C, sc1, sc2, 0, D, sd1, sd2, 0, E, se1, se2, 0, F, sf1, sf2, 0, scale, rdsum, rdscal ); // eslint-disable-line max-len
}


// EXPORTS //

export default ztgsy2;
