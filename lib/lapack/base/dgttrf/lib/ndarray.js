
// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes an LU factorization of a real tridiagonal matrix A using.
* elimination with partial pivoting and row interchanges.
*
* The factorization has the form A = L * U where L is a product of
* permutation and unit lower bidiagonal matrices and U is upper triangular
* with nonzeros in only the main diagonal and first two superdiagonals.
*
* ## Notes
*
* -   IPIV values are 0-based (Fortran convention is 1-based).
* -   INFO is returned: 0 = success, k > 0 means U(k,k) is exactly zero
*     (1-based index, matching Fortran convention).
*
* @param {NonNegativeInteger} N - order of the matrix
* @param {Float64Array} DL - sub-diagonal elements (length N-1), overwritten with multipliers
* @param {integer} strideDL - stride length for `DL`
* @param {NonNegativeInteger} offsetDL - starting index for `DL`
* @param {Float64Array} d - diagonal elements (length N), overwritten with U diagonal
* @param {integer} strideD - stride length for `d`
* @param {NonNegativeInteger} offsetD - starting index for `d`
* @param {Float64Array} DU - super-diagonal elements (length N-1), overwritten with first superdiagonal of U
* @param {integer} strideDU - stride length for `DU`
* @param {NonNegativeInteger} offsetDU - starting index for `DU`
* @param {Float64Array} DU2 - second superdiagonal fill-in (length N-2), output
* @param {integer} strideDU2 - stride length for `DU2`
* @param {NonNegativeInteger} offsetDU2 - starting index for `DU2`
* @param {Int32Array} IPIV - pivot indices (length N), output, 0-based
* @param {integer} strideIPIV - stride length for `IPIV`
* @param {NonNegativeInteger} offsetIPIV - starting index for `IPIV`
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info - 0 if successful, k > 0 if U(k,k) is zero (1-based)
*/
function dgttrf( N, DL, strideDL, offsetDL, d, strideD, offsetD, DU, strideDU, offsetDU, DU2, strideDU2, offsetDU2, IPIV, strideIPIV, offsetIPIV ) { // eslint-disable-line max-len, max-params
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( N, DL, strideDL, offsetDL, d, strideD, offsetD, DU, strideDU, offsetDU, DU2, strideDU2, offsetDU2, IPIV, strideIPIV, offsetIPIV ); // eslint-disable-line max-len
}


// EXPORTS //

export default dgttrf;
