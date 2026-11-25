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

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Estimates the reciprocal of the condition number of a general complex matrix A.
* in either the 1-norm or the infinity-norm, using the LU factorization
* computed by zgetrf.
*
* An estimate is obtained for norm(inv(A)), and the reciprocal of the
* condition number is computed as RCOND = 1 / ( norm(A) * norm(inv(A)) ).
*
* @param {('one-norm'|'inf-norm')} norm - 'one-norm' for 1-norm, 'inf-norm' for infinity-norm
* @param {NonNegativeInteger} N - order of the matrix A
* @param {Complex128Array} A - LU factorization from zgetrf, N-by-N
* @param {integer} strideA1 - stride of the first dimension of `A` (complex elements)
* @param {integer} strideA2 - stride of the second dimension of `A` (complex elements)
* @param {NonNegativeInteger} offsetA - starting index for `A` (complex elements)
* @param {number} anorm - the 1-norm or infinity-norm of the original matrix
* @param {Float64Array} rcond - out: rcond[0] is the reciprocal condition number
* @param {Complex128Array} WORK - workspace array of length 2*N
* @param {integer} strideWork - stride for `WORK` (complex elements)
* @param {NonNegativeInteger} offsetWork - starting index for `WORK` (complex elements)
* @param {Float64Array} RWORK - workspace array of length 2*N
* @param {integer} strideRWork - stride for `RWORK`
* @param {NonNegativeInteger} offsetRWork - starting index for `RWORK`
* @throws {TypeError} first argument must be one of the following: "inf-norm", "one-norm"
* @throws {RangeError} second argument must be a nonnegative integer
* @throws {RangeError} seventh argument is invalid (rejected when `anorm < 0`)
* @throws {TypeError} if a string argument is not a valid option
* @returns {integer} info - 0 if successful
*/
function zgecon( norm, N, A, strideA1, strideA2, offsetA, anorm, rcond, WORK, strideWork, offsetWork, RWORK, strideRWork, offsetRWork ) { // eslint-disable-line max-len, max-params
	if ( norm !== 'inf-norm' && norm !== 'one-norm' ) {
		throw new TypeError( format( 'invalid argument. First argument must be one of the following: "inf-norm", "one-norm". Value: `%s`.', norm ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( anorm < 0 ) {
		throw new RangeError( format( 'invalid argument. Seventh argument is invalid (rejected when `anorm < 0`). Value: `%s`.', anorm ) );
	}
	// Caller owns the workspaces; assert they are sufficiently large arrays so
	// an under-sized (or non-array) buffer is a loud RangeError, not a silent
	// NaN from an out-of-bounds read. WORK holds 2*N complex elements and RWORK
	// holds 2*N reals (N === 0 is a quick return that references no workspace).
	if ( N > 0 ) {
		if ( !WORK || ( WORK.length - offsetWork ) < ( 2 * N ) ) {
			throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', 2 * N, offsetWork, ( WORK ) ? WORK.length : 0 ) );
		}
		if ( !RWORK || ( RWORK.length - offsetRWork ) < ( 2 * N ) ) {
			throw new RangeError( format( 'invalid argument. RWORK array must have at least %d elements from offset %d. Provided length: %d.', 2 * N, offsetRWork, ( RWORK ) ? RWORK.length : 0 ) );
		}
	}
	if ( strideWork !== 1 ) {
		throw new RangeError( format( 'invalid argument. `strideWork` must be 1 (only contiguous workspace is supported). Value: `%d`.', strideWork ) );
	}
	if ( strideRWork !== 1 ) {
		throw new RangeError( format( 'invalid argument. `strideRWork` must be 1 (only contiguous workspace is supported). Value: `%d`.', strideRWork ) );
	}
	return base( norm, N, A, strideA1, strideA2, offsetA, anorm, rcond, WORK, strideWork, offsetWork, RWORK, strideRWork, offsetRWork ); // eslint-disable-line max-len
}


// EXPORTS //

export default zgecon;
