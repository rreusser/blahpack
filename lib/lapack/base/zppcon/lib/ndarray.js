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
* Estimates the reciprocal condition number of a complex Hermitian positive definite matrix in packed storage.
*
* @param {string} uplo - specifies the operation type
* @param {NonNegativeInteger} N - number of columns
* @param {Complex128Array} AP - input array
* @param {integer} strideAP - stride length for `AP`
* @param {NonNegativeInteger} offsetAP - starting index for `AP`
* @param {number} anorm - anorm
* @param {Float64Array} rcond - rcond
* @param {Complex128Array} WORK - input array
* @param {integer} strideWork - stride length for `WORK`
* @param {NonNegativeInteger} offsetWork - starting index for `WORK`
* @param {Float64Array} RWORK - output array
* @param {integer} strideRWork - stride length for `RWORK`
* @param {NonNegativeInteger} offsetRWork - starting index for `RWORK`
* @throws {TypeError} first argument must be a valid matrix triangle
* @throws {RangeError} second argument must be a nonnegative integer
* @throws {RangeError} sixth argument is invalid (rejected when `anorm < 0`)
* @returns {integer} status code (0 = success)
*/
function zppcon( uplo, N, AP, strideAP, offsetAP, anorm, rcond, WORK, strideWork, offsetWork, RWORK, strideRWork, offsetRWork ) { // eslint-disable-line max-len, max-params
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( anorm < 0 ) {
		throw new RangeError( format( 'invalid argument. Sixth argument is invalid (rejected when `anorm < 0`). Value: `%s`.', anorm ) );
	}
	// Caller owns the workspace; assert it is a sufficiently large array so an under-sized (or non-array) buffer is a loud RangeError, not a silent NaN. The routine quick-returns for `N === 0` before touching `WORK`, so only guard when work is actually needed.
	if ( N > 0 ) {
		const minWork = 2 * N;
		if ( !WORK || ( WORK.length - offsetWork ) < minWork ) {
			throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', minWork, offsetWork, ( WORK ) ? WORK.length : 0 ) );
		}
	}
	if ( strideWork !== 1 ) {
		throw new RangeError( format( 'invalid argument. `strideWork` must be 1 (only contiguous workspace is supported). Value: `%d`.', strideWork ) );
	}
	if ( strideRWork !== 1 ) {
		throw new RangeError( format( 'invalid argument. `strideRWork` must be 1 (only contiguous workspace is supported). Value: `%d`.', strideRWork ) );
	}
	return base( uplo, N, AP, strideAP, offsetAP, anorm, rcond, WORK, strideWork, offsetWork, RWORK, strideRWork, offsetRWork ); // eslint-disable-line max-len
}


// EXPORTS //

export default zppcon;
