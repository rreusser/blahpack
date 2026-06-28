/**
 * Computes all eigenvalues and, optionally, eigenvectors of a complex Hermitian.
 * matrix A.
 *
 * The eigenvalues are returned in ascending order. If eigenvectors are
 * requested (JOBZ = 'V'), the matrix A is overwritten with the unitary
 * eigenvector matrix.
 *
 * Algorithm:
 * 1. Scale the matrix if the norm is outside safe range
 * 2. Reduce to tridiagonal form via zhetrd
 * 3. If jobz=`'no-vectors'`: compute eigenvalues only (dsterf)
 * If jobz=`'compute-vectors'`: generate Q via zungtr, then eigenvalues+eigenvectors (zsteqr)
 * 4. Undo scaling on eigenvalues if needed
 *
 *
 * @param {string} jobz - `'no-vectors'` or `'compute-vectors'`
 * @param {string} uplo - `'upper'` or `'lower'`
 * @param {NonNegativeInteger} N - order of the matrix A
 * @param {Complex128Array} A - input/output Hermitian matrix; on exit contains eigenvectors if jobz=`'compute-vectors'`
 * @param {integer} strideA1 - stride of the first dimension of A (complex elements)
 * @param {integer} strideA2 - stride of the second dimension of A (complex elements)
 * @param {NonNegativeInteger} offsetA - starting index for A (complex elements)
 * @param {Float64Array} w - output array for eigenvalues (length N), in ascending order
 * @param {integer} strideW - stride for w
 * @param {NonNegativeInteger} offsetW - starting index for w
 * @param {Complex128Array} WORK - complex workspace array
 * @param {integer} strideWork - stride for WORK (complex elements)
 * @param {NonNegativeInteger} offsetWork - starting index for WORK (complex elements)
 * @param {integer} lwork - length of WORK array (in complex elements)
 * @param {Float64Array} RWORK - real workspace array (length >= max(1, 3*N-2))
 * @param {integer} strideRWork - stride for RWORK
 * @param {NonNegativeInteger} offsetRWork - starting index for RWORK
 * @throws {TypeError} Second argument must be a valid matrix triangle
 * @returns {integer} info - 0 if successful, >0 if zsteqr/dsterf did not converge
 */

/* eslint-disable max-len, max-params */

// MODULES //

import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes all eigenvalues and, optionally, eigenvectors of a complex Hermitian.
*
* @param {string} jobz - `'no-vectors'` or `'compute-vectors'`
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the matrix A
* @param {Complex128Array} A - input/output Hermitian matrix; on exit contains eigenvectors if jobz=`'compute-vectors'`
* @param {integer} strideA1 - stride of the first dimension of A (complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (complex elements)
* @param {Float64Array} w - output array for eigenvalues (length N), in ascending order
* @param {integer} strideW - stride for w
* @param {NonNegativeInteger} offsetW - starting index for w
* @param {Complex128Array} WORK - complex workspace array
* @param {integer} strideWork - stride for WORK (complex elements)
* @param {NonNegativeInteger} offsetWork - starting index for WORK (complex elements)
* @param {integer} lwork - length of WORK array (in complex elements)
* @param {Float64Array} RWORK - real workspace array (length >= max(1, 3*N-2))
* @param {integer} strideRWork - stride for RWORK
* @param {NonNegativeInteger} offsetRWork - starting index for RWORK
* @throws {TypeError} first argument must be a valid job type
* @throws {TypeError} second argument must be a valid matrix triangle
* @throws {RangeError} third argument must be a nonnegative integer
* @returns {integer} info - 0 if successful, >0 if zsteqr/dsterf did not converge
*/
function zheev( jobz, uplo, N, A, strideA1, strideA2, offsetA, w, strideW, offsetW, WORK, strideWork, offsetWork, lwork, RWORK, strideRWork, offsetRWork ) {
	if ( jobz !== 'no-vectors' && jobz !== 'compute-vectors' ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid job type. Value: `%s`.', jobz ) );
	}
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( N === 0 ) {
		return 0;
	}
	return base( jobz, uplo, N, A, strideA1, strideA2, offsetA, w, strideW, offsetW, WORK, strideWork, offsetWork, lwork, RWORK, strideRWork, offsetRWork );
}


// EXPORTS //

export default zheev;
