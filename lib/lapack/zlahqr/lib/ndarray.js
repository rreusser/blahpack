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
* Computes the eigenvalues and optionally the Schur factorization of an upper.
* Hessenberg matrix using the single-shift QR algorithm for complex matrices.
*
* All indices (ilo, ihi, iloz, ihiz) are 1-based (Fortran convention).
*
* @param {boolean} wantt - if true, compute full Schur form T
* @param {boolean} wantz - if true, compute Schur vectors Z
* @param {NonNegativeInteger} N - order of the matrix H
* @param {integer} ilo - first row/col of the active block (1-based)
* @param {integer} ihi - last row/col of the active block (1-based)
* @param {Complex128Array} H - upper Hessenberg matrix, modified in place
* @param {integer} strideH1 - stride of first dimension of H (complex elements)
* @param {integer} strideH2 - stride of second dimension of H (complex elements)
* @param {NonNegativeInteger} offsetH - starting index for H (complex elements)
* @param {Complex128Array} W - output eigenvalues
* @param {integer} strideW - stride for W (complex elements)
* @param {NonNegativeInteger} offsetW - starting index for W (complex elements)
* @param {integer} iloz - first row of Z to update (1-based)
* @param {integer} ihiz - last row of Z to update (1-based)
* @param {Complex128Array} Z - Schur vectors, modified if wantz is true
* @param {integer} strideZ1 - stride of first dimension of Z (complex elements)
* @param {integer} strideZ2 - stride of second dimension of Z (complex elements)
* @param {NonNegativeInteger} offsetZ - starting index for Z (complex elements)
* @returns {integer} info - 0 on success, >0 if failed to converge
*/
function zlahqr( wantt, wantz, N, ilo, ihi, H, strideH1, strideH2, offsetH, W, strideW, offsetW, iloz, ihiz, Z, strideZ1, strideZ2, offsetZ ) { // eslint-disable-line max-len, max-params
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( wantt, wantz, N, ilo, ihi, H, strideH1, strideH2, offsetH, W, strideW, offsetW, iloz, ihiz, Z, strideZ1, strideZ2, offsetZ ); // eslint-disable-line max-len
}


// EXPORTS //

export default zlahqr;
