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

import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Returns the value of the one-norm, Frobenius norm, infinity-norm, or the.
* largest absolute value of any element of a complex Hermitian matrix stored
* in Rectangular Full Packed (RFP) format.
*
* @param {string} norm - `'max'`, `'one-norm'`, `'inf-norm'`, or `'frobenius'`
* @param {string} transr - `'no-transpose'` or `'conjugate-transpose'`
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the matrix
* @param {Complex128Array} A - RFP array
* @param {integer} strideA - stride for A (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (in complex elements)
* @param {Float64Array} WORK - workspace array
* @param {integer} strideWork - stride for WORK
* @param {NonNegativeInteger} offsetWork - starting index for WORK
* @throws {TypeError} first argument must be a valid norm type
* @throws {TypeError} third argument must be a valid matrix triangle
* @throws {RangeError} fourth argument must be a nonnegative integer
* @returns {number} norm value
*/
function zlanhf( norm, transr, uplo, N, A, strideA, offsetA, WORK, strideWork, offsetWork ) {
	var need;
	if ( norm !== 'one-norm' && norm !== 'inf-norm' && norm !== 'max' && norm !== 'frobenius' ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid norm type. Value: `%s`.', norm ) );
	}
	if ( transr !== 'no-transpose' && transr !== 'conjugate-transpose' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid transpose operation. Value: `%s`.', transr ) );
	}
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( N === 0 ) {
		return 0.0;
	}
	// Caller owns the workspace; assert it is a sufficiently large array so an
	// under-sized (or non-array) buffer is a loud RangeError, not a silent NaN.
	// Only the one-norm/inf-norm paths use WORK (length >= N); other norms use none.
	if ( ( norm === 'one-norm' || norm === 'inf-norm' ) && N > 0 ) {
		need = N;
		if ( !WORK || ( WORK.length - offsetWork ) < need ) {
			throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', need, offsetWork, ( WORK ) ? WORK.length : 0 ) ); // eslint-disable-line max-len
		}
	}
	return base( norm, transr, uplo, N, A, strideA, offsetA, WORK, strideWork, offsetWork );
}


// EXPORTS //

export default zlanhf;
