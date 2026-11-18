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
import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* @license Apache-2.0
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {string} side - side
* @param {string} howmny - howmny
* @param {(Uint8Array|Array)} SELECT - SELECT
* @param {integer} strideSELECT - strideSELECT
* @param {NonNegativeInteger} N - N
* @param {Float64Array} T - T
* @param {PositiveInteger} LDT - leading dimension of `T`
* @param {Float64Array} VL - VL
* @param {PositiveInteger} LDVL - leading dimension of `VL`
* @param {Float64Array} VR - VR
* @param {PositiveInteger} LDVR - leading dimension of `VR`
* @param {integer} mm - mm
* @param {integer} M - M
* @param {Float64Array} WORK - WORK
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} if a string argument is not a valid option
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info status code
*/
function dtrevc3( order, side, howmny, SELECT, strideSELECT, N, T, LDT, VL, LDVL, VR, LDVR, mm, M, WORK ) { // eslint-disable-line max-len, max-params

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	const st1 = ( order === 'column-major' ) ? 1 : LDT;
	const st2 = ( order === 'column-major' ) ? LDT : 1;
	const svl1 = ( order === 'column-major' ) ? 1 : LDVL;
	const svl2 = ( order === 'column-major' ) ? LDVL : 1;
	const svr1 = ( order === 'column-major' ) ? 1 : LDVR;
	const svr2 = ( order === 'column-major' ) ? LDVR : 1;
	const oselect = stride2offset( N, strideSELECT );
	if ( WORK === null || WORK === void 0 ) {
		const minWork = Math.max( 1, 3 * N);
		WORK = new Float64Array( minWork );
	}
	if ( side !== 'left' && side !== 'right' && side !== 'both' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid operation side. Value: `%s`.', side ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourteenth argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( LDT < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Eighth argument violates the reference leading-dimension rule (rejected when `LDT.LT.MAX( 1, N )`). Value: `%d`.', LDT ) );
	}
	if ( order === 'column-major' && ( LDVL < 1 || ( ( ( side === 'left' ) || ( side === 'both' ) ) && LDVL < N ) ) ) {
		throw new RangeError( format( 'invalid argument. Tenth argument violates the reference leading-dimension rule (column-major: rejected when `LDVL.LT.1 .OR. ( LEFTV .AND. LDVL.LT.N )`). Value: `%d`.', LDVL ) );
	}
	if ( order === 'row-major' && ( LDVL < 1 || ( ( ( side === 'left' ) || ( side === 'both' ) ) && LDVL < max( 1, mm ) ) ) ) {
		throw new RangeError( format( 'invalid argument. Tenth argument violates the reference leading-dimension rule (row-major: must also cover the MM columns). Value: `%d`.', LDVL ) );
	}
	if ( order === 'column-major' && ( LDVR < 1 || ( ( ( side === 'right' ) || ( side === 'both' ) ) && LDVR < N ) ) ) {
		throw new RangeError( format( 'invalid argument. Twelfth argument violates the reference leading-dimension rule (column-major: rejected when `LDVR.LT.1 .OR. ( RIGHTV .AND. LDVR.LT.N )`). Value: `%d`.', LDVR ) );
	}
	if ( order === 'row-major' && ( LDVR < 1 || ( ( ( side === 'right' ) || ( side === 'both' ) ) && LDVR < max( 1, mm ) ) ) ) {
		throw new RangeError( format( 'invalid argument. Twelfth argument violates the reference leading-dimension rule (row-major: must also cover the MM columns). Value: `%d`.', LDVR ) );
	}
	if ( howmny !== 'all' && howmny !== 'backtransform' && howmny !== 'selected' ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid `howmny` value. Value: `%s`.', howmny ) );
	}
	return base( side, howmny, SELECT, strideSELECT, oselect, N, T, st1, st2, 0, VL, svl1, svl2, 0, VR, svr1, svr2, 0, mm, M, WORK, 1, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default dtrevc3;
