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
* Computes a QR factorization of a real `M`-by-`N` matrix `A = Q * R` (with `M >= N`) using the compact `WY` representation of `Q`.
*
* @param {NonNegativeInteger} M - number of rows in `A` (must satisfy `M >= N`)
* @param {NonNegativeInteger} N - number of columns in `A`
* @param {Float64Array} A - input/output matrix
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Float64Array} T - output block reflector factor
* @param {integer} strideT1 - stride of the first dimension of `T`
* @param {integer} strideT2 - stride of the second dimension of `T`
* @param {NonNegativeInteger} offsetT - starting index for `T`
* @throws {RangeError} first argument must be a nonnegative integer
* @throws {RangeError} second argument must be a nonnegative integer
* @throws {RangeError} `M` must be greater than or equal to `N`
* @returns {integer} status code (`0` = success)
*/
function dgeqrt2( M, N, A, strideA1, strideA2, offsetA, T, strideT1, strideT2, offsetT ) {
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( M < N ) {
		throw new RangeError( format( 'invalid argument. `M` must be greater than or equal to `N`. M: `%d`. N: `%d`.', M, N ) );
	}
	return base( M, N, A, strideA1, strideA2, offsetA, T, strideT1, strideT2, offsetT );
}


// EXPORTS //

export default dgeqrt2;
