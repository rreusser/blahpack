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
* Computes the Cholesky factorization with complete pivoting of a complex Hermitian positive semi-definite matrix (blocked algorithm).
*
* @param {string} uplo - specifies the operation type
* @param {NonNegativeInteger} N - number of columns
* @param {Float64Array} A - input matrix
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Int32Array} PIV - input array
* @param {integer} stridePIV - stride length for `PIV`
* @param {NonNegativeInteger} offsetPIV - starting index for `PIV`
* @param {integer} RANK - RANK
* @param {number} tol - tol
* @param {number} WORK - WORK
* @throws {TypeError} First argument must be a valid matrix triangle
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} status code (0 = success)
*/
function zpstrf( uplo, N, A, strideA1, strideA2, offsetA, PIV, stridePIV, offsetPIV, RANK, tol, WORK ) { // eslint-disable-line max-len, max-params
	var need;
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	// Caller owns the workspace; assert it is a sufficiently large array so an
	// under-sized (or non-array) buffer is a loud RangeError, not a silent NaN.
	// WORK (length 2*N, indexed from 0) is only touched when N > 0.
	if ( N > 0 ) {
		need = 2 * N;
		if ( !WORK || WORK.length < need ) {
			throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements. Provided length: %d.', need, ( WORK ) ? WORK.length : 0 ) ); // eslint-disable-line max-len
		}
	}
	return base( uplo, N, A, strideA1, strideA2, offsetA, PIV, stridePIV, offsetPIV, RANK, tol, WORK ); // eslint-disable-line max-len
}


// EXPORTS //

export default zpstrf;
