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
import floor from '@stdlib/math/base/special/floor/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import min from '@stdlib/math/base/special/fast/min/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Complex multishift QR with aggressive early deflation (non-recursive).
*
* @param {boolean} wantt - = `true` : the full Schur form T is required; = `false`: only eigenvalues are required.
* @param {boolean} wantz - = `true` : the matrix of Schur vectors Z is required; = `false`: Schur vectors are not required.
* @param {NonNegativeInteger} N - number of columns
* @param {integer} ilo - it is assumed that H is already upper triangular in rows and columns 1:ILO-1 and IHI+1:N and, if ILO > 1, H(ILO,ILO-1) is zero.
* @param {NonNegativeInteger} ihi - it is assumed that H is already upper triangular in rows and columns 1:ILO-1 and IHI+1:N and, if ILO > 1, H(ILO,ILO-1) is zero.
* @param {Complex128Array} H - input matrix
* @param {integer} strideH1 - stride of the first dimension of `H`
* @param {integer} strideH2 - stride of the second dimension of `H`
* @param {NonNegativeInteger} offsetH - starting index for `H`
* @param {Complex128Array} w - input array
* @param {integer} strideW - stride length for `w`
* @param {NonNegativeInteger} offsetW - starting index for `w`
* @param {integer} iloz - specify the rows of Z to which transformations must be applied if WANTZ is `true`. 1 <= ILOZ <= ILO.
* @param {integer} ihiz - specify the rows of Z to which transformations must be applied if WANTZ is `true`. 1 <= ILOZ <= ILO.
* @param {Complex128Array} Z - input matrix
* @param {integer} strideZ1 - stride of the first dimension of `Z`
* @param {integer} strideZ2 - stride of the second dimension of `Z`
* @param {NonNegativeInteger} offsetZ - starting index for `Z`
* @param {Complex128Array} WORK - workspace array (length `>= max(1, N)`)
* @param {integer} strideWork - stride length for `WORK`
* @param {NonNegativeInteger} offsetWork - starting index for `WORK`
* @returns {integer} status code (0 = success)
*/
function zlaqr4( wantt, wantz, N, ilo, ihi, H, strideH1, strideH2, offsetH, w, strideW, offsetW, iloz, ihiz, Z, strideZ1, strideZ2, offsetZ, WORK, strideWork, offsetWork ) { // eslint-disable-line max-len, max-params
	let jwmax;
	let need;
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	// Caller owns the workspace; assert it so an under-sized buffer is a loud
	// RangeError instead of silent NaN.
	// The reference minimum `max(1,N)` relies on the AED window being capped at
	// `NW <= LWORK/2` and on zlaqr2's `2*NW` then sufficing, because the
	// reference ZGEHRD/ZUNMHR/UNMHR shrink NB to fit. The JS ones always block (NB = 32)
	// once more than 32 shifts stay undeflated, so zlaqr2 needs `33*JW + 2080`
	// whenever its window `JW > 32`; a WORK of `max(1,N)` with `66 <= N` lets
	// `JW` reach `min( (N-1)/3, IHI-ILO+1 )` and overruns. Size for the largest
	// window that can be reached (ticket 0096):
	if ( N > 0 ) {
		need = max( 1, N );
		jwmax = min( floor( ( N - 1 ) / 3 ), ( ihi - ilo ) + 1 );
		if ( jwmax > 32 ) {
			need = max( need, ( 33 * jwmax ) + 2080 );
		}
		if ( !WORK || ( WORK.length - offsetWork ) < need ) {
			throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', need, offsetWork, ( WORK ) ? WORK.length : 0 ) );
		}
	}
	if ( strideWork !== 1 ) {
		throw new RangeError( format( 'invalid argument. `strideWork` must be 1 (only contiguous workspace is supported). Value: `%d`.', strideWork ) );
	}
	return base( wantt, wantz, N, ilo, ihi, H, strideH1, strideH2, offsetH, w, strideW, offsetW, iloz, ihiz, Z, strideZ1, strideZ2, offsetZ, WORK, strideWork, offsetWork ); // eslint-disable-line max-len
}


// EXPORTS //

export default zlaqr4;
