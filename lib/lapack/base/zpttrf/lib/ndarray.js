

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes the L_D_L^H factorization of a complex Hermitian positive definite tridiagonal matrix.
*
* ## Notes
*
* -   On entry, `d` contains the n diagonal elements of the tridiagonal matrix A. On exit, the n diagonal elements of the diagonal matrix D from the L_D_L^H factorization of A.
* -   On entry, `e` contains the (n-1) subdiagonal elements of A (Complex128Array). On exit, the (n-1) subdiagonal elements of the unit bidiagonal factor L.
* -   The routine uses a 4-unrolled loop matching the reference LAPACK implementation.
* -   D is real (Float64Array). E is complex (Complex128Array) — strides/offsets are in complex elements.
*
* @param {NonNegativeInteger} N - order of the matrix
* @param {Float64Array} d - diagonal elements (length N), real
* @param {integer} strideD - stride length for `d`
* @param {NonNegativeInteger} offsetD - starting index for `d`
* @param {Complex128Array} e - subdiagonal elements (length N-1), complex
* @param {integer} strideE - stride length for `e` (in complex elements)
* @param {NonNegativeInteger} offsetE - starting index for `e` (in complex elements)
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} status code (0 = success, k > 0 = not positive definite at position k)
*/
function zpttrf( N, d, strideD, offsetD, e, strideE, offsetE ) { // eslint-disable-line max-len, max-params
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( N, d, strideD, offsetD, e, strideE, offsetE ); // eslint-disable-line max-len
}


// EXPORTS //

export default zpttrf;
