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

import { dlaqr23impl, computeOptimalWorkSize as dlaqr2WorkOpt } from '../../dlaqr2/lib/base.js';
import dlaqr4, { computeOptimalWorkSize as dlaqr4WorkOpt } from '../../dlaqr4/lib/base.js';
import ilaenv from '../../ilaenv/lib/base.js';



// FUNCTIONS //

/**
* Returns the reference's optimal workspace length (LWKOPT) for DLAQR3.
*
* `LWKOPT = max( JW + max( LWK1, LWK2 ), LWK3 )`, `JW = min( NW, KBOT-KTOP+1 )`, where LWK1/LWK2 are the DGEHRD/DORMHR optima (as in DLAQR2) and LWK3 is DLAQR4's optimum for the JW-by-JW window; 1 for `JW <= 2`.
*
* @private
* @param {integer} nw - deflation window size
* @param {integer} ktop - top of the active block (1-based)
* @param {integer} kbot - bottom of the active block (1-based)
* @returns {PositiveInteger} optimal workspace length
*/
function computeOptimalWorkSize( nw, ktop, kbot ) {
	const jw = Math.min( nw, kbot - ktop + 1 );
	if ( jw <= 2 ) {
		return 1;
	}
	return Math.max( dlaqr2WorkOpt( nw, ktop, kbot ), dlaqr4WorkOpt( jw, 1, jw ) );
}


// MAIN //

/**
* Performs aggressive early deflation on an upper Hessenberg matrix.
*
* DLAQR3 is identical to DLAQR2 except that for large deflation windows it
* uses DLAQR4 (recursive multi-shift QR) instead of DLAHQR for computing
* the Schur decomposition of the deflation window. This provides better
* performance for large matrices.
*
* Note: KTOP and KBOT are 1-based (Fortran convention).
*
* @private
* @param {boolean} wantt - if true, fully update H for Schur form
* @param {boolean} wantz - if true, accumulate transformations in Z
* @param {NonNegativeInteger} N - order of matrix H
* @param {integer} ktop - top of the active block (1-based)
* @param {NonNegativeInteger} kbot - bottom of the active block (1-based)
* @param {NonNegativeInteger} nw - deflation window size
* @param {Float64Array} H - upper Hessenberg matrix
* @param {integer} strideH1 - stride of first dim of H
* @param {integer} strideH2 - stride of second dim of H
* @param {NonNegativeInteger} offsetH - starting index for H
* @param {integer} iloz - first row of Z to update (1-based)
* @param {integer} ihiz - last row of Z to update (1-based)
* @param {Float64Array} Z - orthogonal matrix
* @param {integer} strideZ1 - stride of first dim of Z
* @param {integer} strideZ2 - stride of second dim of Z
* @param {NonNegativeInteger} offsetZ - starting index for Z
* @param {Int32Array} ns - output (length-1 array): the number of unconverged (ie approximate) eigenvalues returned in SR and SI that may be used as shifts by the calling subroutine
* @param {Int32Array} nd - output (length-1 array): the number of converged eigenvalues uncovered by this subroutine
* @param {Float64Array} SR - real parts of eigenvalues/shifts (output)
* @param {integer} strideSR - stride for SR
* @param {NonNegativeInteger} offsetSR - starting index for SR
* @param {Float64Array} SI - imaginary parts of eigenvalues/shifts (output)
* @param {integer} strideSI - stride for SI
* @param {NonNegativeInteger} offsetSI - starting index for SI
* @param {Float64Array} V - NW-by-NW workspace matrix
* @param {integer} strideV1 - stride of first dim of V
* @param {integer} strideV2 - stride of second dim of V
* @param {NonNegativeInteger} offsetV - starting index for V
* @param {integer} nh - number of columns available in T
* @param {Float64Array} T - workspace matrix
* @param {integer} strideT1 - stride of first dim of T
* @param {integer} strideT2 - stride of second dim of T
* @param {NonNegativeInteger} offsetT - starting index for T
* @param {integer} nv - number of rows available in WV
* @param {Float64Array} WV - workspace matrix
* @param {integer} strideWV1 - stride of first dim of WV
* @param {integer} strideWV2 - stride of second dim of WV
* @param {NonNegativeInteger} offsetWV - starting index for WV
* @param {Float64Array} WORK - workspace array; length at least `2*JW` (`JW = min(nw, kbot-ktop+1)`, the reference's `2*NW`); the reference's optimum (`JW + JW*32 + 4160` for `JW > 2`) keeps DGEHRD/DORMHR blocked
* @param {integer} strideWork - stride for WORK
* @param {NonNegativeInteger} offsetWork - starting index for WORK
* @returns {Float64Array} `WV`
*/
function dlaqr3( wantt, wantz, N, ktop, kbot, nw, H, strideH1, strideH2, offsetH, iloz, ihiz, Z, strideZ1, strideZ2, offsetZ, ns, nd, SR, strideSR, offsetSR, SI, strideSI, offsetSI, V, strideV1, strideV2, offsetV, nh, T, strideT1, strideT2, offsetT, nv, WV, strideWV1, strideWV2, offsetWV, WORK, strideWork, offsetWork ) {
	const lwork = Math.floor( ( WORK.length - offsetWork ) / Math.abs( strideWork ) );
	const jw = Math.min( nw, kbot - ktop + 1 );

	// DLAHQR/DLAQR4 crossover for the deflation window's Schur form (the shared implementation applies it where the reference does):
	const nmin = ilaenv( 12, 'DLAQR3', 'SV', jw, 1, jw, lwork );
	const result = dlaqr23impl( dlaqr4, nmin, wantt, wantz, N, ktop, kbot, nw, H, strideH1, strideH2, offsetH, iloz, ihiz, Z, strideZ1, strideZ2, offsetZ, SR, strideSR, offsetSR, SI, strideSI, offsetSI, V, strideV1, strideV2, offsetV, nh, T, strideT1, strideT2, offsetT, nv, WV, strideWV1, strideWV2, offsetWV, WORK, strideWork, offsetWork );
	ns[ 0 ] = result.ns;
	nd[ 0 ] = result.nd;
	return WV;
}


// EXPORTS //

export default dlaqr3;
export { computeOptimalWorkSize };
