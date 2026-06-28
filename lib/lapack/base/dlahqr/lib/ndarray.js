
// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes the eigenvalues and optionally the Schur factorization of an upper.
* Hessenberg matrix, using the double-shift implicit QR algorithm.
*
* On exit, H is upper quasi-triangular (Schur form) if WANTT is true,
* otherwise it is in an unspecified form. The eigenvalues are stored in
* (WR, WI): real parts in WR, imaginary parts in WI. Complex eigenvalues
* come in conjugate pairs stored in consecutive entries.
*
* INFO = 0: success.
* INFO > 0: dlahqr failed to compute all eigenvalues. Element INFO
*           (1-based) of WR and WI contains those eigenvalues which
*           have been successfully computed.
*
* Note: ILO and IHI are 1-based indices (Fortran convention).
*
* @param {boolean} wantt - if true, compute the full Schur form T
* @param {boolean} wantz - if true, compute the Schur vectors Z
* @param {NonNegativeInteger} N - order of the matrix H
* @param {integer} ilo - first row/col of the block (1-based)
* @param {integer} ihi - last row/col of the block (1-based)
* @param {Float64Array} H - upper Hessenberg matrix
* @param {integer} strideH1 - stride of the first dimension of `H`
* @param {integer} strideH2 - stride of the second dimension of `H`
* @param {NonNegativeInteger} offsetH - starting index for `H`
* @param {Float64Array} WR - output array for real parts of eigenvalues
* @param {integer} strideWR - stride length for `WR`
* @param {NonNegativeInteger} offsetWR - starting index for `WR`
* @param {Float64Array} WI - output array for imaginary parts of eigenvalues
* @param {integer} strideWI - stride length for `WI`
* @param {NonNegativeInteger} offsetWI - starting index for `WI`
* @param {integer} iloz - first row of Z to update (1-based)
* @param {integer} ihiz - last row of Z to update (1-based)
* @param {Float64Array} Z - Schur vectors (updated if wantz is true)
* @param {integer} strideZ1 - stride of the first dimension of `Z`
* @param {integer} strideZ2 - stride of the second dimension of `Z`
* @param {NonNegativeInteger} offsetZ - starting index for `Z`
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info - 0 on success, >0 if failed to converge
*/
function dlahqr( wantt, wantz, N, ilo, ihi, H, strideH1, strideH2, offsetH, WR, strideWR, offsetWR, WI, strideWI, offsetWI, iloz, ihiz, Z, strideZ1, strideZ2, offsetZ ) { // eslint-disable-line max-len, max-params
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( wantt, wantz, N, ilo, ihi, H, strideH1, strideH2, offsetH, WR, strideWR, offsetWR, WI, strideWI, offsetWI, iloz, ihiz, Z, strideZ1, strideZ2, offsetZ ); // eslint-disable-line max-len
}


// EXPORTS //

export default dlahqr;
