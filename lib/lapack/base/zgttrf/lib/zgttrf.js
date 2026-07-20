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

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes an LU factorization of a complex tridiagonal matrix A using elimination with partial pivoting.
*
* @param {NonNegativeInteger} N - order of the matrix A
* @param {Complex128Array} DL - sub-diagonal elements (length `N-1`); overwritten by the multipliers L
* @param {integer} strideDL - `DL` stride length
* @param {Complex128Array} d - diagonal elements (length `N`); overwritten by the diagonal of U
* @param {integer} strideD - `d` stride length
* @param {Complex128Array} DU - super-diagonal elements (length `N-1`); overwritten by the first super-diagonal of U
* @param {integer} strideDU - `DU` stride length
* @param {Complex128Array} DU2 - second super-diagonal of U (length `N-2`); output
* @param {integer} strideDU2 - `DU2` stride length
* @param {Int32Array} IPIV - pivot indices (length `N`); output
* @param {integer} strideIPIV - `IPIV` stride length
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info status code
*/
function zgttrf( N, DL, strideDL, d, strideD, DU, strideDU, DU2, strideDU2, IPIV, strideIPIV ) {
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	const odl = stride2offset( N, strideDL );
	const od = stride2offset( N, strideD );
	const odu = stride2offset( N, strideDU );
	const odu2 = stride2offset( N, strideDU2 );
	const oipiv = stride2offset( N, strideIPIV );
	return base( N, DL, strideDL, odl, d, strideD, od, DU, strideDU, odu, DU2, strideDU2, odu2, IPIV, strideIPIV, oipiv );
}


// EXPORTS //

export default zgttrf;
