
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
* This uses NB=1 (non-blocked) back-transformation.
*
* @param {string} side - `'right'`, `'left'`, or `'both'`
* @param {string} howmny - `'all'`, `'backtransform'`, or `'selected'`
* @param {(Uint8Array|Array)} SELECT - boolean selection array (used only if howmny=`'selected'`)
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
* @param {integer} mm - number of columns available in VL/VR
* @param {integer} M - (unused, set internally)
* @param {Float64Array} WORK - workspace array of length at least 3*N
* @param {integer} strideWork - stride for WORK (must be 1)
* @param {NonNegativeInteger} offsetWork - offset for WORK
* @param {integer} lwork - length of WORK
* @throws {TypeError} First argument must be a valid operation side
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info (0 = success)
*/
function dtrevc3( side, howmny, SELECT, strideSELECT, offsetSELECT, N, T, strideT1, strideT2, offsetT, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR, mm, M, WORK, strideWork, offsetWork, lwork ) { // eslint-disable-line max-len, max-params
	if ( side !== 'left' && side !== 'right' && side !== 'both' ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid operation side. Value: `%s`.', side ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Twentieth argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	return base( side, howmny, SELECT, strideSELECT, offsetSELECT, N, T, strideT1, strideT2, offsetT, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR, mm, M, WORK, strideWork, offsetWork, lwork ); // eslint-disable-line max-len
}


// EXPORTS //

export default dtrevc3;
