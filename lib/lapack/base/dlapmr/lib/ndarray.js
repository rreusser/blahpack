
// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Rearranges the rows of an M-by-N matrix X as specified by a permutation vector.
*
* If FORWRD is true, forward permutation: new row I = old row `K(I)`.
*
* If FORWRD is false, backward permutation: new row `K(I)` = old row I.
*
* ## Notes
*
* -   K is 0-based in base.js. The ndarray.js wrapper converts from 1-based.
*
* -   The permutation array K is modified during execution (negated entries as
*     markers) but restored to its original state on exit.
*
* @param {boolean} forwrd - if true, apply forward permutation; if false, backward
* @param {NonNegativeInteger} M - number of rows of X
* @param {NonNegativeInteger} N - number of columns of X
* @param {Float64Array} X - input/output matrix (M x N)
* @param {integer} strideX1 - stride of the first dimension of `X`
* @param {integer} strideX2 - stride of the second dimension of `X`
* @param {NonNegativeInteger} offsetX - starting index for `X`
* @param {Int32Array} k - permutation vector (length M), 0-based indices
* @param {integer} strideK - stride length for `k`
* @param {NonNegativeInteger} offsetK - starting index for `k`
*/
function dlapmr( forwrd, M, N, X, strideX1, strideX2, offsetX, k, strideK, offsetK ) { // eslint-disable-line max-len, max-params
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( forwrd, M, N, X, strideX1, strideX2, offsetX, k, strideK, offsetK ); // eslint-disable-line max-len
}


// EXPORTS //

export default dlapmr;
