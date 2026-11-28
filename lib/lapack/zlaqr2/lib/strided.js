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
import min from '@stdlib/math/base/special/fast/min/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Complex aggressive early deflation (non-recursive).
*
* @param {boolean} wantt - if `true`, then the Hessenberg matrix H is fully updated so that the triangular Schur factor may be computed (in cooperation with the calling subroutine).
* @param {boolean} wantz - if `true`, then the unitary matrix Z is updated so so that the unitary Schur factor may be computed (in cooperation with the calling subroutine).
* @param {NonNegativeInteger} N - number of columns
* @param {integer} ktop - it is assumed that either KTOP = 1 or H(KTOP,KTOP-1)=0.
* @param {NonNegativeInteger} kbot - it is assumed without a check that either KBOT = N or H(KBOT+1,KBOT)=0.
* @param {NonNegativeInteger} nw - deflation window size. 1 <= NW <= (KBOT-KTOP+1).
* @param {Complex128Array} H - input matrix
* @param {integer} strideH1 - stride of the first dimension of `H`
* @param {integer} strideH2 - stride of the second dimension of `H`
* @param {NonNegativeInteger} offsetH - starting index for `H`
* @param {integer} iloz - specify the rows of Z to which transformations must be applied if WANTZ is `true`. 1 <= ILOZ <= IHIZ <= N.
* @param {integer} ihiz - specify the rows of Z to which transformations must be applied if WANTZ is `true`. 1 <= ILOZ <= IHIZ <= N.
* @param {Complex128Array} Z - input matrix
* @param {integer} strideZ1 - stride of the first dimension of `Z`
* @param {integer} strideZ2 - stride of the second dimension of `Z`
* @param {NonNegativeInteger} offsetZ - starting index for `Z`
* @param {Int32Array} ns - input/output (length-1 array): ns
* @param {Int32Array} nd - input/output (length-1 array): nd
* @param {Complex128Array} SH - input array
* @param {integer} strideSH - stride length for `SH`
* @param {NonNegativeInteger} offsetSH - starting index for `SH`
* @param {Complex128Array} V - input matrix
* @param {integer} strideV1 - stride of the first dimension of `V`
* @param {integer} strideV2 - stride of the second dimension of `V`
* @param {NonNegativeInteger} offsetV - starting index for `V`
* @param {integer} nh - nhp
* @param {Complex128Array} T - input matrix
* @param {integer} strideT1 - stride of the first dimension of `T`
* @param {integer} strideT2 - stride of the second dimension of `T`
* @param {NonNegativeInteger} offsetT - starting index for `T`
* @param {integer} nv - nvp
* @param {Complex128Array} WV - input matrix
* @param {integer} strideWV1 - stride of the first dimension of `WV`
* @param {integer} strideWV2 - stride of the second dimension of `WV`
* @param {NonNegativeInteger} offsetWV - starting index for `WV`
* @param {Complex128Array} WORK - workspace array of length at least `2*JW` (`JW = min(nw, kbot-ktop+1)`, the reference's `2*NW`); the reference's optimum (`JW + JW*32 + 4160` for `JW > 2`) keeps ZGEHRD/ZUNMHR blocked
* @param {integer} strideWork - stride length for `WORK`
* @param {NonNegativeInteger} offsetWork - starting index for `WORK`
* @returns {Complex128Array} `WV`
*/
function zlaqr2( wantt, wantz, N, ktop, kbot, nw, H, strideH1, strideH2, offsetH, iloz, ihiz, Z, strideZ1, strideZ2, offsetZ, ns, nd, SH, strideSH, offsetSH, V, strideV1, strideV2, offsetV, nh, T, strideT1, strideT2, offsetT, nv, WV, strideWV1, strideWV2, offsetWV, WORK, strideWork, offsetWork ) { // eslint-disable-line max-len, max-params
	let need;
	let jw;
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	// WORK(1:JW) holds the reflector and WORK(JW+1:) is the ZLARF/ZGEHRD/ZUNMHR workspace, JW = min(NW, KBOT-KTOP+1): the reference's LWORK = 2*NW (ZGEHRD and ZUNMHR need JW of it and adapt their blocking to what they get):
	if ( nw >= 1 && kbot >= ktop ) {
		jw = min( nw, kbot - ktop + 1 );
		need = 2 * jw;
		if ( !WORK || ( WORK.length - offsetWork ) < need ) {
			throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', need, offsetWork, ( WORK ) ? WORK.length : 0 ) );
		}
	}
	if ( strideWork !== 1 ) {
		throw new RangeError( format( 'invalid argument. `strideWork` must be 1 (only contiguous workspace is supported). Value: `%d`.', strideWork ) );
	}
	return base( wantt, wantz, N, ktop, kbot, nw, H, strideH1, strideH2, offsetH, iloz, ihiz, Z, strideZ1, strideZ2, offsetZ, ns, nd, SH, strideSH, offsetSH, V, strideV1, strideV2, offsetV, nh, T, strideT1, strideT2, offsetT, nv, WV, strideWV1, strideWV2, offsetWV, WORK, strideWork, offsetWork ); // eslint-disable-line max-len
}


// EXPORTS //

export default zlaqr2;
