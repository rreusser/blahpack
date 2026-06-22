// MODULES //

import dpttrf from '../../dpttrf/lib/base.js';
import dpttrs from '../../dpttrs/lib/base.js';


// MAIN //

/**
* Solves a real symmetric positive definite tridiagonal system of linear.
* equations A*X = B, where A is an N-by-N symmetric positive definite
* tridiagonal matrix and X and B are N-by-NRHS matrices.
*
* A is factored as A = L_D_L^T, and the factored form of A is then used
* to solve the system of equations.
*
* ## Notes
*
* -   On entry, `d` contains the n diagonal elements of A. On exit, the n diagonal elements of D from L_D_L^T.
* -   On entry, `e` contains the (n-1) subdiagonal elements of A. On exit, the (n-1) subdiagonal elements of the unit bidiagonal factor L.
* -   On entry, `B` contains the N-by-NRHS right hand side matrix. On exit, the solution matrix X.
*
* @private
* @param {NonNegativeInteger} N - order of the matrix A (N >= 0)
* @param {NonNegativeInteger} nrhs - number of right hand sides (columns of B)
* @param {Float64Array} d - diagonal elements (length N)
* @param {integer} strideD - stride length for `d`
* @param {NonNegativeInteger} offsetD - starting index for `d`
* @param {Float64Array} e - subdiagonal elements (length N-1)
* @param {integer} strideE - stride length for `e`
* @param {NonNegativeInteger} offsetE - starting index for `e`
* @param {Float64Array} B - right hand side matrix (N x NRHS), overwritten with solution X
* @param {integer} strideB1 - stride of the first dimension of `B`
* @param {integer} strideB2 - stride of the second dimension of `B`
* @param {NonNegativeInteger} offsetB - starting index for `B`
* @returns {integer} status code (0 = success, >0 = not positive definite)
*/
function dptsv( N, nrhs, d, strideD, offsetD, e, strideE, offsetE, B, strideB1, strideB2, offsetB ) { // eslint-disable-line max-len, max-params
	var info;

	// Quick return if possible:
	if ( N === 0 || nrhs === 0 ) {
		return 0;
	}

	// Compute the L*D*L^T factorization of A:
	info = dpttrf( N, d, strideD, offsetD, e, strideE, offsetE );
	if ( info === 0 ) {
		// Solve the system A*X = B, overwriting B with X:
		dpttrs( N, nrhs, d, strideD, offsetD, e, strideE, offsetE, B, strideB1, strideB2, offsetB );
	}
	return info;
}


// EXPORTS //

export default dptsv;
