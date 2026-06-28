

// MODULES //

import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes the factorization of a complex Hermitian matrix A using the.
* Bunch-Kaufman diagonal pivoting method:
*
*   A = U_D_U^H  or  A = L_D_L^H
*
* where U (or L) is a product of permutation and unit upper (lower)
* triangular matrices, and D is Hermitian and block diagonal with
* 1-by-1 and 2-by-2 diagonal blocks.
*
* NOTE: This is for HERMITIAN matrices. The conjugate transpose is used.
* Diagonal elements of A are real.
*
* IPIV stores 0-based pivot indices. If IPIV[k] >= 0, a 1x1 pivot was used
* and rows/columns k and IPIV[k] were interchanged. If IPIV[k] < 0 (2x2 pivot),
* IPIV[k] = IPIV[k-1] = ~p where p is the 0-based interchange index.
*
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the matrix A
* @param {Complex128Array} A - input/output complex Hermitian matrix
* @param {integer} strideA1 - stride of the first dimension of A (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (in complex elements)
* @param {NonNegativeInteger} offsetA - index offset for A (in complex elements)
* @param {Int32Array} IPIV - pivot index output array, length N
* @param {integer} strideIPIV - stride for IPIV
* @param {NonNegativeInteger} offsetIPIV - index offset for IPIV
* @throws {TypeError} First argument must be a valid matrix triangle
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info - 0 if successful, k>0 if D(k,k) is exactly zero
*/
function zhetf2( uplo, N, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV ) { // eslint-disable-line max-len, max-params
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( uplo, N, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV ); // eslint-disable-line max-len
}


// EXPORTS //

export default zhetf2;
