/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable max-len, max-params */

// MODULES //

import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Performs a series of row interchanges on a matrix `A` using pivot indices stored in `IPIV`.
*
* ## Notes
*
* -   The pivot index for row `k` is stored at `IPIV[ o + k*strideIPIV ]`, where `o` is `0` for a positive stride and `k2*|strideIPIV|` for a negative stride.
* -   If `inck < 0`, the pivots are applied in reverse order (from `k2` down to `k1`); otherwise, they are applied in order (from `k1` up to `k2`).
*
* @param {Layout} order - storage layout ('row-major' or 'column-major')
* @param {NonNegativeInteger} N - number of columns in `A`
* @param {Float64Array} A - input matrix
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {NonNegativeInteger} k1 - index of first row to interchange
* @param {NonNegativeInteger} k2 - index of last row to interchange
* @param {integer} inck - direction in which to apply pivots (-1 to apply pivots in reverse order; otherwise, apply in provided order)
* @param {Int32Array} IPIV - vector of pivot indices
* @param {integer} strideIPIV - `IPIV` stride length
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} second argument must be a nonnegative integer
* @throws {RangeError} fourth argument must be greater than or equal to max(1,N)
* @returns {Float64Array} permuted matrix `A`
*/
function dlaswp( order, N, A, LDA, k1, k2, inck, IPIV, strideIPIV ) {
	let sa1, sa2;
	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( order === 'row-major' && LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDA ) );
	}
	if ( order === 'column-major' ) {
		sa1 = 1;
		sa2 = LDA;
	} else { // order === 'row-major'
		sa1 = LDA;
		sa2 = 1;
	}
	const oip = stride2offset( k2 + 1, strideIPIV );
	if ( inck < 0 ) {
		return base( N, A, sa1, sa2, 0, k2, k1, -1, IPIV, -strideIPIV, oip + ( k2 * strideIPIV ) );
	}
	return base( N, A, sa1, sa2, 0, k1, k2, 1, IPIV, strideIPIV, oip + ( k1 * strideIPIV ) );
}


// EXPORTS //

export default dlaswp;
