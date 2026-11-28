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
import strided from './strided.js';


// MAIN //

/**
* Computes some or all of the right and/or left eigenvectors of a pair of real matrices.
*
* @param {Layout} order - storage layout ('row-major' or 'column-major')
* @param {('left'|'right'|'both')} side - specifies the operation type
* @param {('all'|'backtransform'|'selected')} howmny - specifies the operation type
* @param {Uint8Array} SELECT - input array
* @param {integer} strideSELECT - stride length for `SELECT`
* @param {NonNegativeInteger} N - number of columns
* @param {Float64Array} S - input matrix
* @param {PositiveInteger} LDS - leading dimension of `S`
* @param {Float64Array} P - input matrix
* @param {PositiveInteger} LDP - leading dimension of `P`
* @param {Float64Array} VL - input matrix
* @param {PositiveInteger} LDVL - leading dimension of `VL`
* @param {Float64Array} VR - input matrix
* @param {PositiveInteger} LDVR - leading dimension of `VR`
* @param {NonNegativeInteger} mm - the number of columns in the arrays VL and/or VR.
* @param {Int32Array} M - output (length-1 array): the number of columns in the arrays VL and/or VR actually used to store the eigenvectors
* @param {(Float64Array|null)} WORK - output array
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be one of the following: "both", "left", "right"
* @throws {TypeError} third argument must be one of the following: "all", "backtransform", "selected"
* @throws {RangeError} sixth argument must be a nonnegative integer
* @throws {RangeError} eighth argument must be greater than or equal to `max( 1, N )`
* @throws {RangeError} tenth argument must be greater than or equal to `max( 1, N )`
* @returns {integer} status code (0 = success)
*/
function dtgevc( order, side, howmny, SELECT, strideSELECT, N, S, LDS, P, LDP, VL, LDVL, VR, LDVR, mm, M, WORK ) { // eslint-disable-line max-len, max-params
	let svl1, svl2, svr1, svr2, ss1, ss2, sp1, sp2;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( side !== 'both' && side !== 'left' && side !== 'right' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be one of the following: "both", "left", "right". Value: `%s`.', side ) );
	}
	if ( howmny !== 'all' && howmny !== 'backtransform' && howmny !== 'selected' ) {
		throw new TypeError( format( 'invalid argument. Third argument must be one of the following: "all", "backtransform", "selected". Value: `%s`.', howmny ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( LDS < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDS ) );
	}
	if ( LDP < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Tenth argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDP ) );
	}
	if ( order === 'column-major' && ( ( ( side === 'right' ) ? false : ( side === 'left' ) ? true : true ) && LDVL < N || LDVL < 1 ) ) {
		throw new RangeError( format( 'invalid argument. Twelfth argument violates the reference leading-dimension rule (column-major: rejected when `COMPL .AND. LDVL.LT.N .OR. LDVL.LT.1`). Value: `%d`.', LDVL ) );
	}
	if ( order === 'row-major' && ( ( ( side === 'right' ) ? false : ( side === 'left' ) ? true : true ) && LDVL < max( 1, mm ) || LDVL < 1 ) ) {
		throw new RangeError( format( 'invalid argument. Twelfth argument violates the reference leading-dimension rule (row-major: must also cover the MM columns). Value: `%d`.', LDVL ) );
	}
	if ( order === 'column-major' && ( ( ( side === 'right' ) ? true : ( side === 'left' ) ? false : true ) && LDVR < N || LDVR < 1 ) ) {
		throw new RangeError( format( 'invalid argument. Fourteenth argument violates the reference leading-dimension rule (column-major: rejected when `COMPR .AND. LDVR.LT.N .OR. LDVR.LT.1`). Value: `%d`.', LDVR ) );
	}
	if ( order === 'row-major' && ( ( ( side === 'right' ) ? true : ( side === 'left' ) ? false : true ) && LDVR < max( 1, mm ) || LDVR < 1 ) ) {
		throw new RangeError( format( 'invalid argument. Fourteenth argument violates the reference leading-dimension rule (row-major: must also cover the MM columns). Value: `%d`.', LDVR ) );
	}
	if ( order === 'column-major' ) {
		ss1 = 1;
		ss2 = LDS;
		sp1 = 1;
		sp2 = LDP;
		svl1 = 1;
		svl2 = LDVL;
		svr1 = 1;
		svr2 = LDVR;
	} else {
		ss1 = LDS;
		ss2 = 1;
		sp1 = LDP;
		sp2 = 1;
		svl1 = LDVL;
		svl2 = 1;
		svr1 = LDVR;
		svr2 = 1;
	}
	if ( WORK === null || WORK === void 0 ) {
		const minWork = Math.max( 1, 6 * N );
		WORK = new Float64Array( minWork );
	}
	return strided( side, howmny, SELECT, strideSELECT, 0, N, S, ss1, ss2, 0, P, sp1, sp2, 0, VL, svl1, svl2, 0, VR, svr1, svr2, 0, mm, M, WORK, 1, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default dtgevc;
