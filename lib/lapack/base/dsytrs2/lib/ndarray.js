
// MODULES //

import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Solves a system of linear equations A_X = B with a real symmetric matrix A.
_ using the factorization A = U_D_U^T or A = L_D*L^T computed by dsytrf,
* employing BLAS-3 triangular solves (dtrsm) after converting the factorization
* via dsyconv.
*
* ## Algorithm
*
* 1. Convert factorization: dsyconv extracts off-diagonal of D into WORK,
*    zeros them in A, and permutes the triangular factor.
* 2. Apply row permutations to B.
* 3. Triangular solve: L\B or U\B via dtrsm.
* 4. Back-substitute with block diagonal D.
* 5. Second triangular solve: L^T\B or U^T\B via dtrsm.
* 6. Undo row permutations on B.
* 7. Revert factorization: dsyconv restores A to its original form.
*
* ## Notes
*
* -   IPIV uses 0-based convention: `IPIV[k] >= 0` means 1x1 pivot with
*     0-based interchange index; `IPIV[k] < 0` means 2x2 pivot with
*     `~IPIV[k]` giving the 0-based interchange index.
* -   WORK must have length >= N. It is used to communicate off-diagonal
*     elements of D between dsyconv and the back-substitution step.
*
* @param {string} uplo - `'upper'` or `'lower'` (single char)
* @param {NonNegativeInteger} N - order of the matrix A
* @param {NonNegativeInteger} nrhs - number of right-hand side vectors
* @param {Float64Array} A - factored matrix from dsytrf (column-major)
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - starting index for A
* @param {Int32Array} IPIV - pivot indices from dsytrf (0-based)
* @param {integer} strideIPIV - stride for IPIV
* @param {NonNegativeInteger} offsetIPIV - starting index for IPIV
* @param {Float64Array} B - input/output right-hand side / solution matrix
* @param {integer} strideB1 - stride of the first dimension of B
* @param {integer} strideB2 - stride of the second dimension of B
* @param {NonNegativeInteger} offsetB - starting index for B
* @param {Float64Array} WORK - workspace array of length >= N
* @param {integer} strideWORK - stride for WORK
* @param {NonNegativeInteger} offsetWORK - starting index for WORK
* @throws {TypeError} First argument must be a valid matrix triangle
* @returns {integer} info - 0 on success
*/
function dsytrs2( uplo, N, nrhs, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB, WORK, strideWORK, offsetWORK ) { // eslint-disable-line max-len, max-params
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( nrhs < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', nrhs ) );
	}
	return base( uplo, N, nrhs, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB, WORK, strideWORK, offsetWORK ); // eslint-disable-line max-len
}


// EXPORTS //

export default dsytrs2;
