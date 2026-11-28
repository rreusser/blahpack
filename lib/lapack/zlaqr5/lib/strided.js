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
* Complex multi-shift QR sweep.
*
* @param {boolean} wantt - wANTT = `true` if the triangular Schur factor is being computed.
* @param {boolean} wantz - wANTZ = `true` if the unitary Schur factor is being computed.
* @param {integer} kacc22 - specifies the computation mode of far-from-diagonal orthogonal updates. = 0: ZLAQR5 does not accumulate reflections and does not use matrix-matrix multiply to update far-from-diagonal matrix entries. = 1: ZLAQR5 accumulates reflections and uses matrix-matrix multiply to update the far-from-diagonal matrix entries. = 2: Same as KACC22 = 1.
* @param {NonNegativeInteger} N - number of columns
* @param {integer} ktop - these are the first and last rows and columns of an isolated diagonal block upon which the QR sweep is to be applied.
* @param {integer} kbot - these are the first and last rows and columns of an isolated diagonal block upon which the QR sweep is to be applied.
* @param {NonNegativeInteger} nshfts - nSHFTS gives the number of simultaneous shifts.
* @param {Complex128Array} s - input array
* @param {integer} strideS - stride length for `s`
* @param {NonNegativeInteger} offsetS - starting index for `s`
* @param {Complex128Array} H - input matrix
* @param {integer} strideH1 - stride of the first dimension of `H`
* @param {integer} strideH2 - stride of the second dimension of `H`
* @param {NonNegativeInteger} offsetH - starting index for `H`
* @param {integer} iloz - specify the rows of Z to which transformations must be applied if WANTZ is `true`. 1 <= ILOZ <= IHIZ <= N.
* @param {NonNegativeInteger} ihiz - specify the rows of Z to which transformations must be applied if WANTZ is `true`. 1 <= ILOZ <= IHIZ <= N.
* @param {Complex128Array} Z - input matrix
* @param {integer} strideZ1 - stride of the first dimension of `Z`
* @param {integer} strideZ2 - stride of the second dimension of `Z`
* @param {NonNegativeInteger} offsetZ - starting index for `Z`
* @param {Complex128Array} V - input matrix
* @param {integer} strideV1 - stride of the first dimension of `V`
* @param {integer} strideV2 - stride of the second dimension of `V`
* @param {NonNegativeInteger} offsetV - starting index for `V`
* @param {Complex128Array} U - input matrix
* @param {integer} strideU1 - stride of the first dimension of `U`
* @param {integer} strideU2 - stride of the second dimension of `U`
* @param {NonNegativeInteger} offsetU - starting index for `U`
* @param {integer} nv - nV is the number of rows in WV agailable for workspace.
* @param {Complex128Array} WV - input matrix
* @param {integer} strideWV1 - stride of the first dimension of `WV`
* @param {integer} strideWV2 - stride of the second dimension of `WV`
* @param {NonNegativeInteger} offsetWV - starting index for `WV`
* @param {NonNegativeInteger} nh - nH is the number of columns in array WH available for workspace.
* @param {Complex128Array} WH - output matrix
* @param {integer} strideWH1 - stride of the first dimension of `WH`
* @param {integer} strideWH2 - stride of the second dimension of `WH`
* @param {NonNegativeInteger} offsetWH - starting index for `WH`
* @returns {Complex128Array} `WH`
*/
function zlaqr5( wantt, wantz, kacc22, N, ktop, kbot, nshfts, s, strideS, offsetS, H, strideH1, strideH2, offsetH, iloz, ihiz, Z, strideZ1, strideZ2, offsetZ, V, strideV1, strideV2, offsetV, U, strideU1, strideU2, offsetU, nv, WV, strideWV1, strideWV2, offsetWV, nh, WH, strideWH1, strideWH2, offsetWH ) { // eslint-disable-line max-len, max-params
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( wantt, wantz, kacc22, N, ktop, kbot, nshfts, s, strideS, offsetS, H, strideH1, strideH2, offsetH, iloz, ihiz, Z, strideZ1, strideZ2, offsetZ, V, strideV1, strideV2, offsetV, U, strideU1, strideU2, offsetU, nv, WV, strideWV1, strideWV2, offsetWV, nh, WH, strideWH1, strideWH2, offsetWH ); // eslint-disable-line max-len
}


// EXPORTS //

export default zlaqr5;
