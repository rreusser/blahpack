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
import base from './base.js';


// MAIN //

/**
* Estimates reciprocal condition numbers of eigenvalues and/or eigenvectors of a real upper quasi-triangular matrix.
*
* @param {Layout} order - storage layout ('row-major' or 'column-major')
* @param {('eigenvalues'|'eigenvectors'|'both')} job - specifies the operation type
* @param {('all'|'selected')} howmny - specifies the operation type
* @param {Uint8Array} SELECT - input array
* @param {integer} strideSELECT - stride length for `SELECT`
* @param {NonNegativeInteger} N - number of columns
* @param {Float64Array} T - input matrix
* @param {PositiveInteger} LDT - leading dimension of `T`
* @param {Float64Array} VL - input matrix
* @param {PositiveInteger} LDVL - leading dimension of `VL`
* @param {Float64Array} VR - input matrix
* @param {PositiveInteger} LDVR - leading dimension of `VR`
* @param {Float64Array} s - input array
* @param {integer} strideS - stride length for `s`
* @param {Float64Array} SEP - input array
* @param {integer} strideSEP - stride length for `SEP`
* @param {NonNegativeInteger} mm - the number of elements in the arrays S (if `job === 'eigenvalues'` or `job === 'both'`) and/or SEP (if `job === 'eigenvectors'` or `job === 'both'`).
* @param {Int32Array} m - output (length-1 array): the number of elements of the arrays S and/or SEP actually used to store the estimated condition numbers
* @param {(Float64Array|null)} WORK - input matrix
* @param {PositiveInteger} LDWORK - leading dimension of `WORK`
* @param {(Int32Array|null)} IWORK - output array
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be one of the following: "both", "eigenvalues", "eigenvectors"
* @throws {TypeError} third argument must be one of the following: "all", "selected"
* @throws {RangeError} sixth argument must be a nonnegative integer
* @throws {RangeError} eighth argument must be greater than or equal to `max( 1, N )`
* @throws {RangeError} tenth argument is invalid (column-major: rejected when `LDVL < 1 || ( ( job === "eigenvalues" || job === "both" ) && LDVL < N )`)
* @throws {RangeError} tenth argument is invalid (row-major: rejected when `LDVL < 1 || ( ( job === "eigenvalues" || job === "both" ) && LDVL < max( 1, mm ) )`)
* @throws {RangeError} twelfth argument is invalid (column-major: rejected when `LDVR < 1 || ( ( job === "eigenvalues" || job === "both" ) && LDVR < N )`)
* @throws {RangeError} twelfth argument is invalid (row-major: rejected when `LDVR < 1 || ( ( job === "eigenvalues" || job === "both" ) && LDVR < max( 1, mm ) )`)
* @returns {integer} status code (0 = success)
*/
function dtrsna( order, job, howmny, SELECT, strideSELECT, N, T, LDT, VL, LDVL, VR, LDVR, s, strideS, SEP, strideSEP, mm, m, WORK, LDWORK, IWORK ) { // eslint-disable-line max-len, max-params
	let st1, st2, svl1, svl2, svr1, svr2, swork1, swork2;

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
	const offsetIWork = 0;
	if ( order === 'column-major' && ( LDWORK < 1 || ( ( ( job === 'eigenvectors' ) || ( job === 'both' ) ) && LDWORK < N ) ) ) {
		throw new RangeError( format( 'invalid argument. Twentieth argument violates the reference leading-dimension rule (column-major: rejected when `LDWORK.LT.1 .OR. ( WANTSP .AND. LDWORK.LT.N )`). Value: `%d`.', LDWORK ) );
	}
	if ( order === 'row-major' && ( LDWORK < 1 || ( ( ( job === 'eigenvectors' ) || ( job === 'both' ) ) && LDWORK < max( 1, ( N < 2 ) ? N : N + 6 ) ) ) ) {
		throw new RangeError( format( 'invalid argument. Twentieth argument violates the reference leading-dimension rule (row-major: must also cover the ( N < 2 ) ? N : N + 6 columns). Value: `%d`.', LDWORK ) );
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
		const minWork = Math.max( 1, LDWORK * ( N + 6 ) ); // reference WORK( LDWORK, N+6 )
		WORK = new Float64Array( minWork );
	}
	if ( IWORK === null || IWORK === void 0 ) {
		const minIwork = Math.max( 1, 2 * (N - 1) );
		IWORK = new Int32Array( minIwork );
	}
	return base( job, howmny, SELECT, strideSELECT, 0, N, T, st1, st2, 0, VL, svl1, svl2, 0, VR, svr1, svr2, 0, s, strideS, 0, SEP, strideSEP, 0, mm, m, WORK, swork1, swork2, 0, IWORK, 1, offsetIWork ); // eslint-disable-line max-len
}


// EXPORTS //

export default dtrsna;
