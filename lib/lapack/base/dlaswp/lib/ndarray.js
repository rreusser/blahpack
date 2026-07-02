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

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Performs a series of row interchanges on a matrix `A` using pivot indices stored in `IPIV`, using alternative indexing semantics.
*
* @param {PositiveInteger} N - number of columns in `A`
* @param {Float64Array} A - input matrix
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - index offset for `A`
* @param {NonNegativeInteger} k1 - index of first row to interchange
* @param {NonNegativeInteger} k2 - index of last row to interchange
* @param {integer} inck - direction in which to apply pivots (-1 to apply pivots in reverse order; otherwise, apply in provided order)
* @param {Int32Array} IPIV - vector of pivot indices
* @param {integer} strideIPIV - `IPIV` stride length
* @param {NonNegativeInteger} offsetIPIV - index offset for `IPIV`
* @throws {RangeError} first argument must be a nonnegative integer
* @returns {Float64Array} permuted matrix `A`
*/
function dlaswp( N, A, strideA1, strideA2, offsetA, k1, k2, inck, IPIV, strideIPIV, offsetIPIV ) {
	var tmp;
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( N === 0 ) {
		return A;
	}
	if ( inck < 0 ) {
		offsetIPIV += k2 * strideIPIV;
		strideIPIV *= -1;
		tmp = k1;
		k1 = k2;
		k2 = tmp;
		inck = -1;
	} else {
		offsetIPIV += k1 * strideIPIV;
		inck = 1;
	}
	return base( N, A, strideA1, strideA2, offsetA, k1, k2, inck, IPIV, strideIPIV, offsetIPIV );
}


// EXPORTS //

export default dlaswp;
