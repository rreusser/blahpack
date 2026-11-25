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

import isDiagonalType from '@stdlib/blas/base/assert/is-diagonal-type/lib/index.js';
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Estimates the reciprocal of the condition number of a triangular matrix A.
* in either the 1-norm or the infinity-norm.
*
* The norm of A is computed and an estimate is obtained for norm(inv(A)),
* then the reciprocal of the condition number is computed as:
*   RCOND = 1 / ( norm(A) * norm(inv(A)) )
*
* @param {('one-norm'|'inf-norm')} norm - norm type: 'one-norm' or 'inf-norm'
* @param {MatrixTriangle} uplo - 'upper' or 'lower'
* @param {DiagonalType} diag - 'unit' or 'non-unit'
* @param {NonNegativeInteger} N - order of the matrix
* @param {Float64Array} A - input triangular matrix
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Float64Array} RCOND - output array of length 1; RCOND[0] receives the reciprocal condition number
* @param {Float64Array} WORK - workspace array of length at least 3*N
* @param {integer} strideWork - stride length for `WORK`
* @param {NonNegativeInteger} offsetWork - starting index for `WORK`
* @param {Int32Array} IWORK - integer workspace array of length at least N
* @param {integer} strideIWork - stride length for `IWORK`
* @param {NonNegativeInteger} offsetIWork - starting index for `IWORK`
* @throws {TypeError} first argument must be one of the following: "inf-norm", "one-norm", "one-norm"
* @throws {TypeError} second argument must be a valid matrix triangle
* @throws {TypeError} third argument must be a valid diagonal type
* @throws {RangeError} fourth argument must be a nonnegative integer
* @returns {integer} info - 0 if successful
*/
function dtrcon( norm, uplo, diag, N, A, strideA1, strideA2, offsetA, RCOND, WORK, strideWork, offsetWork, IWORK, strideIWork, offsetIWork ) { // eslint-disable-line max-len, max-params
	if ( norm !== 'inf-norm' && norm !== 'one-norm' && norm !== 'one-norm' ) {
		throw new TypeError( format( 'invalid argument. First argument must be one of the following: "inf-norm", "one-norm", "one-norm". Value: `%s`.', norm ) );
	}
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( !isDiagonalType( diag ) ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid diagonal type. Value: `%s`.', diag ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	// Caller owns the workspace; assert the arrays are sufficiently large so an
	// under-sized (or non-array) buffer is a loud RangeError, not a silent NaN
	// from an out-of-bounds read. WORK holds 3*N reals, IWORK holds N ints; the
	// N===0 case is a quick return that needs no workspace.
	if ( N > 0 ) {
		if ( !WORK || ( WORK.length - offsetWork ) < ( 3*N ) ) {
			throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', 3*N, offsetWork, ( WORK ) ? WORK.length : 0 ) );
		}
		if ( !IWORK || ( IWORK.length - offsetIWork ) < N ) {
			throw new RangeError( format( 'invalid argument. IWORK array must have at least %d elements from offset %d. Provided length: %d.', N, offsetIWork, ( IWORK ) ? IWORK.length : 0 ) );
		}
	}
	if ( strideWork !== 1 ) {
		throw new RangeError( format( 'invalid argument. `strideWork` must be 1 (only contiguous workspace is supported). Value: `%d`.', strideWork ) );
	}
	if ( strideIWork !== 1 ) {
		throw new RangeError( format( 'invalid argument. `strideIWork` must be 1 (only contiguous workspace is supported). Value: `%d`.', strideIWork ) );
	}
	return base( norm, uplo, diag, N, A, strideA1, strideA2, offsetA, RCOND, WORK, strideWork, offsetWork, IWORK, strideIWork, offsetIWork ); // eslint-disable-line max-len
}


// EXPORTS //

export default dtrcon;
