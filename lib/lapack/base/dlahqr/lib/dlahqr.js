
// MODULES //

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* @license Apache-2.0
*
* @param {boolean} wantt - wantt
* @param {boolean} wantz - wantz
* @param {NonNegativeInteger} N - N
* @param {integer} ilo - ilo
* @param {integer} ihi - ihi
* @param {Float64Array} H - H
* @param {PositiveInteger} LDH - leading dimension of `H`
* @param {Float64Array} WR - WR
* @param {integer} strideWR - strideWR
* @param {Float64Array} WI - WI
* @param {integer} strideWI - strideWI
* @param {integer} iloz - iloz
* @param {integer} ihiz - ihiz
* @param {Float64Array} Z - Z
* @param {PositiveInteger} LDZ - leading dimension of `Z`
* @returns {integer} info status code
*/
function dlahqr( wantt, wantz, N, ilo, ihi, H, LDH, WR, strideWR, WI, strideWI, iloz, ihiz, Z, LDZ ) { // eslint-disable-line max-len, max-params
	var owi;
	var owr;
	var sh1;
	var sh2;
	var sz1;
	var sz2;

	sh1 = 1;
	sh2 = LDH;
	sz1 = 1;
	sz2 = LDZ;
	owr = stride2offset( N, strideWR );
	owi = stride2offset( N, strideWI );
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( LDH < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be greater than or equal to max(1,N). Value: `%d`.', LDH ) );
	}
	if ( LDZ < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Fifteenth argument must be greater than or equal to max(1,N). Value: `%d`.', LDZ ) );
	}
	return base( wantt, wantz, N, ilo, ihi, H, sh1, sh2, 0, WR, strideWR, owr, WI, strideWI, owi, iloz, ihiz, Z, sz1, sz2, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default dlahqr;
