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
* Computes some or all of the right and/or left eigenvectors of a complex.
* upper triangular matrix T.
*
* The right eigenvector x and the left eigenvector y of T corresponding
* to an eigenvalue w are defined by:
*   T_x = w_x,     (y**H)_T = w_(y**H)
*
* This implementation uses the NB=1 (non-blocked) back-transformation path
* with ZLATRS for the triangular solve.
*
* @param {string} side - `'right'`, `'left'`, or `'both'`
* @param {string} howmny - `'all'`, `'backtransform'`, or `'selected'`
* @param {(Uint8Array|Array)} SELECT - boolean selection array (used only if howmny=`'selected'`)
* @param {integer} strideSELECT - stride for SELECT
* @param {NonNegativeInteger} offsetSELECT - offset for SELECT
* @param {NonNegativeInteger} N - order of matrix T
* @param {Complex128Array} T - upper triangular Schur matrix (N x N), modified then restored
* @param {integer} strideT1 - first dimension stride of T (complex elements)
* @param {integer} strideT2 - second dimension stride of T (complex elements)
* @param {NonNegativeInteger} offsetT - offset for T (complex elements)
* @param {Complex128Array} VL - left eigenvector matrix (N x MM)
* @param {integer} strideVL1 - first dimension stride of VL (complex elements)
* @param {integer} strideVL2 - second dimension stride of VL (complex elements)
* @param {NonNegativeInteger} offsetVL - offset for VL (complex elements)
* @param {Complex128Array} VR - right eigenvector matrix (N x MM)
* @param {integer} strideVR1 - first dimension stride of VR (complex elements)
* @param {integer} strideVR2 - second dimension stride of VR (complex elements)
* @param {NonNegativeInteger} offsetVR - offset for VR (complex elements)
* @param {integer} mm - number of columns available in VL/VR
* @param {*} M - output count of eigenvectors (Fortran M); unused: this implementation does not write it
* @param {Complex128Array} WORK - workspace array
* @param {integer} strideWork - stride for WORK (complex elements)
* @param {NonNegativeInteger} offsetWork - offset for WORK (complex elements)
* @param {Float64Array} RWORK - real workspace array of length >= N
* @param {integer} strideRWork - stride for RWORK
* @param {NonNegativeInteger} offsetRWork - offset for RWORK
* @throws {TypeError} First argument must be a valid operation side
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info (0 = success)
*/
function ztrevc3( side, howmny, SELECT, strideSELECT, offsetSELECT, N, T, strideT1, strideT2, offsetT, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR, mm, M, WORK, strideWork, offsetWork, RWORK, strideRWork, offsetRWork ) { // eslint-disable-line max-len, max-params
	if ( side !== 'left' && side !== 'right' && side !== 'both' ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid operation side. Value: `%s`.', side ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Twentieth argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	const minWork = Math.max( 1, 2 * N );
	if ( !WORK || ( WORK.length - offsetWork ) < minWork ) {
		throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', minWork, offsetWork, ( WORK ) ? WORK.length : 0 ) );
	}
	const minRWork = Math.max( 1, N );
	if ( !RWORK || ( RWORK.length - offsetRWork ) < minRWork ) {
		throw new RangeError( format( 'invalid argument. RWORK array must have at least %d elements from offset %d. Provided length: %d.', minRWork, offsetRWork, ( RWORK ) ? RWORK.length : 0 ) );
	}

	if ( strideWork !== 1 ) {
		throw new RangeError( format( 'invalid argument. `strideWork` must be 1 (only contiguous workspace is supported). Value: `%d`.', strideWork ) );
	}
	if ( strideRWork !== 1 ) {
		throw new RangeError( format( 'invalid argument. `strideRWork` must be 1 (only contiguous workspace is supported). Value: `%d`.', strideRWork ) );
	}
	return base( side, howmny, SELECT, strideSELECT, offsetSELECT, N, T, strideT1, strideT2, offsetT, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR, mm, M, WORK, strideWork, offsetWork, RWORK, strideRWork, offsetRWork ); // eslint-disable-line max-len
}


// EXPORTS //

export default ztrevc3;
