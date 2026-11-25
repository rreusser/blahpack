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
* Computes the eigenvalues of a Hessenberg matrix H and, optionally, the.
* matrices T and Z from the Schur decomposition H = Z T Z**T, where T is
* an upper quasi-triangular matrix (the Schur form), and Z is the orthogonal
* matrix of Schur vectors.
*
* This is the top-level driver that uses the multishift QR algorithm with
* aggressive early deflation (calls dlaqr3/dlaqr5). For small matrices
* (N <= NTINY = 15), it falls back to dlahqr.
*
* Note: ILO, IHI, ILOZ, IHIZ are 1-based (Fortran convention).
*
* @param {boolean} wantt - if true, compute full Schur form
* @param {boolean} wantz - if true, compute Schur vectors
* @param {NonNegativeInteger} N - order of the matrix H
* @param {integer} ilo - first row/col of the active block (1-based)
* @param {NonNegativeInteger} ihi - last row/col of the active block (1-based)
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
* @param {integer} strideWork - stride for WORK
* @param {NonNegativeInteger} offsetWork - starting index for WORK
* @returns {integer} info (0=success, >0=convergence failure at that index)
*/
function dlaqr0( wantt, wantz, N, ilo, ihi, H, strideH1, strideH2, offsetH, WR, strideWR, offsetWR, WI, strideWI, offsetWI, iloz, ihiz, Z, strideZ1, strideZ2, offsetZ, WORK, strideWork, offsetWork ) { // eslint-disable-line max-len, max-params
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	// The reference minimum `max(1,N)` relies on the AED window being capped at
	// `NW <= LWORK/2` and on dlaqr3's `2*NW` then sufficing, because the
	// reference DGEHRD/DORMHR/UNMHR shrink NB to fit. The JS ones always block (NB = 32)
	// once more than 32 shifts stay undeflated, so dlaqr3 needs `33*JW + 2080`
	// whenever its window `JW > 32`; a WORK of `max(1,N)` with `66 <= N` lets
	// `JW` reach `min( (N-1)/3, IHI-ILO+1 )` and overruns. Size for the largest
	// window that can be reached (ticket 0096):
	const jwmax = Math.min( Math.floor( ( N - 1 ) / 3 ), ( ihi - ilo ) + 1 );
	let minWork = Math.max( 1, N );
	if ( jwmax > 32 ) {
		minWork = Math.max( minWork, ( 33 * jwmax ) + 2080 );
	}
	if ( !WORK || ( WORK.length - offsetWork ) < minWork ) {
		throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', minWork, offsetWork, ( WORK ) ? WORK.length : 0 ) );
	}
	if ( strideWork !== 1 ) {
		throw new RangeError( format( 'invalid argument. `strideWork` must be 1 (only contiguous workspace is supported). Value: `%d`.', strideWork ) );
	}
	return base( wantt, wantz, N, ilo, ihi, H, strideH1, strideH2, offsetH, WR, strideWR, offsetWR, WI, strideWI, offsetWI, iloz, ihiz, Z, strideZ1, strideZ2, offsetZ, WORK, strideWork, offsetWork ); // eslint-disable-line max-len
}


// EXPORTS //

export default dlaqr0;
