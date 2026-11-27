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

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes the L_D_L^T factorization of a real symmetric positive definite tridiagonal matrix A.
*
* @param {NonNegativeInteger} N - the order of the matrix A.
* @param {Float64Array} d - on entry, the n diagonal elements of the tridiagonal matrix A. On exit, the n diagonal elements of the diagonal matrix D from the L*D*L**T factorization of A.
* @param {integer} strideD - stride length for `d`
* @param {Float64Array} e - on entry, the (n-1) subdiagonal elements of the tridiagonal matrix A. On exit, the (n-1) subdiagonal elements of the unit bidiagonal factor L from the L*D*L**T factorization of A.
* @param {integer} strideE - stride length for `e`
* @throws {RangeError} first argument must be a nonnegative integer
* @returns {integer} info status code
*/
function dpttrf( N, d, strideD, e, strideE ) {

	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	const od = stride2offset( N, strideD );
	const oe = stride2offset( N - 1, strideE );
	return base( N, d, strideD, od, e, strideE, oe );
}


// EXPORTS //

export default dpttrf;
