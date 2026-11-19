/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable max-len, max-params */

// MODULES //

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes selected eigenvalues and, optionally, eigenvectors of a complex Hermitian-definite generalized eigenproblem in packed storage.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {integer} itype - problem type (1, 2, or 3)
* @param {string} jobz - `'no-vectors'` or `'compute-vectors'`
* @param {string} range - `'all'`, `'value'`, or `'index'`
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of matrices A and B
* @param {Complex128Array} AP - packed Hermitian matrix A (length N*(N+1)/2)
* @param {Complex128Array} BP - packed Hermitian positive definite matrix B (length N*(N+1)/2)
* @param {number} vl - lower bound of eigenvalue interval (range='value')
* @param {number} vu - upper bound of eigenvalue interval (range='value')
* @param {integer} il - index of smallest eigenvalue to compute (1-based, range='index')
* @param {integer} iu - index of largest eigenvalue to compute (1-based, range='index')
* @param {number} abstol - absolute tolerance for eigenvalues
* @param {Int32Array} m - output (length-1 array): the total number of eigenvalues found
* @param {Float64Array} w - output array for eigenvalues (length N)
* @param {integer} strideW - stride length for `w`
* @param {Complex128Array} Z - output eigenvector matrix (N x M)
* @param {PositiveInteger} LDZ - leading dimension of Z (in complex elements)
* @param {Complex128Array} WORK - complex workspace (length >= 2*N)
* @param {Float64Array} RWORK - real workspace (length >= 7*N)
* @param {Int32Array} IWORK - integer workspace (length >= 5*N)
* @param {Int32Array} IFAIL - output: indices of non-converged eigenvectors (length N)
* @param {integer} strideIFAIL - stride length for `IFAIL`
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} fifth argument must be a valid matrix triangle
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} status code (0 = success)
*/
function zhpgvx( order, itype, jobz, range, uplo, N, AP, BP, vl, vu, il, iu, abstol, m, w, strideW, Z, LDZ, WORK, RWORK, IWORK, IFAIL, strideIFAIL ) {
	let sz1, sz2;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	const ow = stride2offset( N, strideW );
	const oifail = stride2offset( N, strideIFAIL );
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Fifth argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( LDZ < 1 || ( ( jobz === 'compute-vectors' ) && LDZ < N ) ) {
		throw new RangeError( format( 'invalid argument. Eighteenth argument violates the reference leading-dimension rule (rejected when `LDZ.LT.1 .OR. ( WANTZ .AND. LDZ.LT.N )`). Value: `%d`.', LDZ ) );
	}
	if ( jobz !== 'compute-vectors' ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid `jobz` value. Value: `%s`.', jobz ) );
	}
	if ( order === 'column-major' ) {
		sz1 = 1;
		sz2 = LDZ;
	} else {
		sz1 = LDZ;
		sz2 = 1;
	}
	if ( WORK === null || WORK === void 0 ) {
		const minWork = Math.max( 1, 2 * N );
		WORK = new Complex128Array( minWork );
	}
	if ( RWORK === null || RWORK === void 0 ) {
		const minRwork = Math.max( 1, 7 * N );
		RWORK = new Float64Array( minRwork );
	}
	if ( IWORK === null || IWORK === void 0 ) {
		const minIwork = Math.max( 1, 5 * N );
		IWORK = new Int32Array( minIwork );
	}
	return base( itype, jobz, range, uplo, N, AP, 1, 0, BP, 1, 0, vl, vu, il, iu, abstol, m, w, strideW, ow, Z, sz1, sz2, 0, WORK, 1, 0, RWORK, 1, 0, IWORK, 1, 0, IFAIL, strideIFAIL, oifail ); // eslint-disable-line max-len
}


// EXPORTS //

export default zhpgvx;
