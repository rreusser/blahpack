

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Rearranges the rows of an M-by-N complex matrix X as specified by a permutation vector.
*
* If `forwrd` is true, forward permutation: `X(K[i],*) is moved to X(i,*)`.
*
* If `forwrd` is false, backward permutation: `X(i,*) is moved to X(K[i],*)`.
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
* @param {Complex128Array} X - input/output matrix (M x N)
* @param {integer} strideX1 - stride of the first dimension of `X` (in complex elements)
* @param {integer} strideX2 - stride of the second dimension of `X` (in complex elements)
* @param {NonNegativeInteger} offsetX - starting index for `X` (in complex elements)
* @param {Int32Array} k - permutation vector (length M), 0-based indices
* @param {integer} strideK - stride length for `k`
* @param {NonNegativeInteger} offsetK - starting index for `k`
* @throws {RangeError} if a numerical argument does not satisfy constraints
*/
function zlapmr( forwrd, M, N, X, strideX1, strideX2, offsetX, k, strideK, offsetK ) { // eslint-disable-line max-len, max-params
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( forwrd, M, N, X, strideX1, strideX2, offsetX, k, strideK, offsetK ); // eslint-disable-line max-len
}


// EXPORTS //

export default zlapmr;
