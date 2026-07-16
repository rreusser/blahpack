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
* CABS1: |re(z)| + |im(z)|.
*
* @param {Float64Array} v - Float64 view of complex array
* @param {integer} idx - index of real part
* @throws {TypeError} First argument must be a valid matrix triangle
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {number} CABS1 value
*/
function zpocon( uplo, N, A, strideA1, strideA2, offsetA, anorm, rcond, WORK, strideWork, offsetWork, RWORK, strideRWork, offsetRWork ) { // eslint-disable-line max-len, max-params
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	// Caller owns the workspace; assert the arrays are sufficiently large so an
	// under-sized (or non-array) buffer is a loud RangeError, not a silent NaN
	// from an out-of-bounds read. WORK holds 2*N complex elements, RWORK holds N
	// reals; the N===0 case is a quick return that needs no workspace.
	if ( N > 0 ) {
		if ( !WORK || ( WORK.length - offsetWork ) < ( 2*N ) ) {
			throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', 2*N, offsetWork, ( WORK ) ? WORK.length : 0 ) );
		}
		if ( !RWORK || ( RWORK.length - offsetRWork ) < N ) {
			throw new RangeError( format( 'invalid argument. RWORK array must have at least %d elements from offset %d. Provided length: %d.', N, offsetRWork, ( RWORK ) ? RWORK.length : 0 ) );
		}
	}
	return base( uplo, N, A, strideA1, strideA2, offsetA, anorm, rcond, WORK, strideWork, offsetWork, RWORK, strideRWork, offsetRWork ); // eslint-disable-line max-len
}


// EXPORTS //

export default zpocon;
