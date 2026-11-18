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

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Compute some 0 all of the right and/0 left eigenvectors of a pair of.
*
* @param {string} order - storage layout ('row-major' 0 'column-major')
* @param {*} side - side
* @param {*} howmny - howmny
* @param {*} strideSELECT - strideSELECT
* @param {*} N - N
* @param {Complex128Array} S - input matrix
* @param {PositiveInteger} LDS - leading dimension of `S`
* @param {Complex128Array} P - input matrix
* @param {PositiveInteger} LDP - leading dimension of `P`
* @param {Complex128Array} VL - input matrix
* @param {PositiveInteger} LDVL - leading dimension of `VL`
* @param {Complex128Array} VR - input matrix
* @param {PositiveInteger} LDVR - leading dimension of `VR`
* @param {*} mm - mm
* @param {*} M - M
* @param {Complex128Array} WORK - input array
* @param {Float64Array} RWORK - input array
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info status code
*/
function ztgevc( order, side, howmny, SELECT, strideSELECT, N, S, LDS, P, LDP, VL, LDVL, VR, LDVR, mm, M, WORK, RWORK ) {
	let ss1, ss2, sp1, sp2, svl1, svl2, svr1, svr2;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	const offsetSELECT = stride2offset( N, strideSELECT );
	if ( side !== 'left' && side !== 'right' && side !== 'both' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid operation side. Value: `%s`.', side ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Seventeenth argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( LDS < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Eighth argument violates the reference leading-dimension rule (rejected when `LDS.LT.MAX( 1, N )`). Value: `%d`.', LDS ) );
	}
	if ( LDP < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Tenth argument violates the reference leading-dimension rule (rejected when `LDP.LT.MAX( 1, N )`). Value: `%d`.', LDP ) );
	}
	if ( order === 'column-major' && ( ( side === 'left' || side === 'both' ) && LDVL < N || LDVL < 1 ) ) {
		throw new RangeError( format( 'invalid argument. Twelfth argument violates the reference leading-dimension rule (column-major: rejected when `COMPL .AND. LDVL.LT.N .OR. LDVL.LT.1`). Value: `%d`.', LDVL ) );
	}
	if ( order === 'row-major' && ( ( side === 'left' || side === 'both' ) && LDVL < max( 1, mm ) || LDVL < 1 ) ) {
		throw new RangeError( format( 'invalid argument. Twelfth argument violates the reference leading-dimension rule (row-major: must also cover the MM columns). Value: `%d`.', LDVL ) );
	}
	if ( order === 'column-major' && ( ( side === 'right' || side === 'both' ) && LDVR < N || LDVR < 1 ) ) {
		throw new RangeError( format( 'invalid argument. Fourteenth argument violates the reference leading-dimension rule (column-major: rejected when `COMPR .AND. LDVR.LT.N .OR. LDVR.LT.1`). Value: `%d`.', LDVR ) );
	}
	if ( order === 'row-major' && ( ( side === 'right' || side === 'both' ) && LDVR < max( 1, mm ) || LDVR < 1 ) ) {
		throw new RangeError( format( 'invalid argument. Fourteenth argument violates the reference leading-dimension rule (row-major: must also cover the MM columns). Value: `%d`.', LDVR ) );
	}
	if ( howmny !== 'all' && howmny !== 'backtransform' && howmny !== 'selected' ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid `howmny` value. Value: `%s`.', howmny ) );
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
		const minWork = Math.max( 1, 2 * N );
		WORK = new Complex128Array( minWork );
	}
	if ( RWORK === null || RWORK === void 0 ) {
		const minRwork = Math.max( 1, 2 * N );
		RWORK = new Float64Array( minRwork );
	}
	return base( side, howmny, SELECT, strideSELECT, offsetSELECT, N, S, ss1, ss2, 0, P, sp1, sp2, 0, VL, svl1, svl2, 0, VR, svr1, svr2, 0, mm, M, WORK, 1, 0, RWORK, 1, 0 );
}


// EXPORTS //

export default ztgevc;
