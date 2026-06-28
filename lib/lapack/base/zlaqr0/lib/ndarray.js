

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Complex multishift QR top-level driver.
*
* @param {boolean} wantt - wantt
* @param {boolean} wantz - wantz
* @param {NonNegativeInteger} N - number of columns
* @param {integer} ilo - ilo
* @param {integer} ihi - ihi
* @param {Complex128Array} H - input matrix
* @param {integer} strideH1 - stride of the first dimension of `H`
* @param {integer} strideH2 - stride of the second dimension of `H`
* @param {NonNegativeInteger} offsetH - starting index for `H`
* @param {Complex128Array} w - input array
* @param {integer} strideW - stride length for `w`
* @param {NonNegativeInteger} offsetW - starting index for `w`
* @param {integer} iloz - iloz
* @param {integer} ihiz - ihiz
* @param {Complex128Array} Z - input matrix
* @param {integer} strideZ1 - stride of the first dimension of `Z`
* @param {integer} strideZ2 - stride of the second dimension of `Z`
* @param {NonNegativeInteger} offsetZ - starting index for `Z`
* @param {Float64Array} WORK - output array
* @param {integer} strideWORK - stride length for `WORK`
* @param {NonNegativeInteger} offsetWORK - starting index for `WORK`
* @param {integer} lwork - lwork
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} status code (0 = success)
*/
function zlaqr0( wantt, wantz, N, ilo, ihi, H, strideH1, strideH2, offsetH, w, strideW, offsetW, iloz, ihiz, Z, strideZ1, strideZ2, offsetZ, WORK, strideWORK, offsetWORK, lwork ) { // eslint-disable-line max-len, max-params
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( wantt, wantz, N, ilo, ihi, H, strideH1, strideH2, offsetH, w, strideW, offsetW, iloz, ihiz, Z, strideZ1, strideZ2, offsetZ, WORK, strideWORK, offsetWORK, lwork ); // eslint-disable-line max-len
}


// EXPORTS //

export default zlaqr0;
