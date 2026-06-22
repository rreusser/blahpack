
// MODULES //

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Rearranges the rows of an M-by-N matrix X as specified by a permutation vector.
*
* @param {boolean} forwrd - if true, apply forward permutation; if false, backward
* @param {NonNegativeInteger} M - number of rows of X
* @param {NonNegativeInteger} N - number of columns of X
* @param {Float64Array} X - input/output matrix (M x N)
* @param {PositiveInteger} LDX - leading dimension of `X`
* @param {Int32Array} k - permutation vector (length M)
* @param {integer} strideK - stride length for `k`
*/
function dlapmr( forwrd, M, N, X, LDX, k, strideK ) { // eslint-disable-line max-len, max-params
	var sx1;
	var sx2;
	var ok;

	sx1 = 1;
	sx2 = LDX;
	ok = stride2offset( M, strideK );
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( LDX < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be greater than or equal to max(1,M). Value: `%d`.', LDX ) );
	}
	base( forwrd, M, N, X, sx1, sx2, 0, k, strideK, ok );
}


// EXPORTS //

export default dlapmr;
