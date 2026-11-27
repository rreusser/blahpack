/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable max-len, max-params, camelcase */

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes the modified LU factorization without pivoting of a complex general M-by-N matrix `A` (blocked driver).
*
* @param {NonNegativeInteger} M - number of rows of matrix `A`
* @param {NonNegativeInteger} N - number of columns of matrix `A`
* @param {Complex128Array} A - input/output complex matrix
* @param {integer} strideA1 - stride of the first dimension of `A` (complex elements)
* @param {integer} strideA2 - stride of the second dimension of `A` (complex elements)
* @param {NonNegativeInteger} offsetA - starting index for `A` (complex elements)
* @param {Complex128Array} D - output diagonal sign array (length `min(M,N)`)
* @param {integer} strideD - stride length for `D` (complex elements)
* @param {NonNegativeInteger} offsetD - starting index for `D` (complex elements)
* @throws {RangeError} first argument must be a nonnegative integer
* @throws {RangeError} second argument must be a nonnegative integer
* @returns {integer} status code (0 = success)
*/
function zlaunhr_col_getrfnp( M, N, A, strideA1, strideA2, offsetA, D, strideD, offsetD ) {
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( M === 0 || N === 0 ) {
		return 0;
	}
	return base( M, N, A, strideA1, strideA2, offsetA, D, strideD, offsetD );
}


// EXPORTS //

export default zlaunhr_col_getrfnp;
