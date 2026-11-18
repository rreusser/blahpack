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

import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Rearranges the rows of an M-by-N complex matrix X as specified by a permutation vector.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {boolean} forwrd - if true, apply forward permutation; if false, backward
* @param {NonNegativeInteger} M - number of rows of X
* @param {NonNegativeInteger} N - number of columns of X
* @param {Complex128Array} X - input/output matrix (M x N)
* @param {PositiveInteger} LDX - leading dimension of `X`
* @param {Int32Array} k - permutation vector (length M)
* @param {integer} strideK - stride length for `k`
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} if a numerical argument does not satisfy constraints
*/
function zlapmr( order, forwrd, M, N, X, LDX, k, strideK ) { // eslint-disable-line max-len, max-params

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	const sx1 = ( order === 'column-major' ) ? 1 : LDX;
	const sx2 = ( order === 'column-major' ) ? LDX : 1;
	const ok = stride2offset( M, strideK );
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( order === 'row-major' && LDX < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be greater than or equal to max(1,N). Value: `%d`.', LDX ) );
	}
	if ( order === 'column-major' && LDX < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be greater than or equal to max(1,M). Value: `%d`.', LDX ) );
	}
	base( forwrd, M, N, X, sx1, sx2, 0, k, strideK, ok );
}


// EXPORTS //

export default zlapmr;
