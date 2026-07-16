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
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Complex aggressive early deflation (recursive).
*
* @param {boolean} wantt - wantt
* @param {boolean} wantz - wantz
* @param {NonNegativeInteger} N - number of columns
* @param {integer} ktop - ktop
* @param {integer} kbot - kbot
* @param {integer} nw - nw
* @param {Complex128Array} H - input matrix
* @param {integer} strideH1 - stride of the first dimension of `H`
* @param {integer} strideH2 - stride of the second dimension of `H`
* @param {NonNegativeInteger} offsetH - starting index for `H`
* @param {integer} iloz - iloz
* @param {integer} ihiz - ihiz
* @param {Complex128Array} Z - input matrix
* @param {integer} strideZ1 - stride of the first dimension of `Z`
* @param {integer} strideZ2 - stride of the second dimension of `Z`
* @param {NonNegativeInteger} offsetZ - starting index for `Z`
* @param {integer} ns - ns
* @param {integer} nd - nd
* @param {Complex128Array} SH - input array
* @param {integer} strideSH - stride length for `SH`
* @param {NonNegativeInteger} offsetSH - starting index for `SH`
* @param {Complex128Array} V - input matrix
* @param {integer} strideV1 - stride of the first dimension of `V`
* @param {integer} strideV2 - stride of the second dimension of `V`
* @param {NonNegativeInteger} offsetV - starting index for `V`
* @param {integer} nhp - nhp
* @param {Complex128Array} T - input matrix
* @param {integer} strideT1 - stride of the first dimension of `T`
* @param {integer} strideT2 - stride of the second dimension of `T`
* @param {NonNegativeInteger} offsetT - starting index for `T`
* @param {integer} nvp - nvp
* @param {Complex128Array} WV - input matrix
* @param {integer} strideWV1 - stride of the first dimension of `WV`
* @param {integer} strideWV2 - stride of the second dimension of `WV`
* @param {NonNegativeInteger} offsetWV - starting index for `WV`
* @param {Complex128Array} WORK - workspace array (length `>= max(1, 2*nw)`)
* @param {integer} strideWork - stride length for `WORK`
* @param {NonNegativeInteger} offsetWork - starting index for `WORK`
* @throws {RangeError} if a numerical argument does not satisfy constraints
*/
function zlaqr3( wantt, wantz, N, ktop, kbot, nw, H, strideH1, strideH2, offsetH, iloz, ihiz, Z, strideZ1, strideZ2, offsetZ, ns, nd, SH, strideSH, offsetSH, V, strideV1, strideV2, offsetV, nhp, T, strideT1, strideT2, offsetT, nvp, WV, strideWV1, strideWV2, offsetWV, WORK, strideWork, offsetWork ) { // eslint-disable-line max-len, max-params
	var need;
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	// Caller owns the workspace. When a deflation window is actually processed
	// (`nw >= 1` and `kbot >= ktop`), `LWORK = 2*nw` suffices; assert it so an
	// under-sized buffer is a loud RangeError instead of silent NaN.
	if ( nw >= 1 && kbot >= ktop ) {
		need = max( 1, 2*nw );
		if ( !WORK || ( WORK.length - offsetWork ) < need ) {
			throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', need, offsetWork, ( WORK ) ? WORK.length : 0 ) );
		}
	}
	return base( wantt, wantz, N, ktop, kbot, nw, H, strideH1, strideH2, offsetH, iloz, ihiz, Z, strideZ1, strideZ2, offsetZ, ns, nd, SH, strideSH, offsetSH, V, strideV1, strideV2, offsetV, nhp, T, strideT1, strideT2, offsetT, nvp, WV, strideWV1, strideWV2, offsetWV, WORK, strideWork, offsetWork ); // eslint-disable-line max-len
}


// EXPORTS //

export default zlaqr3;
