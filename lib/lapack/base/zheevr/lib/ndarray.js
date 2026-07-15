/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

// MODULES //

import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';

// MAIN //

/**
* Computes selected eigenvalues and, optionally, eigenvectors of a complex.
* Hermitian matrix A.
*
* Eigenvalues and eigenvectors can be selected by specifying either a range
* of values or a range of indices for the desired eigenvalues.
*
* Algorithm:
* 1. Scale the matrix if the norm is outside safe range
* 2. Reduce to tridiagonal form via zhetrd
* 3. For eigenvalues-only (all eigenvalues): use dsterf
* 4. Otherwise: use dstebz for eigenvalue bisection + zstein for eigenvectors
* 5. Transform eigenvectors back via zunmtr
* 6. Sort eigenvalues and eigenvectors, undo scaling
*
* Note: This implementation does not use ZSTEMR (the MRRR algorithm).
* It always uses the DSTEBZ+ZSTEIN fallback path. For eigenvalues-only
* with all eigenvalues requested, DSTERF is used instead.
*
* M is an output parameter indicating the number of eigenvalues found.
* It is returned via the out object: out.M.
*
* @param {string} jobz - 'no-vectors' or 'compute-vectors'
* @param {string} range - 'all', 'value', or 'index'
* @param {string} uplo - 'upper' or 'lower'
* @param {NonNegativeInteger} N - order of the matrix A
* @param {Complex128Array} A - input/output Hermitian matrix (destroyed on exit)
* @param {integer} strideA1 - stride of the first dimension of A (complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (complex elements)
* @param {number} vl - lower bound of eigenvalue interval (RANGE='value')
* @param {number} vu - upper bound of eigenvalue interval (RANGE='value')
* @param {integer} il - index of smallest eigenvalue to compute (1-based, RANGE='index')
* @param {integer} iu - index of largest eigenvalue to compute (1-based, RANGE='index')
* @param {number} abstol - absolute tolerance for eigenvalues
* @param {Object} out - output object; out.M will be set to number of eigenvalues found
* @param {Float64Array} w - output array for eigenvalues (length N)
* @param {integer} strideW - stride for w
* @param {NonNegativeInteger} offsetW - starting index for w
* @param {Complex128Array} Z - output eigenvector matrix (N x M)
* @param {integer} strideZ1 - stride of first dimension of Z (complex elements)
* @param {integer} strideZ2 - stride of second dimension of Z (complex elements)
* @param {NonNegativeInteger} offsetZ - starting index for Z (complex elements)
* @param {Int32Array} ISUPPZ - support of eigenvectors (length 2*M)
* @param {integer} strideISUPPZ - stride for ISUPPZ
* @param {NonNegativeInteger} offsetISUPPZ - starting index for ISUPPZ
* @param {Complex128Array} WORK - caller-provided complex workspace; requires at least `max(1,2*N)` elements from `offsetWork` (never allocated here)
* @param {integer} strideWork - stride for WORK (complex elements)
* @param {NonNegativeInteger} offsetWork - starting index for WORK (complex elements)
* @param {Float64Array} RWORK - caller-provided real workspace; requires at least `max(1,24*N)` elements from `offsetRWork` (never allocated here)
* @param {integer} strideRWork - stride for RWORK
* @param {NonNegativeInteger} offsetRWork - starting index for RWORK
* @param {Int32Array} IWORK - caller-provided integer workspace; requires at least `max(1,10*N)` elements from `offsetIWork` (never allocated here)
* @param {integer} strideIWork - stride for IWORK
* @param {NonNegativeInteger} offsetIWork - starting index for IWORK
* @throws {TypeError} Third argument must be a valid matrix triangle
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @throws {RangeError} if WORK, RWORK, or IWORK is too small
* @returns {integer} info - 0 if successful, >0 if internal error
*/
function zheevr( jobz, range, uplo, N, A, strideA1, strideA2, offsetA, vl, vu, il, iu, abstol, out, w, strideW, offsetW, Z, strideZ1, strideZ2, offsetZ, ISUPPZ, strideISUPPZ, offsetISUPPZ, WORK, strideWork, offsetWork, RWORK, strideRWork, offsetRWork, IWORK, strideIWork, offsetIWork ) { // eslint-disable-line max-len, max-params
	var minWork;
	var minRWork;
	var minIWork;

	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	// Zero-dimensional quick return MUST precede the workspace-size assertions:
	// an empty matrix requires no workspace.
	if ( N === 0 ) {
		out.M = 0;
		return 0;
	}
	// Caller owns WORK/RWORK/IWORK; assert each is large enough so an under-sized
	// buffer is a loud RangeError, not a silent NaN from an out-of-bounds read.
	minWork = Math.max( 1, 2 * N );
	if ( !WORK || ( WORK.length - offsetWork ) < minWork ) {
		throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', minWork, offsetWork, ( WORK ) ? WORK.length : 0 ) );
	}
	minRWork = Math.max( 1, 24 * N );
	if ( !RWORK || ( RWORK.length - offsetRWork ) < minRWork ) {
		throw new RangeError( format( 'invalid argument. RWORK array must have at least %d elements from offset %d. Provided length: %d.', minRWork, offsetRWork, ( RWORK ) ? RWORK.length : 0 ) );
	}
	minIWork = Math.max( 1, 10 * N );
	if ( !IWORK || ( IWORK.length - offsetIWork ) < minIWork ) {
		throw new RangeError( format( 'invalid argument. IWORK array must have at least %d elements from offset %d. Provided length: %d.', minIWork, offsetIWork, ( IWORK ) ? IWORK.length : 0 ) );
	}

	return base( jobz, range, uplo, N, A, strideA1, strideA2, offsetA, vl, vu, il, iu, abstol, out, w, strideW, offsetW, Z, strideZ1, strideZ2, offsetZ, ISUPPZ, strideISUPPZ, offsetISUPPZ, WORK, strideWork, offsetWork, RWORK, strideRWork, offsetRWork, IWORK, strideIWork, offsetIWork ); // eslint-disable-line max-len
}

// EXPORTS //

export default zheevr;
