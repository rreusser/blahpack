

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Solves a complex Hermitian positive definite tridiagonal system of linear.
* equations A*X = B, where A is an N-by-N Hermitian positive definite
* tridiagonal matrix and X and B are N-by-NRHS matrices.
*
* A is factored as A = L_D_L^H, and the factored form of A is then used
* to solve the system of equations.
*
* ## Notes
*
* -   On entry, `d` contains the n diagonal elements of A (real). On exit, the n diagonal elements of D from L_D_L^H.
* -   On entry, `e` contains the (n-1) subdiagonal elements of A (complex). On exit, the (n-1) subdiagonal elements of the unit bidiagonal factor L.
* -   On entry, `B` contains the N-by-NRHS right hand side matrix (complex). On exit, the solution matrix X.
* -   D is Float64Array (real diagonal). E and B are Complex128Array.
*
* @param {NonNegativeInteger} N - order of the matrix A (N >= 0)
* @param {NonNegativeInteger} nrhs - number of right hand sides (columns of B)
* @param {Float64Array} d - diagonal elements (length N), real
* @param {integer} strideD - stride length for `d`
* @param {NonNegativeInteger} offsetD - starting index for `d`
* @param {Complex128Array} e - subdiagonal elements (length N-1), complex
* @param {integer} strideE - stride length for `e` (in complex elements)
* @param {NonNegativeInteger} offsetE - starting index for `e` (in complex elements)
* @param {Complex128Array} B - right hand side matrix (N x NRHS), overwritten with solution X
* @param {integer} strideB1 - stride of the first dimension of `B` (in complex elements)
* @param {integer} strideB2 - stride of the second dimension of `B` (in complex elements)
* @param {NonNegativeInteger} offsetB - starting index for `B` (in complex elements)
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} status code (0 = success, >0 = not positive definite)
*/
function zptsv( N, nrhs, d, strideD, offsetD, e, strideE, offsetE, B, strideB1, strideB2, offsetB ) { // eslint-disable-line max-len, max-params
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( nrhs < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', nrhs ) );
	}
	return base( N, nrhs, d, strideD, offsetD, e, strideE, offsetE, B, strideB1, strideB2, offsetB ); // eslint-disable-line max-len
}


// EXPORTS //

export default zptsv;
