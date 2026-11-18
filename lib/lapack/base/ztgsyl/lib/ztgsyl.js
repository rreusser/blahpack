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
import isMatrixTranspose from '@stdlib/blas/base/assert/is-transpose-operation/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Solves the generalized Sylvester equation using a level-3 blocked algorithm.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {string} trans - trans
* @param {integer} ijob - ijob
* @param {PositiveInteger} M - M
* @param {PositiveInteger} N - N
* @param {Complex128Array} A - A
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Complex128Array} B - B
* @param {PositiveInteger} LDB - leading dimension of `B`
* @param {Complex128Array} C - C
* @param {PositiveInteger} LDC - leading dimension of `C`
* @param {Complex128Array} D - D
* @param {PositiveInteger} LDD - leading dimension of `D`
* @param {Complex128Array} E - E
* @param {PositiveInteger} LDE - leading dimension of `E`
* @param {Complex128Array} F - F
* @param {PositiveInteger} LDF - leading dimension of `F`
* @param {Float64Array} scale - scale
* @param {Float64Array} dif - dif
* @param {Complex128Array} WORK - WORK
* @param {Int32Array} IWORK - IWORK
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} if a string argument is not a valid option
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info status code
*/
function ztgsyl( order, trans, ijob, M, N, A, LDA, B, LDB, C, LDC, D, LDD, E, LDE, F, LDF, scale, dif, WORK, IWORK ) { // eslint-disable-line max-len, max-params

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
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
	if ( !isMatrixTranspose( trans ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid transpose operation. Value: `%s`.', trans ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( LDA < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Seventh argument violates the reference leading-dimension rule (rejected when `LDA.LT.MAX( 1, M )`). Value: `%d`.', LDA ) );
	}
	if ( LDB < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Ninth argument violates the reference leading-dimension rule (rejected when `LDB.LT.MAX( 1, N )`). Value: `%d`.', LDB ) );
	}
	if ( order === 'column-major' && ( LDC < max( 1, M ) ) ) {
		throw new RangeError( format( 'invalid argument. Eleventh argument violates the reference leading-dimension rule (column-major: rejected when `LDC.LT.MAX( 1, M )`). Value: `%d`.', LDC ) );
	}
	if ( order === 'row-major' && ( LDC < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Eleventh argument violates the reference leading-dimension rule (row-major: must also cover the N columns). Value: `%d`.', LDC ) );
	}
	if ( LDD < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Thirteenth argument violates the reference leading-dimension rule (rejected when `LDD.LT.MAX( 1, M )`). Value: `%d`.', LDD ) );
	}
	if ( LDE < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Fifteenth argument violates the reference leading-dimension rule (rejected when `LDE.LT.MAX( 1, N )`). Value: `%d`.', LDE ) );
	}
	if ( order === 'column-major' && ( LDF < max( 1, M ) ) ) {
		throw new RangeError( format( 'invalid argument. Seventeenth argument violates the reference leading-dimension rule (column-major: rejected when `LDF.LT.MAX( 1, M )`). Value: `%d`.', LDF ) );
	}
	if ( order === 'row-major' && ( LDF < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Seventeenth argument violates the reference leading-dimension rule (row-major: must also cover the N columns). Value: `%d`.', LDF ) );
	}
	return base( trans, ijob, M, N, A, sa1, sa2, 0, B, sb1, sb2, 0, C, sc1, sc2, 0, D, sd1, sd2, 0, E, se1, se2, 0, F, sf1, sf2, 0, scale, dif, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default ztgsyl;
