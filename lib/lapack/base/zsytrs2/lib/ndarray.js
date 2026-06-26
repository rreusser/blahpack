

// MODULES //

import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Solves a system of linear equations A_X = B with a complex symmetric matrix A.
_ using the factorization A = U_D_U^T or A = L_D*L^T computed by zsytrf,
* employing BLAS-3 triangular solves (ztrsm) after converting the factorization
* via zsyconv.
*
* ## Algorithm
*
* 1. Convert factorization: zsyconv extracts off-diagonal of D into WORK,
*    zeros them in A, and permutes the triangular factor.
* 2. Apply row permutations to B.
* 3. Triangular solve: L\B or U\B via ztrsm.
* 4. Back-substitute with block diagonal D.
* 5. Second triangular solve: L^T\B or U^T\B via ztrsm.
* 6. Undo row permutations on B.
* 7. Revert factorization: zsyconv restores A to its original form.
*
* ## Notes
*
* -   IPIV uses 0-based convention: `IPIV[k] >= 0` means 1x1 pivot with
*     0-based interchange index; `IPIV[k] < 0` means 2x2 pivot with
*     `~IPIV[k]` giving the 0-based interchange index.
* -   WORK must have length >= N (Complex128Array). It is used to communicate
*     off-diagonal elements of D between zsyconv and the back-substitution step.
* -   A, B, and WORK are Complex128Array. Strides and offsets are in complex elements.
*
* @param {string} uplo - `'upper'` or `'lower'` (single char)
* @param {NonNegativeInteger} N - order of the matrix A
* @param {NonNegativeInteger} nrhs - number of right-hand side vectors
* @param {Complex128Array} A - factored matrix from zsytrf (column-major)
* @param {integer} strideA1 - stride of the first dimension of A (complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (complex elements)
* @param {Int32Array} IPIV - pivot indices from zsytrf (0-based)
* @param {integer} strideIPIV - stride for IPIV
* @param {NonNegativeInteger} offsetIPIV - starting index for IPIV
* @param {Complex128Array} B - input/output right-hand side / solution matrix
* @param {integer} strideB1 - stride of the first dimension of B (complex elements)
* @param {integer} strideB2 - stride of the second dimension of B (complex elements)
* @param {NonNegativeInteger} offsetB - starting index for B (complex elements)
* @param {Complex128Array} WORK - workspace array of length >= N
* @param {integer} strideWORK - stride for WORK (complex elements)
* @param {NonNegativeInteger} offsetWORK - starting index for WORK (complex elements)
* @throws {TypeError} First argument must be a valid matrix triangle
* @returns {integer} info - 0 on success
*/
function zsytrs2( uplo, N, nrhs, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB, WORK, strideWORK, offsetWORK ) { // eslint-disable-line max-len, max-params
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

export default zsytrs2;
