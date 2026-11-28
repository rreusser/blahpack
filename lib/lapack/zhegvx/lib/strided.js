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
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import min from '@stdlib/math/base/special/fast/min/lib/index.js';
import base from './base.js';

// MAIN //

/**
* Computes selected eigenvalues, and optionally, eigenvectors of a complex.
* generalized Hermitian-definite eigenproblem:
*   A_x = lambda_B_x  (itype=1)
_   A_B_x = lambda_x  (itype=2)
*   B_A_x = lambda*x  (itype=3)
*
* Here A and B are assumed to be Hermitian and B is also positive definite.
* Eigenvalues and eigenvectors can be selected by specifying a range of
* values or a range of indices for the desired eigenvalues.
*
* M is an output parameter indicating the number of eigenvalues found.
* It is returned via the out object: out.M.
*
* @param {integer} itype - problem type (1, 2, or 3)
* @param {('no-vectors'|'compute-vectors')} jobz - 'compute-vectors' or 'no-vectors'
* @param {('all'|'value'|'index')} range - 'all', 'value', or 'index'
* @param {MatrixTriangle} uplo - 'upper' or 'lower'
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
* @param {Int32Array} m - output (length-1 array): the total number of eigenvalues found
* @param {Float64Array} w - output array for eigenvalues (length N)
* @param {integer} strideW - stride for w
* @param {NonNegativeInteger} offsetW - starting index for w
* @param {Complex128Array} Z - output eigenvector matrix
* @param {integer} strideZ1 - stride of first dimension of Z (complex elements)
* @param {integer} strideZ2 - stride of second dimension of Z (complex elements)
* @param {NonNegativeInteger} offsetZ - starting index for Z (complex elements)
* @param {Complex128Array} WORK - complex workspace
* @param {integer} strideWork - stride for WORK (complex elements)
* @param {NonNegativeInteger} offsetWork - starting index for WORK (complex elements)
* @param {Float64Array} RWORK - real workspace (length >= 7*N)
* @param {integer} strideRWork - stride for RWORK
* @param {NonNegativeInteger} offsetRWork - starting index for RWORK
* @param {Int32Array} IWORK - integer workspace (length >= 5*N)
* @param {integer} strideIWork - stride for IWORK
* @param {NonNegativeInteger} offsetIWork - starting index for IWORK
* @param {Int32Array} IFAIL - output: indices of non-converged eigenvectors (length N)
* @param {integer} strideIFAIL - stride for IFAIL
* @param {NonNegativeInteger} offsetIFAIL - starting index for IFAIL
* @throws {RangeError} first argument is invalid (rejected when `itype < 1 || itype > 3`)
* @throws {TypeError} second argument must be one of the following: "no-vectors", "compute-vectors"
* @throws {TypeError} third argument must be one of the following: "all", "index", "value"
* @throws {TypeError} fourth argument must be a valid matrix triangle
* @throws {RangeError} fifth argument must be a nonnegative integer
* @throws {RangeError} fifteenth argument is invalid (rejected when `range === "value" && ( N > 0 && vu <= vl )`)
* @throws {RangeError} sixteenth argument is invalid (rejected when `range !== "value" && range === "index" && ( il < 1 || il > max( 1, N ) )`)
* @throws {RangeError} seventeenth argument is invalid (rejected when `range !== "value" && range === "index" && ( iu < min( N, il ) || iu > N )`)
* @throws {RangeError} `RWORK` must have at least `7 * N` elements from `offsetRWork`
* @throws {RangeError} `IWORK` must have at least `5 * N` elements from `offsetIWork`
* @returns {integer} status code (0 = success)
*/
function zhegvx( itype, jobz, range, uplo, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, vl, vu, il, iu, abstol, m, w, strideW, offsetW, Z, strideZ1, strideZ2, offsetZ, WORK, strideWork, offsetWork, RWORK, strideRWork, offsetRWork, IWORK, strideIWork, offsetIWork, IFAIL, strideIFAIL, offsetIFAIL ) { // eslint-disable-line max-len, max-params
	if ( itype < 1 || itype > 3 ) {
		throw new RangeError( format( 'invalid argument. First argument is invalid (rejected when `itype < 1 || itype > 3`). Value: `%d`.', itype ) );
	}
	if ( jobz !== 'no-vectors' && jobz !== 'compute-vectors' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be one of the following: "no-vectors", "compute-vectors". Value: `%s`.', jobz ) );
	}
	if ( range !== 'all' && range !== 'index' && range !== 'value' ) {
		throw new TypeError( format( 'invalid argument. Third argument must be one of the following: "all", "index", "value". Value: `%s`.', range ) );
	}
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Fourth argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( range === 'value' && ( N > 0 && vu <= vl ) ) {
		throw new RangeError( format( 'invalid argument. Fifteenth argument is invalid (rejected when `range === "value" && ( N > 0 && vu <= vl )`). Value: `%s`.', vu ) );
	}
	if ( range !== 'value' && range === 'index' && ( il < 1 || il > max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Sixteenth argument is invalid (rejected when `range !== "value" && range === "index" && ( il < 1 || il > max( 1, N ) )`). Value: `%d`.', il ) );
	}
	if ( range !== 'value' && range === 'index' && ( iu < min( N, il ) || iu > N ) ) {
		throw new RangeError( format( 'invalid argument. Seventeenth argument is invalid (rejected when `range !== "value" && range === "index" && ( iu < min( N, il ) || iu > N )`). Value: `%d`.', iu ) );
	}
	// Caller owns the complex WORK; assert it is large enough (the reference
	// requires `LWORK >= max(1, 2*N)`) so an undersized buffer is a loud
	// RangeError rather than a silent NaN from an out-of-bounds read.
	const need = Math.max( 1, 2 * N );
	if ( !WORK || ( WORK.length - offsetWork ) < need ) {
		throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', need, offsetWork, ( WORK ) ? WORK.length : 0 ) );
	}
	if ( strideWork !== 1 ) {
		throw new RangeError( format( 'invalid argument. `strideWork` must be 1 (only contiguous workspace is supported). Value: `%d`.', strideWork ) );
	}
	if ( strideRWork !== 1 ) {
		throw new RangeError( format( 'invalid argument. `strideRWork` must be 1 (only contiguous workspace is supported). Value: `%d`.', strideRWork ) );
	}
	if ( strideIWork !== 1 ) {
		throw new RangeError( format( 'invalid argument. `strideIWork` must be 1 (only contiguous workspace is supported). Value: `%d`.', strideIWork ) );
	}
	const minRWork = 7 * N;
	if ( !RWORK || ( RWORK.length - offsetRWork ) < minRWork ) {
		throw new RangeError( format( 'invalid argument. RWORK array must have at least %d elements from offset %d. Provided length: %d.', minRWork, offsetRWork, ( RWORK ) ? RWORK.length : 0 ) );
	}
	const minIWork = 5 * N;
	if ( !IWORK || ( IWORK.length - offsetIWork ) < minIWork ) {
		throw new RangeError( format( 'invalid argument. IWORK array must have at least %d elements from offset %d. Provided length: %d.', minIWork, offsetIWork, ( IWORK ) ? IWORK.length : 0 ) );
	}
	return base( itype, jobz, range, uplo, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, vl, vu, il, iu, abstol, m, w, strideW, offsetW, Z, strideZ1, strideZ2, offsetZ, WORK, strideWork, offsetWork, RWORK, strideRWork, offsetRWork, IWORK, strideIWork, offsetIWork, IFAIL, strideIFAIL, offsetIFAIL ); // eslint-disable-line max-len
}

// EXPORTS //

export default zhegvx;
