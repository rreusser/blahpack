
// MODULES //

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* @license Apache-2.0
*
* @param {boolean} forwrd - forwrd
* @param {NonNegativeInteger} M - M
* @param {NonNegativeInteger} N - N
* @param {Float64Array} X - X
* @param {PositiveInteger} LDX - leading dimension of `X`
* @param {Int32Array} k - k
* @param {integer} strideK - strideK
*/
function dlapmt( forwrd, M, N, X, LDX, k, strideK ) { // eslint-disable-line max-len, max-params
	var sx1;
	var sx2;
	var ok;

	sx1 = 1;
	sx2 = LDX;
	ok = stride2offset( N, strideK );
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( LDX < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be greater than or equal to max(1,M). Value: `%d`.', LDX ) );
	}
	return base( forwrd, M, N, X, sx1, sx2, 0, k, strideK, ok );
}


// EXPORTS //

export default dlapmt;
