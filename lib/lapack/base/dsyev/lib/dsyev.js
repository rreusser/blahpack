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

import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes all eigenvalues and, optionally, eigenvectors of a real symmetric matrix.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {string} jobz - `'no-vectors'` or `'compute-vectors'`
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the matrix A
* @param {Float64Array} A - input matrix
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Float64Array} w - output eigenvalues
* @param {integer} strideW - `w` stride length
* @param {Float64Array} WORK - workspace
* @param {integer} strideWork - `WORK` stride length
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be a valid `jobz` value
* @throws {TypeError} third argument must be a valid matrix triangle
* @throws {RangeError} fourth argument must be a nonnegative integer
* @throws {RangeError} sixth argument must be greater than or equal to max(1,N)
* @returns {integer} info status code
*/
function dsyev( order, jobz, uplo, N, A, LDA, w, strideW, WORK, strideWork ) {
	var minWork;
	var owork;
	var sa1;
	var sa2;
	var ow;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be greater than or equal to max(1,N). Value: `%d`.', LDA ) );
	}
	if ( jobz !== 'no-vectors' && jobz !== 'compute-vectors' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid `jobz` value. Value: `%s`.', jobz ) );
	}
	if ( order === 'column-major' ) {
		sa1 = 1;
		sa2 = LDA;
	} else {
		sa1 = LDA;
		sa2 = 1;
	}
	ow = stride2offset( N, strideW );
	if ( WORK === null || WORK === void 0 ) {
		minWork = Math.max( 1, ( 3 * N ) - 1 );
		WORK = new Float64Array( minWork );
		strideWork = 1;
	}
	owork = stride2offset( N, strideWork );

	// Caller owns the workspace when provided; assert it is large enough so an
	// under-sized (or non-array) buffer is a loud RangeError, not a silent NaN
	// from an out-of-bounds read. WORK requires at least max( 1, 3*N-1 ) elements.
	if ( N > 0 ) {
		minWork = Math.max( 1, ( 3 * N ) - 1 );
		if ( !WORK || ( WORK.length - owork ) < minWork ) {
			throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', minWork, owork, ( WORK ) ? WORK.length : 0 ) );
		}
	}
	return base( jobz, uplo, N, A, sa1, sa2, 0, w, strideW, ow, WORK, strideWork, owork );
}


// EXPORTS //

export default dsyev;
