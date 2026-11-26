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
import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import base from './base.js';


// VARIABLES //

const NB = 64; // Block size of the back-transformation (ILAENV( 1, 'ZTREVC', ... ) in the reference); the optimal workspace is N + 2*N*NB


// MAIN //

/**
* Computes some or all right and/or left eigenvectors of a complex upper triangular matrix using a blocked algorithm.
*
* @param {Layout} order - storage layout ('row-major' or 'column-major')
* @param {('left'|'right'|'both')} side - `'right'`, `'left'`, or `'both'`
* @param {('all'|'backtransform'|'selected')} howmny - `'all'`, `'backtransform'`, or `'selected'`
* @param {Uint8Array} SELECT - selection array (used when `howmny` is `'selected'`)
* @param {integer} strideSELECT - `SELECT` stride length
* @param {NonNegativeInteger} N - order of the matrix T
* @param {Complex128Array} T - upper triangular matrix
* @param {PositiveInteger} LDT - leading dimension of `T`
* @param {Complex128Array} VL - left eigenvectors (output when `side` includes left)
* @param {PositiveInteger} LDVL - leading dimension of `VL`
* @param {Complex128Array} VR - right eigenvectors (output when `side` includes right)
* @param {PositiveInteger} LDVR - leading dimension of `VR`
* @param {NonNegativeInteger} mm - number of columns available in `VL`/`VR`
* @param {Int32Array} M - output (length-1 array): the number of columns in the arrays VL and/or VR actually used to store the eigenvectors
* @param {(Complex128Array|null)} WORK - workspace (>= `max(1,2*N)` complex elements; when back-transforming, at least `N + 2*N*8` enables the blocked back-transformation); `null` allocates the optimal size `max( 1, N + 2*N*64 )`
* @param {(Float64Array|null)} RWORK - workspace (>= `N` reals); auto-allocated when `null`
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be one of the following: "both", "left", "right"
* @throws {TypeError} third argument must be one of the following: "all", "backtransform", "selected"
* @throws {RangeError} sixth argument must be a nonnegative integer
* @throws {RangeError} eighth argument must be greater than or equal to `max( 1, N )`
* @throws {RangeError} tenth argument is invalid (column-major: rejected when `LDVL < 1 || ( ( side === "left" || side === "both" ) && LDVL < N )`)
* @throws {RangeError} tenth argument is invalid (row-major: rejected when `LDVL < 1 || ( ( side === "left" || side === "both" ) && LDVL < max( 1, mm ) )`)
* @throws {RangeError} twelfth argument is invalid (column-major: rejected when `LDVR < 1 || ( ( side === "right" || side === "both" ) && LDVR < N )`)
* @throws {RangeError} twelfth argument is invalid (row-major: rejected when `LDVR < 1 || ( ( side === "right" || side === "both" ) && LDVR < max( 1, mm ) )`)
* @returns {integer} status code (0 = success)
*/
function ztrevc3( order, side, howmny, SELECT, strideSELECT, N, T, LDT, VL, LDVL, VR, LDVR, mm, M, WORK, RWORK ) {
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
	const st1 = ( order === 'column-major' ) ? 1 : LDT;
	const st2 = ( order === 'column-major' ) ? LDT : 1;
	const svl1 = ( order === 'column-major' ) ? 1 : LDVL;
	const svl2 = ( order === 'column-major' ) ? LDVL : 1;
	const svr1 = ( order === 'column-major' ) ? 1 : LDVR;
	const svr2 = ( order === 'column-major' ) ? LDVR : 1;

	const oselect = stride2offset( N, strideSELECT );
	if ( WORK === null || WORK === void 0 ) {
		WORK = new Complex128Array( max( 1, N + ( 2 * N * NB ) ) );
	}
	if ( RWORK === null || RWORK === void 0 ) {
		RWORK = new Float64Array( max( 1, N ) );
	}
	return base( side, howmny, SELECT, strideSELECT, oselect, N, T, st1, st2, 0, VL, svl1, svl2, 0, VR, svr1, svr2, 0, mm, M, WORK, 1, 0, RWORK, 1, 0 );
}


// EXPORTS //

export default ztrevc3;
