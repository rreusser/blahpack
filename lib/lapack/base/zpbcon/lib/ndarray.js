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
* Estimates the reciprocal of the condition number of a complex Hermitian.
* positive definite band matrix A using the Cholesky factorization
* A = U^H_U or A = L_L^H computed by zpbtrf.
*
* @param {string} uplo - 'upper' if upper Cholesky factor, 'lower' if lower
* @param {NonNegativeInteger} N - order of the matrix A
* @param {NonNegativeInteger} kd - number of superdiagonals (upper) or subdiagonals (lower)
* @param {Complex128Array} AB - Cholesky factorization from zpbtrf, (KD+1) by N
* @param {integer} strideAB1 - stride of the first dimension of `AB` (complex elements)
* @param {integer} strideAB2 - stride of the second dimension of `AB` (complex elements)
* @param {NonNegativeInteger} offsetAB - starting index for `AB` (complex elements)
* @param {number} anorm - the 1-norm (or infinity-norm) of the original matrix
* @param {Float64Array} rcond - out: rcond[0] is the reciprocal condition number
* @param {Complex128Array} WORK - workspace array of length 2*N
* @param {integer} strideWork - stride for `WORK` (complex elements)
* @param {NonNegativeInteger} offsetWork - starting index for `WORK` (complex elements)
* @param {Float64Array} RWORK - workspace array of length N
* @param {integer} strideRWork - stride for `RWORK`
* @param {NonNegativeInteger} offsetRWork - starting index for `RWORK`
* @throws {TypeError} first argument must be a valid matrix triangle
* @throws {RangeError} second argument must be a nonnegative integer
* @throws {RangeError} third argument must be a nonnegative integer
* @throws {RangeError} eighth argument is invalid (rejected when `anorm < 0`)
* @returns {integer} info - 0 if successful
*/
function zpbcon( uplo, N, kd, AB, strideAB1, strideAB2, offsetAB, anorm, rcond, WORK, strideWork, offsetWork, RWORK, strideRWork, offsetRWork ) { // eslint-disable-line max-len, max-params
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( kd < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', kd ) );
	}
	if ( anorm < 0 ) {
		throw new RangeError( format( 'invalid argument. Eighth argument is invalid (rejected when `anorm < 0`). Value: `%s`.', anorm ) );
	}
	// Caller owns the workspaces; assert they are sufficiently large arrays so
	// an under-sized (or non-array) buffer is a loud RangeError, not a silent
	// NaN from an out-of-bounds read. WORK holds 2*N complex elements and RWORK
	// holds N reals (N === 0 is a quick return that references no workspace).
	if ( N > 0 ) {
		if ( !WORK || ( WORK.length - offsetWork ) < ( 2 * N ) ) {
			throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', 2 * N, offsetWork, ( WORK ) ? WORK.length : 0 ) );
		}
		if ( !RWORK || ( RWORK.length - offsetRWork ) < N ) {
			throw new RangeError( format( 'invalid argument. RWORK array must have at least %d elements from offset %d. Provided length: %d.', N, offsetRWork, ( RWORK ) ? RWORK.length : 0 ) );
		}
	}
	if ( strideWork !== 1 ) {
		throw new RangeError( format( 'invalid argument. `strideWork` must be 1 (only contiguous workspace is supported). Value: `%d`.', strideWork ) );
	}
	if ( strideRWork !== 1 ) {
		throw new RangeError( format( 'invalid argument. `strideRWork` must be 1 (only contiguous workspace is supported). Value: `%d`.', strideRWork ) );
	}
	return base( uplo, N, kd, AB, strideAB1, strideAB2, offsetAB, anorm, rcond, WORK, strideWork, offsetWork, RWORK, strideRWork, offsetRWork ); // eslint-disable-line max-len
}


// EXPORTS //

export default zpbcon;
