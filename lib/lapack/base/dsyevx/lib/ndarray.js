
// MODULES //

import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';

// MAIN //

/**
* Computes selected eigenvalues and, optionally, eigenvectors of a real.
* symmetric matrix A.
*
* Eigenvalues and eigenvectors can be selected by specifying a range of values
* (RANGE='value') or a range of indices (RANGE='index') for the desired
* eigenvalues.
*
* Algorithm:
* 1. Scale the matrix if the norm is outside safe range
* 2. Reduce to tridiagonal form via dsytrd
* 3. If computing all eigenvalues with abstol <= 0:
*    - JOBZ='no-vectors': dsterf for eigenvalues only
*    - JOBZ='compute-vectors': dorgtr + dsteqr for eigenvalues+eigenvectors
* 4. Otherwise (selective):
*    - dstebz for selected eigenvalues by bisection
*    - dstein for eigenvectors by inverse iteration (if JOBZ='compute-vectors')
*    - dormtr to transform back to original space
* 5. Sort eigenvalues and eigenvectors, undo scaling
*
* M is an output parameter indicating the number of eigenvalues found.
* It is returned via the out object: out.M.
*
* @param {string} jobz - 'no-vectors' or 'compute-vectors'
* @param {string} range - 'all', 'value', or 'index'
* @param {string} uplo - 'upper' or 'lower'
* @param {NonNegativeInteger} N - order of the matrix A
* @param {Float64Array} A - input/output symmetric matrix
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - starting index for A
* @param {number} vl - lower bound of eigenvalue interval (RANGE='value')
* @param {number} vu - upper bound of eigenvalue interval (RANGE='value')
* @param {integer} il - index of smallest eigenvalue to compute (1-based, RANGE='index')
* @param {integer} iu - index of largest eigenvalue to compute (1-based, RANGE='index')
* @param {number} abstol - absolute tolerance for eigenvalues
* @param {Object} out - output object; out.M will be set to number of eigenvalues found
* @param {Float64Array} w - output array for eigenvalues (length N)
* @param {integer} strideW - stride for w
* @param {NonNegativeInteger} offsetW - starting index for w
* @param {Float64Array} Z - output eigenvector matrix (N x N)
* @param {integer} strideZ1 - stride of first dimension of Z
* @param {integer} strideZ2 - stride of second dimension of Z
* @param {NonNegativeInteger} offsetZ - starting index for Z
* @param {Float64Array} WORK - workspace (length >= 8*N)
* @param {integer} strideWORK - stride for WORK
* @param {NonNegativeInteger} offsetWORK - starting index for WORK
* @param {integer} lwork - length of WORK
* @param {Int32Array} IWORK - integer workspace (length >= 5*N)
* @param {integer} strideIWORK - stride for IWORK
* @param {NonNegativeInteger} offsetIWORK - starting index for IWORK
* @param {Int32Array} IFAIL - output: indices of non-converged eigenvectors (length N)
* @param {integer} strideIFAIL - stride for IFAIL
* @param {NonNegativeInteger} offsetIFAIL - starting index for IFAIL
* @throws {TypeError} Third argument must be a valid matrix triangle
* @returns {integer} info - 0 if successful, >0 if eigenvectors failed to converge
*/
function dsyevx( jobz, range, uplo, N, A, strideA1, strideA2, offsetA, vl, vu, il, iu, abstol, out, w, strideW, offsetW, Z, strideZ1, strideZ2, offsetZ, WORK, strideWORK, offsetWORK, lwork, IWORK, strideIWORK, offsetIWORK, IFAIL, strideIFAIL, offsetIFAIL ) { // eslint-disable-line max-len, max-params
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	throw new RangeError( format( 'invalid argument. Fourteenth argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	return base( jobz, range, uplo, N, A, strideA1, strideA2, offsetA, vl, vu, il, iu, abstol, out, w, strideW, offsetW, Z, strideZ1, strideZ2, offsetZ, WORK, strideWORK, offsetWORK, lwork, IWORK, strideIWORK, offsetIWORK, IFAIL, strideIFAIL, offsetIFAIL ); // eslint-disable-line max-len
}

// EXPORTS //

export default dsyevx;
