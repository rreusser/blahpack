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

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes some or all of the right and/or left eigenvectors of a real.
* upper quasi-triangular matrix T.
*
* The right eigenvector x and the left eigenvector y of T corresponding
* to an eigenvalue w are defined by:
*   T_x = w_x,     y**T _ T = w _ y**T
*
* As in the reference, the back-transformation (`howmny = 'backtransform'`) is
* blocked (NB vectors at a time, with dgemm) when WORK has room for it, and
* done one vector at a time otherwise.
*
* @param {('left'|'right'|'both')} side - `'right'`, `'left'`, or `'both'`
* @param {('all'|'backtransform'|'selected')} howmny - `'all'`, `'backtransform'`, or `'selected'`
* @param {Uint8Array} SELECT - boolean selection array (used only if howmny=`'selected'`)
* @param {integer} strideSELECT - stride for SELECT
* @param {NonNegativeInteger} offsetSELECT - offset for SELECT
* @param {NonNegativeInteger} N - order of matrix T
* @param {Float64Array} T - quasi-triangular Schur matrix (N x N)
* @param {integer} strideT1 - first dimension stride of T
* @param {integer} strideT2 - second dimension stride of T
* @param {NonNegativeInteger} offsetT - offset for T
* @param {Float64Array} VL - left eigenvector matrix (N x MM)
* @param {integer} strideVL1 - first dimension stride of VL
* @param {integer} strideVL2 - second dimension stride of VL
* @param {NonNegativeInteger} offsetVL - offset for VL
* @param {Float64Array} VR - right eigenvector matrix (N x MM)
* @param {integer} strideVR1 - first dimension stride of VR
* @param {integer} strideVR2 - second dimension stride of VR
* @param {NonNegativeInteger} offsetVR - offset for VR
* @param {NonNegativeInteger} mm - number of columns available in VL/VR
* @param {Int32Array} M - output (length-1 array): the number of columns in the arrays VL and/or VR actually used to store the eigenvectors
* @param {Float64Array} WORK - workspace; length from `offsetWork` at least `max(1,3*N)`; when back-transforming, a length of at least `N + 2*N*8` enables the blocked back-transformation, and `N + 2*N*NB` (NB from `ilaenv`) is optimal
* @param {integer} strideWork - stride for WORK (must be 1)
* @param {NonNegativeInteger} offsetWork - offset for WORK
* @throws {TypeError} first argument must be one of the following: "both", "left", "right"
* @throws {TypeError} second argument must be one of the following: "all", "backtransform", "selected"
* @throws {RangeError} sixth argument must be a nonnegative integer
* @returns {integer} status code (0 = success)
*/
function dtrevc3( side, howmny, SELECT, strideSELECT, offsetSELECT, N, T, strideT1, strideT2, offsetT, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR, mm, M, WORK, strideWork, offsetWork ) { // eslint-disable-line max-len, max-params
	if ( side !== 'both' && side !== 'left' && side !== 'right' ) {
		throw new TypeError( format( 'invalid argument. First argument must be one of the following: "both", "left", "right". Value: `%s`.', side ) );
	}
	if ( howmny !== 'all' && howmny !== 'backtransform' && howmny !== 'selected' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be one of the following: "all", "backtransform", "selected". Value: `%s`.', howmny ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( N === 0 ) {
		M[ 0 ] = 0;
		return 0;
	}
	const minWork = Math.max( 1, 3 * N );
	if ( !WORK || ( WORK.length - offsetWork ) < minWork ) {
		throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', minWork, offsetWork, ( WORK ) ? WORK.length : 0 ) );
	}

	if ( strideWork !== 1 ) {
		throw new RangeError( format( 'invalid argument. `strideWork` must be 1 (only contiguous workspace is supported). Value: `%d`.', strideWork ) );
	}
	return base( side, howmny, SELECT, strideSELECT, offsetSELECT, N, T, strideT1, strideT2, offsetT, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR, mm, M, WORK, strideWork, offsetWork ); // eslint-disable-line max-len
}


// EXPORTS //

export default dtrevc3;
