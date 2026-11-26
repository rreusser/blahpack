/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable max-len, max-params */

// MODULES //

import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import ndarray from './ndarray.js';


// MAIN //

/**
* Estimates reciprocal condition numbers for eigenvalues and eigenvectors of a complex triangular matrix.
*
* @param {Layout} order - storage layout (`'row-major'` or `'column-major'`)
* @param {('eigenvalues'|'eigenvectors'|'both')} job - `'eigenvalues'`, `'eigenvectors'`, or `'both'`
* @param {('all'|'selected')} howmny - `'all'` or `'selected'`
* @param {Uint8Array} SELECT - boolean selection array
* @param {integer} strideSELECT - stride length for `SELECT`
* @param {NonNegativeInteger} N - order of the matrix T
* @param {Complex128Array} T - input upper triangular matrix
* @param {PositiveInteger} LDT - leading dimension of `T`
* @param {Complex128Array} VL - left eigenvector matrix
* @param {PositiveInteger} LDVL - leading dimension of `VL`
* @param {Complex128Array} VR - right eigenvector matrix
* @param {PositiveInteger} LDVR - leading dimension of `VR`
* @param {Float64Array} s - output: reciprocal condition numbers of eigenvalues
* @param {integer} strideS - stride length for `s`
* @param {Float64Array} SEP - output: reciprocal condition numbers of eigenvectors
* @param {integer} strideSEP - stride length for `SEP`
* @param {NonNegativeInteger} mm - column dimension of VL/VR/WORK
* @param {Int32Array} M - output: M[0] = number of condition numbers produced
* @param {(Complex128Array|null)} WORK - complex workspace
* @param {PositiveInteger} LDWORK - leading dimension of `WORK`
* @param {(Float64Array|null)} RWORK - real workspace
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be one of the following: "both", "eigenvalues", "eigenvectors"
* @throws {TypeError} third argument must be one of the following: "all", "selected"
* @throws {RangeError} sixth argument must be a nonnegative integer
* @throws {RangeError} eighth argument must be greater than or equal to `max( 1, N )`
* @throws {RangeError} tenth argument is invalid (column-major: rejected when `LDVL < 1 || ( ( job === "eigenvalues" || job === "both" ) && LDVL < N )`)
* @throws {RangeError} tenth argument is invalid (row-major: rejected when `LDVL < 1 || ( ( job === "eigenvalues" || job === "both" ) && LDVL < max( 1, mm ) )`)
* @throws {RangeError} twelfth argument is invalid (column-major: rejected when `LDVR < 1 || ( ( job === "eigenvalues" || job === "both" ) && LDVR < N )`)
* @throws {RangeError} twelfth argument is invalid (row-major: rejected when `LDVR < 1 || ( ( job === "eigenvalues" || job === "both" ) && LDVR < max( 1, mm ) )`)
* @throws {RangeError} must supply valid dimensions
* @returns {integer} status code (0 = success)
*/
function ztrsna( order, job, howmny, SELECT, strideSELECT, N, T, LDT, VL, LDVL, VR, LDVR, s, strideS, SEP, strideSEP, mm, M, WORK, LDWORK, RWORK ) { // eslint-disable-line max-len, max-params
	let swork1, swork2, svl1, svl2, svr1, svr2, st1, st2;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( job !== 'both' && job !== 'eigenvalues' && job !== 'eigenvectors' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be one of the following: "both", "eigenvalues", "eigenvectors". Value: `%s`.', job ) );
	}
	if ( howmny !== 'all' && howmny !== 'selected' ) {
		throw new TypeError( format( 'invalid argument. Third argument must be one of the following: "all", "selected". Value: `%s`.', howmny ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( LDT < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDT ) );
	}
	if ( order === 'column-major' && ( LDVL < 1 || ( ( job === 'eigenvalues' || job === 'both' ) && LDVL < N ) ) ) {
		throw new RangeError( format( 'invalid argument. Tenth argument is invalid (column-major: rejected when `LDVL < 1 || ( ( job === "eigenvalues" || job === "both" ) && LDVL < N )`). Value: `%d`.', LDVL ) );
	}
	if ( order === 'row-major' && ( LDVL < 1 || ( ( job === 'eigenvalues' || job === 'both' ) && LDVL < max( 1, mm ) ) ) ) {
		throw new RangeError( format( 'invalid argument. Tenth argument is invalid (row-major: rejected when `LDVL < 1 || ( ( job === "eigenvalues" || job === "both" ) && LDVL < max( 1, mm ) )`). Value: `%d`.', LDVL ) );
	}
	if ( order === 'column-major' && ( LDVR < 1 || ( ( job === 'eigenvalues' || job === 'both' ) && LDVR < N ) ) ) {
		throw new RangeError( format( 'invalid argument. Twelfth argument is invalid (column-major: rejected when `LDVR < 1 || ( ( job === "eigenvalues" || job === "both" ) && LDVR < N )`). Value: `%d`.', LDVR ) );
	}
	if ( order === 'row-major' && ( LDVR < 1 || ( ( job === 'eigenvalues' || job === 'both' ) && LDVR < max( 1, mm ) ) ) ) {
		throw new RangeError( format( 'invalid argument. Twelfth argument is invalid (row-major: rejected when `LDVR < 1 || ( ( job === "eigenvalues" || job === "both" ) && LDVR < max( 1, mm ) )`). Value: `%d`.', LDVR ) );
	}
	if ( order === 'column-major' && ( LDWORK < 1 || ( ( ( job === 'eigenvectors' ) || ( job === 'both' ) ) && LDWORK < N ) ) ) {
		throw new RangeError( format( 'invalid argument. Twentieth argument violates the reference leading-dimension rule (column-major: rejected when `LDWORK.LT.1 .OR. ( WANTSP .AND. LDWORK.LT.N )`). Value: `%d`.', LDWORK ) );
	}
	if ( order === 'row-major' && ( LDWORK < 1 || ( ( ( job === 'eigenvectors' ) || ( job === 'both' ) ) && LDWORK < max( 1, ( N < 2 ) ? N : N + 1 ) ) ) ) {
		throw new RangeError( format( 'invalid argument. Twentieth argument violates the reference leading-dimension rule (row-major: must also cover the ( N < 2 ) ? N : N + 1 columns). Value: `%d`.', LDWORK ) );
	}
	if ( order === 'column-major' ) {
		st1 = 1;
		st2 = LDT;
		svl1 = 1;
		svl2 = LDVL;
		svr1 = 1;
		svr2 = LDVR;
		swork1 = 1;
		swork2 = LDWORK;
	} else {
		st1 = LDT;
		st2 = 1;
		svl1 = LDVL;
		svl2 = 1;
		svr1 = LDVR;
		svr2 = 1;
		swork1 = LDWORK;
		swork2 = 1;
	}
	if ( WORK === null || WORK === void 0 ) {
		const minWork = Math.max( 1, LDWORK * ( N + 1 ) ); // reference WORK( LDWORK, N+1 )
		WORK = new Complex128Array( minWork );
	}
	if ( RWORK === null || RWORK === void 0 ) {
		const minRwork = Math.max( 1, N );
		RWORK = new Float64Array( minRwork );
	}
	return ndarray( job, howmny, SELECT, strideSELECT, 0, N, T, st1, st2, 0, VL, svl1, svl2, 0, VR, svr1, svr2, 0, s, strideS, 0, SEP, strideSEP, 0, mm, M, WORK, swork1, swork2, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default ztrsna;
