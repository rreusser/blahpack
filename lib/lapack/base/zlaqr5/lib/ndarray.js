

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Complex multi-shift QR sweep
*
* @param {boolean} wantt - wantt
* @param {boolean} wantz - wantz
* @param {integer} kacc22 - kacc22
* @param {NonNegativeInteger} N - number of columns
* @param {integer} ktop - ktop
* @param {integer} kbot - kbot
* @param {integer} nshfts - nshfts
* @param {Float64Array} s - input array
* @param {integer} strideS - stride length for `s`
* @param {NonNegativeInteger} offsetS - starting index for `s`
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
* @param {Complex128Array} V - input matrix
* @param {integer} strideV1 - stride of the first dimension of `V`
* @param {integer} strideV2 - stride of the second dimension of `V`
* @param {NonNegativeInteger} offsetV - starting index for `V`
* @param {Complex128Array} U - input matrix
* @param {integer} strideU1 - stride of the first dimension of `U`
* @param {integer} strideU2 - stride of the second dimension of `U`
* @param {NonNegativeInteger} offsetU - starting index for `U`
* @param {integer} nv - nv
* @param {Complex128Array} WV - input matrix
* @param {integer} strideWV1 - stride of the first dimension of `WV`
* @param {integer} strideWV2 - stride of the second dimension of `WV`
* @param {NonNegativeInteger} offsetWV - starting index for `WV`
* @param {integer} nh - nh
* @param {Complex128Array} WH - output matrix
* @param {integer} strideWH1 - stride of the first dimension of `WH`
* @param {integer} strideWH2 - stride of the second dimension of `WH`
* @param {NonNegativeInteger} offsetWH - starting index for `WH`
*/
function zlaqr5( wantt, wantz, kacc22, N, ktop, kbot, nshfts, s, strideS, offsetS, H, strideH1, strideH2, offsetH, iloz, ihiz, Z, strideZ1, strideZ2, offsetZ, V, strideV1, strideV2, offsetV, U, strideU1, strideU2, offsetU, nv, WV, strideWV1, strideWV2, offsetWV, nh, WH, strideWH1, strideWH2, offsetWH ) { // eslint-disable-line max-len, max-params
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( wantt, wantz, kacc22, N, ktop, kbot, nshfts, s, strideS, offsetS, H, strideH1, strideH2, offsetH, iloz, ihiz, Z, strideZ1, strideZ2, offsetZ, V, strideV1, strideV2, offsetV, U, strideU1, strideU2, offsetU, nv, WV, strideWV1, strideWV2, offsetWV, nh, WH, strideWH1, strideWH2, offsetWH ); // eslint-disable-line max-len
}


// EXPORTS //

export default zlaqr5;
