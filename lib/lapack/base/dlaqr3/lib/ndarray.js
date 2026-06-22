
// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


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
* @param {boolean} wantt - if true, fully update H for Schur form
* @param {boolean} wantz - if true, accumulate transformations in Z
* @param {NonNegativeInteger} N - order of matrix H
* @param {integer} ktop - top of the active block (1-based)
* @param {integer} kbot - bottom of the active block (1-based)
* @param {integer} nw - deflation window size
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
* @param {Float64Array} WORK - workspace array
* @param {integer} strideWORK - stride for WORK
* @param {NonNegativeInteger} offsetWORK - starting index for WORK
* @param {integer} lwork - length of WORK
* @returns {Object} { ns, nd }
*/
function dlaqr3( wantt, wantz, N, ktop, kbot, nw, H, strideH1, strideH2, offsetH, iloz, ihiz, Z, strideZ1, strideZ2, offsetZ, ns, nd, SR, strideSR, offsetSR, SI, strideSI, offsetSI, V, strideV1, strideV2, offsetV, nh, T, strideT1, strideT2, offsetT, nv, WV, strideWV1, strideWV2, offsetWV, WORK, strideWORK, offsetWORK, lwork ) { // eslint-disable-line max-len, max-params
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( wantt, wantz, N, ktop, kbot, nw, H, strideH1, strideH2, offsetH, iloz, ihiz, Z, strideZ1, strideZ2, offsetZ, ns, nd, SR, strideSR, offsetSR, SI, strideSI, offsetSI, V, strideV1, strideV2, offsetV, nh, T, strideT1, strideT2, offsetT, nv, WV, strideWV1, strideWV2, offsetWV, WORK, strideWORK, offsetWORK, lwork ); // eslint-disable-line max-len
}


// EXPORTS //

export default dlaqr3;
