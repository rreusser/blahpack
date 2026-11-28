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
import strided from './strided.js';
import { computeOptimalWorkSize } from './base.js';



// MAIN //

/**
* Computes some or all of the right and/or left eigenvectors of a real upper quasi-triangular matrix T.
*
* @param {Layout} order - storage layout ('row-major' or 'column-major')
* @param {('left'|'right'|'both')} side - `'right'`: compute right eigenvectors only; `'left'`: compute left eigenvectors only; `'both'`: compute both right and left eigenvectors.
* @param {('all'|'backtransform'|'selected')} howmny - `'all'`: compute all right and/or left eigenvectors; `'backtransform'`: compute all right and/or left eigenvectors, backtransformed by the matrices in VR and/or VL; `'selected'`: compute selected right and/or left eigenvectors, as indicated by the logical array SELECT.
* @param {Uint8Array} SELECT - if `howmny === 'selected'`, SELECT specifies the eigenvectors to be computed.
* @param {integer} strideSELECT - stride length for `SELECT`
* @param {NonNegativeInteger} N - the order of the matrix T.
* @param {Float64Array} T - the upper quasi-triangular matrix T in Schur canonical form.
* @param {PositiveInteger} LDT - leading dimension of `T`
* @param {Float64Array} VL - on entry, if `side === 'left'` or `side === 'both'` and `howmny === 'backtransform'`, VL must contain an N-by-N matrix Q (usually the orthogonal matrix Q of Schur vectors returned by DHSEQR). On exit, if `side === 'left'` or `side === 'both'`, VL contains: if `howmny === 'all'`, the matrix Y of left eigenvectors of T; if `howmny === 'backtransform'`, the matrix Q*Y; if `howmny === 'selected'`, the left eigenvectors of T specified by SELECT, stored consecutively in the columns of VL, in the same order as their eigenvalues.
* @param {PositiveInteger} LDVL - leading dimension of `VL`
* @param {Float64Array} VR - on entry, if `side === 'right'` or `side === 'both'` and `howmny === 'backtransform'`, VR must contain an N-by-N matrix Q (usually the orthogonal matrix Q of Schur vectors returned by DHSEQR). On exit, if `side === 'right'` or `side === 'both'`, VR contains: if `howmny === 'all'`, the matrix X of right eigenvectors of T; if `howmny === 'backtransform'`, the matrix Q*X; if `howmny === 'selected'`, the right eigenvectors of T specified by SELECT, stored consecutively in the columns of VR, in the same order as their eigenvalues.
* @param {PositiveInteger} LDVR - leading dimension of `VR`
* @param {NonNegativeInteger} mm - the number of columns in the arrays VL and/or VR.
* @param {Int32Array} M - output (length-1 array): the number of columns in the arrays VL and/or VR actually used to store the eigenvectors
* @param {(Float64Array|null)} WORK - caller-provided workspace of at least `max( 1, 3 * N )` elements; when back-transforming, at least `N + 2*N*8` enables the blocked back-transformation; `null` allocates the optimal size `max( 1, N + 2*N*NB )`, with NB from `ilaenv`
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be one of the following: "both", "left", "right"
* @throws {TypeError} third argument must be one of the following: "all", "backtransform", "selected"
* @throws {RangeError} sixth argument must be a nonnegative integer
* @throws {RangeError} eighth argument must be greater than or equal to `max( 1, N )`
* @throws {RangeError} tenth argument is invalid (column-major: rejected when `LDVL < 1 || ( ( side === "left" || side === "both" ) && LDVL < N )`)
* @throws {RangeError} tenth argument is invalid (row-major: rejected when `LDVL < 1 || ( ( side === "left" || side === "both" ) && LDVL < max( 1, mm ) )`)
* @throws {RangeError} twelfth argument is invalid (column-major: rejected when `LDVR < 1 || ( ( side === "right" || side === "both" ) && LDVR < N )`)
* @throws {RangeError} twelfth argument is invalid (row-major: rejected when `LDVR < 1 || ( ( side === "right" || side === "both" ) && LDVR < max( 1, mm ) )`)
* @throws {TypeError} if a string argument is not a valid option
* @returns {integer} status code (0 = success)
*/
function dtrevc3( order, side, howmny, SELECT, strideSELECT, N, T, LDT, VL, LDVL, VR, LDVR, mm, M, WORK ) { // eslint-disable-line max-len, max-params

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
		WORK = new Float64Array( computeOptimalWorkSize( side, howmny, N ) );
	}
	return strided( side, howmny, SELECT, strideSELECT, oselect, N, T, st1, st2, 0, VL, svl1, svl2, 0, VR, svr1, svr2, 0, mm, M, WORK, 1, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default dtrevc3;
