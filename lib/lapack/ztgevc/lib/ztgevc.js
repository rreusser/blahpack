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
import strided from './strided.js';


// MAIN //

/**
* Compute some 0 all of the right and/0 left eigenvectors of a pair of.
*
* @param {Layout} order - storage layout ('row-major' 0 'column-major')
* @param {('left'|'right'|'both')} side - `'right'`: compute right eigenvectors only; `'left'`: compute left eigenvectors only; `'both'`: compute both right and left eigenvectors.
* @param {('all'|'backtransform'|'selected')} howmny - `'all'`: compute all right and/or left eigenvectors; `'backtransform'`: compute all right and/or left eigenvectors, backtransformed by the matrices in VR and/or VL; `'selected'`: compute selected right and/or left eigenvectors, specified by the logical array SELECT.
* @param {Uint8Array} SELECT - logical array of length N (used when howmny=`'selected'`)
* @param {integer} strideSELECT - stride length for `SELECT`
* @param {NonNegativeInteger} N - the order of the matrices S and P.
* @param {Complex128Array} S - input matrix
* @param {PositiveInteger} LDS - leading dimension of `S`
* @param {Complex128Array} P - input matrix
* @param {PositiveInteger} LDP - leading dimension of `P`
* @param {Complex128Array} VL - input matrix
* @param {PositiveInteger} LDVL - leading dimension of `VL`
* @param {Complex128Array} VR - input matrix
* @param {PositiveInteger} LDVR - leading dimension of `VR`
* @param {NonNegativeInteger} mm - the number of columns in the arrays VL and/or VR.
* @param {Int32Array} M - the number of columns in the arrays VL and/or VR actually used to store the eigenvectors.
* @param {(Complex128Array|null)} WORK - input array
* @param {(Float64Array|null)} RWORK - input array
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be one of the following: "both", "left", "right"
* @throws {TypeError} third argument must be one of the following: "all", "backtransform", "selected"
* @throws {RangeError} sixth argument must be a nonnegative integer
* @throws {RangeError} eighth argument must be greater than or equal to `max( 1, N )`
* @throws {RangeError} tenth argument must be greater than or equal to `max( 1, N )`
* @returns {integer} info status code
*/
function ztgevc( order, side, howmny, SELECT, strideSELECT, N, S, LDS, P, LDP, VL, LDVL, VR, LDVR, mm, M, WORK, RWORK ) {
	let ss1, ss2, sp1, sp2, svl1, svl2, svr1, svr2;

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
	const offsetSELECT = stride2offset( N, strideSELECT );
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
	return strided( side, howmny, SELECT, strideSELECT, offsetSELECT, N, S, ss1, ss2, 0, P, sp1, sp2, 0, VL, svl1, svl2, 0, VR, svr1, svr2, 0, mm, M, WORK, 1, 0, RWORK, 1, 0 );
}


// EXPORTS //

export default ztgevc;
