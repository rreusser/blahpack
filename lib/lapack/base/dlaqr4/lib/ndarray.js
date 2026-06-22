
// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Implements one level of recursion for DLAQR0. It is a complete implementation.
* of the small bulge multi-shift QR algorithm. This routine is identical to
* DLAQR0 except that it calls DLAQR2 instead of DLAQR3 (breaking the recursion).
*
* Computes the eigenvalues of a Hessenberg matrix H and, optionally, the
* matrices T and Z from the Schur decomposition H = Z T Z**T.
*
* Note: ILO, IHI, ILOZ, IHIZ are 1-based (Fortran convention).
*
* @param {boolean} wantt - if true, compute full Schur form
* @param {boolean} wantz - if true, compute Schur vectors
* @param {NonNegativeInteger} N - order of the matrix H
* @param {integer} ilo - first row/col of the active block (1-based)
* @param {integer} ihi - last row/col of the active block (1-based)
* @param {Float64Array} H - upper Hessenberg matrix
* @param {integer} strideH1 - stride of first dim of H
* @param {integer} strideH2 - stride of second dim of H
* @param {NonNegativeInteger} offsetH - starting index for H
* @param {Float64Array} WR - real parts of eigenvalues (output)
* @param {integer} strideWR - stride for WR
* @param {NonNegativeInteger} offsetWR - starting index for WR
* @param {Float64Array} WI - imaginary parts of eigenvalues (output)
* @param {integer} strideWI - stride for WI
* @param {NonNegativeInteger} offsetWI - starting index for WI
* @param {integer} iloz - first row of Z to update (1-based)
* @param {integer} ihiz - last row of Z to update (1-based)
* @param {Float64Array} Z - orthogonal matrix
* @param {integer} strideZ1 - stride of first dim of Z
* @param {integer} strideZ2 - stride of second dim of Z
* @param {NonNegativeInteger} offsetZ - starting index for Z
* @param {Float64Array} WORK - workspace
* @param {integer} strideWORK - stride for WORK
* @param {NonNegativeInteger} offsetWORK - starting index for WORK
* @param {integer} lwork - length of WORK
* @returns {integer} info (0=success, >0=convergence failure at that index)
*/
function dlaqr4( wantt, wantz, N, ilo, ihi, H, strideH1, strideH2, offsetH, WR, strideWR, offsetWR, WI, strideWI, offsetWI, iloz, ihiz, Z, strideZ1, strideZ2, offsetZ, WORK, strideWORK, offsetWORK, lwork ) { // eslint-disable-line max-len, max-params
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( wantt, wantz, N, ilo, ihi, H, strideH1, strideH2, offsetH, WR, strideWR, offsetWR, WI, strideWI, offsetWI, iloz, ihiz, Z, strideZ1, strideZ2, offsetZ, WORK, strideWORK, offsetWORK, lwork ); // eslint-disable-line max-len
}


// EXPORTS //

export default dlaqr4;
