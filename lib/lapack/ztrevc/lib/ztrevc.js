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
* Computes some or all of the right and/or left eigenvectors of a complex upper triangular matrix.
*
* @param {Layout} order - storage layout ('row-major' or 'column-major')
* @param {('left'|'right'|'both')} side - specifies the operation type
* @param {('all'|'backtransform'|'selected')} howmny - specifies the operation type
* @param {Uint8Array} SELECT - input array
* @param {integer} strideSELECT - stride length for `SELECT`
* @param {NonNegativeInteger} N - number of columns
* @param {Complex128Array} T - input matrix
* @param {PositiveInteger} LDT - leading dimension of `T`
* @param {Complex128Array} VL - input matrix
* @param {PositiveInteger} LDVL - leading dimension of `VL`
* @param {Complex128Array} VR - input matrix
* @param {PositiveInteger} LDVR - leading dimension of `VR`
* @param {NonNegativeInteger} mm - the number of columns in the arrays VL and/or VR.
* @param {Int32Array} M - output (length-1 array): the number of columns in the arrays VL and/or VR actually used to store the eigenvectors
* @param {(Complex128Array|null)} WORK - input array
* @param {(Float64Array|null)} RWORK - output array
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be one of the following: "both", "left", "right"
* @throws {TypeError} third argument must be one of the following: "all", "backtransform", "selected"
* @throws {RangeError} sixth argument must be a nonnegative integer
* @throws {RangeError} eighth argument must be greater than or equal to `max( 1, N )`
* @throws {RangeError} tenth argument is invalid (column-major: rejected when `LDVL < 1 || ( ( side === "left" || side === "both" ) && LDVL < N )`)
* @throws {RangeError} tenth argument is invalid (row-major: rejected when `LDVL < 1 || ( ( side === "left" || side === "both" ) && LDVL < max( 1, mm ) )`)
* @throws {RangeError} twelfth argument is invalid (column-major: rejected when `LDVR < 1 || ( ( side === "right" || side === "both" ) && LDVR < N )`)
* @throws {RangeError} twelfth argument is invalid (row-major: rejected when `LDVR < 1 || ( ( side === "right" || side === "both" ) && LDVR < max( 1, mm ) )`)
* @throws {RangeError} fourteenth argument must be a nonnegative integer
* @returns {integer} status code (0 = success)
*/
function ztrevc( order, side, howmny, SELECT, strideSELECT, N, T, LDT, VL, LDVL, VR, LDVR, mm, M, WORK, RWORK ) { // eslint-disable-line max-len, max-params
	let svl1, svl2, svr1, svr2, st1, st2;

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
	if ( LDT < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDT ) );
	}
	if ( order === 'column-major' && ( LDVL < 1 || ( ( side === 'left' || side === 'both' ) && LDVL < N ) ) ) {
		throw new RangeError( format( 'invalid argument. Tenth argument is invalid (column-major: rejected when `LDVL < 1 || ( ( side === "left" || side === "both" ) && LDVL < N )`). Value: `%d`.', LDVL ) );
	}
	if ( order === 'row-major' && ( LDVL < 1 || ( ( side === 'left' || side === 'both' ) && LDVL < max( 1, mm ) ) ) ) {
		throw new RangeError( format( 'invalid argument. Tenth argument is invalid (row-major: rejected when `LDVL < 1 || ( ( side === "left" || side === "both" ) && LDVL < max( 1, mm ) )`). Value: `%d`.', LDVL ) );
	}
	if ( order === 'column-major' && ( LDVR < 1 || ( ( side === 'right' || side === 'both' ) && LDVR < N ) ) ) {
		throw new RangeError( format( 'invalid argument. Twelfth argument is invalid (column-major: rejected when `LDVR < 1 || ( ( side === "right" || side === "both" ) && LDVR < N )`). Value: `%d`.', LDVR ) );
	}
	if ( order === 'row-major' && ( LDVR < 1 || ( ( side === 'right' || side === 'both' ) && LDVR < max( 1, mm ) ) ) ) {
		throw new RangeError( format( 'invalid argument. Twelfth argument is invalid (row-major: rejected when `LDVR < 1 || ( ( side === "right" || side === "both" ) && LDVR < max( 1, mm ) )`). Value: `%d`.', LDVR ) );
	}
	if ( order === 'column-major' ) {
		st1 = 1;
		st2 = LDT;
		svl1 = 1;
		svl2 = LDVL;
		svr1 = 1;
		svr2 = LDVR;
	} else {
		st1 = LDT;
		st2 = 1;
		svl1 = LDVL;
		svl2 = 1;
		svr1 = LDVR;
		svr2 = 1;
	}
	if ( WORK === null || WORK === void 0 ) {
		const minWork = Math.max( 1, 2 * N );
		WORK = new Complex128Array( minWork );
	}
	if ( RWORK === null || RWORK === void 0 ) {
		const minRwork = Math.max( 1, N );
		RWORK = new Float64Array( minRwork );
	}
	return ndarray( side, howmny, SELECT, strideSELECT, 0, N, T, st1, st2, 0, VL, svl1, svl2, 0, VR, svr1, svr2, 0, mm, M, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default ztrevc;
