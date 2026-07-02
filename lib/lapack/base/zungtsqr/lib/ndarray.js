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
* Generates an `M`-by-`N` complex matrix `Q` with orthonormal columns from a Tall-Skinny QR factorization (output of `zlatsqr`).
*
* @param {NonNegativeInteger} M - number of rows of `A` (`M >= 0`)
* @param {NonNegativeInteger} N - number of columns of `A` (`0 <= N <= M`)
* @param {PositiveInteger} mb - row block size used by `zlatsqr` (`mb > N`)
* @param {PositiveInteger} nb - column block size used by `zlatsqr` (`nb >= 1`)
* @param {Complex128Array} A - input/output matrix (`M`-by-`N`)
* @param {integer} strideA1 - stride of the first dimension of `A` (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of `A` (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for `A` (in complex elements)
* @param {Complex128Array} T - block triangular factors from `zlatsqr`
* @param {integer} strideT1 - stride of the first dimension of `T` (in complex elements)
* @param {integer} strideT2 - stride of the second dimension of `T` (in complex elements)
* @param {NonNegativeInteger} offsetT - starting index for `T` (in complex elements)
* @param {Complex128Array} WORK - workspace (length `>= (M + nb)*N` complex elements)
* @param {integer} strideWork - stride for `WORK` (in complex elements)
* @param {NonNegativeInteger} offsetWork - starting index for `WORK` (in complex elements)
* @throws {RangeError} `M` must be a nonnegative integer
* @throws {RangeError} `N` must be a nonnegative integer (and `N <= M`)
* @throws {RangeError} `mb` must satisfy `mb > N`
* @throws {RangeError} `nb` must be a positive integer
* @returns {integer} status code (0 = success)
*/
function zungtsqr( M, N, mb, nb, A, strideA1, strideA2, offsetA, T, strideT1, strideT2, offsetT, WORK, strideWork, offsetWork ) {
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 || N > M ) {
		throw new RangeError( format( 'invalid argument. Second argument must satisfy `0 <= N <= M`. Value: `%d`.', N ) );
	}
	if ( mb <= N ) {
		throw new RangeError( format( 'invalid argument. Third argument must satisfy `mb > N`. Value: `%d`.', mb ) );
	}
	if ( nb < 1 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a positive integer. Value: `%d`.', nb ) );
	}
	return base( M, N, mb, nb, A, strideA1, strideA2, offsetA, T, strideT1, strideT2, offsetT, WORK, strideWork, offsetWork );
}


// EXPORTS //

export default zungtsqr;
