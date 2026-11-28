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
* Computes an LU factorization of a real tridiagonal matrix A using elimination with partial pivoting and row interchanges.
*
* @param {NonNegativeInteger} N - the order of the matrix A.
* @param {Float64Array} DL - on entry, DL must contain the (n-1) sub-diagonal elements of A. On exit, DL is overwritten by the (n-1) multipliers that define the matrix L from the LU factorization of A.
* @param {integer} strideDL - stride length for `DL`
* @param {Float64Array} d - on entry, D must contain the diagonal elements of A. On exit, D is overwritten by the n diagonal elements of the upper triangular matrix U from the LU factorization of A.
* @param {integer} strideD - stride length for `d`
* @param {Float64Array} DU - on entry, DU must contain the (n-1) super-diagonal elements of A. On exit, DU is overwritten by the (n-1) elements of the first super-diagonal of U.
* @param {integer} strideDU - stride length for `DU`
* @param {Float64Array} DU2 - on exit, DU2 is overwritten by the (n-2) elements of the second super-diagonal of U.
* @param {integer} strideDU2 - stride length for `DU2`
* @param {Int32Array} IPIV - the pivot indices; for 1 <= i <= n, row i of the matrix was interchanged with row IPIV(i) (0-based).
* @param {integer} strideIPIV - stride length for `IPIV`
* @throws {RangeError} first argument must be a nonnegative integer
* @returns {integer} info status code
*/
function dgttrf( N, DL, strideDL, d, strideD, DU, strideDU, DU2, strideDU2, IPIV, strideIPIV ) { // eslint-disable-line max-len, max-params

	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	const odl = stride2offset( N - 1, strideDL );
	const od = stride2offset( N, strideD );
	const odu = stride2offset( N - 1, strideDU );
	const odu2 = stride2offset( N - 2, strideDU2 );
	const oipiv = stride2offset( N, strideIPIV );
	return base( N, DL, strideDL, odl, d, strideD, od, DU, strideDU, odu, DU2, strideDU2, odu2, IPIV, strideIPIV, oipiv ); // eslint-disable-line max-len
}


// EXPORTS //

export default dgttrf;
