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

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes an LU factorization of a complex tridiagonal matrix A using.
* elimination with partial pivoting and row interchanges.
*
* The factorization has the form A = L * U where L is a product of
* permutation and unit lower bidiagonal matrices and U is upper triangular
* with nonzeros in only the main diagonal and first two superdiagonals.
*
* ## Notes
*
* -   IPIV values are 0-based (Fortran convention is 1-based).
* -   INFO is returned: 0 = success, k > 0 means U(k,k) is exactly zero (1-based).
* -   All complex array parameters use complex-element strides/offsets.
*
* @param {NonNegativeInteger} N - order of the matrix
* @param {Complex128Array} DL - sub-diagonal elements (length N-1), overwritten with multipliers
* @param {integer} strideDL - stride for `DL` (complex elements)
* @param {NonNegativeInteger} offsetDL - starting index for `DL` (complex elements)
* @param {Complex128Array} d - diagonal elements (length N), overwritten with U diagonal
* @param {integer} strideD - stride for `d` (complex elements)
* @param {NonNegativeInteger} offsetD - starting index for `d` (complex elements)
* @param {Complex128Array} DU - super-diagonal elements (length N-1), overwritten
* @param {integer} strideDU - stride for `DU` (complex elements)
* @param {NonNegativeInteger} offsetDU - starting index for `DU` (complex elements)
* @param {Complex128Array} DU2 - second superdiagonal fill-in (length N-2), output
* @param {integer} strideDU2 - stride for `DU2` (complex elements)
* @param {NonNegativeInteger} offsetDU2 - starting index for `DU2` (complex elements)
* @param {Int32Array} IPIV - pivot indices (length N), output, 0-based
* @param {integer} strideIPIV - stride for `IPIV`
* @param {NonNegativeInteger} offsetIPIV - starting index for `IPIV`
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info - 0 if successful, k > 0 if U(k,k) is zero (1-based)
*/
function zgttrf( N, DL, strideDL, offsetDL, d, strideD, offsetD, DU, strideDU, offsetDU, DU2, strideDU2, offsetDU2, IPIV, strideIPIV, offsetIPIV ) { // eslint-disable-line max-len, max-params
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( N, DL, strideDL, offsetDL, d, strideD, offsetD, DU, strideDU, offsetDU, DU2, strideDU2, offsetDU2, IPIV, strideIPIV, offsetIPIV ); // eslint-disable-line max-len
}


// EXPORTS //

export default zgttrf;
