
// MODULES //

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Sets a scalar multiple of the first column of the product.
*
* @param {NonNegativeInteger} N - N
* @param {Float64Array} H - H
* @param {PositiveInteger} LDH - leading dimension of `H`
* @param {number} sr1 - sr1
* @param {number} si1 - si1
* @param {number} sr2 - sr2
* @param {number} si2 - si2
* @param {Float64Array} v - v
* @param {integer} strideV - strideV
* @throws {RangeError} if a numerical argument does not satisfy constraints
*/
function dlaqr1( N, H, LDH, sr1, si1, sr2, si2, v, strideV ) { // eslint-disable-line max-len, max-params
	var sh1;
	var sh2;
	var ov;

	sh1 = 1;
	sh2 = LDH;
	ov = stride2offset( N, strideV );
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( LDH < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Third argument must be greater than or equal to max(1,N). Value: `%d`.', LDH ) );
	}
	return base( N, H, sh1, sh2, 0, sr1, si1, sr2, si2, v, strideV, ov );
}


// EXPORTS //

export default dlaqr1;
