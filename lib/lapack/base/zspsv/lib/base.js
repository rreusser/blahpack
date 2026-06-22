/* eslint-disable max-len, max-params */

// MODULES //

import zsptrf from '../../zsptrf/lib/base.js';
import zsptrs from '../../zsptrs/lib/base.js';


// MAIN //

/**
* Computes the solution to a complex system of linear equations `A * X = B` where A is an N-by-N complex symmetric matrix stored in packed format and X and B are N-by-NRHS matrices.
*
* The diagonal pivoting method is used to factor A as `A = U * D * U^T` if uplo = 'upper', or `A = L * D * L^T` if uplo = 'lower', where U (or L) is a product of permutation and unit upper (lower) triangular matrices, D is symmetric and block diagonal with 1-by-1 and 2-by-2 diagonal blocks. The factored form of A is then used to solve the system of equations `A * X = B`.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the matrix A
* @param {integer} nrhs - number of right-hand side columns
* @param {Complex128Array} AP - packed symmetric matrix, length N*(N+1)/2
* @param {integer} strideAP - stride for AP (in complex elements)
* @param {NonNegativeInteger} offsetAP - starting index for AP (in complex elements)
* @param {Int32Array} IPIV - pivot index output array, length N
* @param {integer} strideIPIV - stride for IPIV
* @param {NonNegativeInteger} offsetIPIV - index offset for IPIV
* @param {Complex128Array} B - input/output right-hand side matrix
* @param {integer} strideB1 - first stride of B (in complex elements)
* @param {integer} strideB2 - second stride of B (in complex elements)
* @param {NonNegativeInteger} offsetB - offset into B (in complex elements)
* @returns {integer} info - 0 if successful, k>0 if D(k,k) is exactly zero (1-based)
*/
function zspsv( uplo, N, nrhs, AP, strideAP, offsetAP, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB ) {
	var info;

	if ( N === 0 || nrhs === 0 ) {
		return 0;
	}

	// Compute the factorization A = U*D*U^T or A = L*D*L^T
	info = zsptrf( uplo, N, AP, strideAP, offsetAP, IPIV, strideIPIV, offsetIPIV );

	if ( info === 0 ) {
		// Solve the system A*X = B using the factorization
		zsptrs( uplo, N, nrhs, AP, strideAP, offsetAP, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB );
	}

	return info;
}


// EXPORTS //

export default zspsv;
