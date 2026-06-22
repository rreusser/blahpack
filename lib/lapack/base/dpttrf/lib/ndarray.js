
// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes the L_D_L^T factorization of a real symmetric positive definite tridiagonal matrix A.
*
* ## Notes
*
* -   On entry, `d` contains the n diagonal elements of the tridiagonal matrix A. On exit, the n diagonal elements of the diagonal matrix D from the L_D_L^T factorization of A.
* -   On entry, `e` contains the (n-1) subdiagonal elements of A. On exit, the (n-1) subdiagonal elements of the unit bidiagonal factor L.
* -   The routine uses a 4-unrolled loop matching the reference LAPACK implementation.
*
* @param {NonNegativeInteger} N - order of the matrix
* @param {Float64Array} d - diagonal elements (length N)
* @param {integer} strideD - stride length for `d`
* @param {NonNegativeInteger} offsetD - starting index for `d`
* @param {Float64Array} e - subdiagonal elements (length N-1)
* @param {integer} strideE - stride length for `e`
* @param {NonNegativeInteger} offsetE - starting index for `e`
* @returns {integer} status code
*/
function dpttrf( N, d, strideD, offsetD, e, strideE, offsetE ) { // eslint-disable-line max-len, max-params
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( N, d, strideD, offsetD, e, strideE, offsetE ); // eslint-disable-line max-len
}


// EXPORTS //

export default dpttrf;
