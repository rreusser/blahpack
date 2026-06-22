

// MODULES //

import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';

// MAIN //

/**
 * Computes selected eigenvalues, and optionally, eigenvectors of a complex
 * generalized Hermitian-definite eigenproblem:
 *   A*x = lambda*B*x  (itype=1)
 *   A*B*x = lambda*x  (itype=2)
 *   B*A*x = lambda*x  (itype=3)
 *
 * Here A and B are assumed to be Hermitian and B is also positive definite.
 * Eigenvalues and eigenvectors can be selected by specifying a range of
 * values or a range of indices for the desired eigenvalues.
 *
 * M is an output parameter indicating the number of eigenvalues found.
 * It is returned via the out object: out.M.
 *
 *
 * @param {integer} itype - problem type (1, 2, or 3)
 * @param {string} jobz - 'compute-vectors' or 'no-vectors'
 * @param {string} range - 'all', 'value', or 'index'
 * @param {string} uplo - 'upper' or 'lower'
 * @param {NonNegativeInteger} N - order of matrices A and B
 * @param {Complex128Array} A - input/output Hermitian matrix; destroyed on exit
 * @param {integer} strideA1 - stride of the first dimension of A (complex elements)
 * @param {integer} strideA2 - stride of the second dimension of A (complex elements)
 * @param {NonNegativeInteger} offsetA - index offset for A (complex elements)
 * @param {Complex128Array} B - Hermitian positive definite matrix; on exit, Cholesky factor
 * @param {integer} strideB1 - stride of the first dimension of B (complex elements)
 * @param {integer} strideB2 - stride of the second dimension of B (complex elements)
 * @param {NonNegativeInteger} offsetB - index offset for B (complex elements)
 * @param {number} vl - lower bound of eigenvalue interval (range='value')
 * @param {number} vu - upper bound of eigenvalue interval (range='value')
 * @param {integer} il - index of smallest eigenvalue to compute (1-based, range='index')
 * @param {integer} iu - index of largest eigenvalue to compute (1-based, range='index')
 * @param {number} abstol - absolute tolerance for eigenvalues
 * @param {Object} out - output object; out.M will be set to number of eigenvalues found
 * @param {Float64Array} w - output array for eigenvalues (length N)
 * @param {integer} strideW - stride for w
 * @param {NonNegativeInteger} offsetW - starting index for w
 * @param {Complex128Array} Z - output eigenvector matrix
 * @param {integer} strideZ1 - stride of first dimension of Z (complex elements)
 * @param {integer} strideZ2 - stride of second dimension of Z (complex elements)
 * @param {NonNegativeInteger} offsetZ - starting index for Z (complex elements)
 * @param {Complex128Array} WORK - complex workspace
 * @param {integer} strideWORK - stride for WORK (complex elements)
 * @param {NonNegativeInteger} offsetWORK - starting index for WORK (complex elements)
 * @param {integer} lwork - length of WORK
 * @param {Float64Array} RWORK - real workspace (length >= 7*N)
 * @param {integer} strideRWORK - stride for RWORK
 * @param {NonNegativeInteger} offsetRWORK - starting index for RWORK
 * @param {Int32Array} IWORK - integer workspace (length >= 5*N)
 * @param {integer} strideIWORK - stride for IWORK
 * @param {NonNegativeInteger} offsetIWORK - starting index for IWORK
 * @param {Int32Array} IFAIL - output: indices of non-converged eigenvectors (length N)
 * @param {integer} strideIFAIL - stride for IFAIL
 * @param {NonNegativeInteger} offsetIFAIL - starting index for IFAIL
 * @throws {TypeError} Fourth argument must be a valid matrix triangle
 * @returns {integer} info - 0 if successful, >0 if failed
 */
function zhegvx( itype, jobz, range, uplo, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, vl, vu, il, iu, abstol, out, w, strideW, offsetW, Z, strideZ1, strideZ2, offsetZ, WORK, strideWORK, offsetWORK, lwork, RWORK, strideRWORK, offsetRWORK, IWORK, strideIWORK, offsetIWORK, IFAIL, strideIFAIL, offsetIFAIL ) { // eslint-disable-line max-len, max-params
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Fourth argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', N ) );
	throw new RangeError( format( 'invalid argument. Nineteenth argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	return base( itype, jobz, range, uplo, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, vl, vu, il, iu, abstol, out, w, strideW, offsetW, Z, strideZ1, strideZ2, offsetZ, WORK, strideWORK, offsetWORK, lwork, RWORK, strideRWORK, offsetRWORK, IWORK, strideIWORK, offsetIWORK, IFAIL, strideIFAIL, offsetIFAIL ); // eslint-disable-line max-len
}

// EXPORTS //

export default zhegvx;
