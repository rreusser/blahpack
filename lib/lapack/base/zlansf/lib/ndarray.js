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

import isTransposeOperation from '@stdlib/blas/base/assert/is-transpose-operation/lib/index.js';
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Returns the value of the one-norm, Frobenius norm, infinity-norm, or the.
* largest absolute value of any element of a complex symmetric matrix stored
* in Rectangular Full Packed (RFP) format.
*
* @param {string} norm - `'max'`, `'one-norm'`, `'inf-norm'`, or `'frobenius'`
* @param {string} transr - specifies the storage format (`'no-transpose'` or `'conjugate-transpose'`)
* @param {string} uplo - specifies whether the upper or lower triangle is stored (`'upper'` or `'lower'`)
* @param {NonNegativeInteger} N - order of the matrix
* @param {Complex128Array} A - RFP array of length N*(N+1)/2
* @param {integer} strideA - stride for `A` (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for `A` (in complex elements)
* @param {Float64Array} WORK - workspace of length N (only for `'one-norm'`/`'inf-norm'` norms)
* @param {integer} strideWork - stride of WORK
* @param {NonNegativeInteger} offsetWork - starting index of WORK
* @throws {TypeError} second argument must be a valid transpose operation
* @throws {TypeError} third argument must be a valid matrix triangle
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {number} the norm value
*/
function zlansf( norm, transr, uplo, N, A, strideA, offsetA, WORK, strideWork, offsetWork ) { // eslint-disable-line max-len, max-params
	if ( !isTransposeOperation( transr ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid transpose operation. Value: `%s`.', transr ) );
	}
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	// Caller owns the workspace; assert it is a sufficiently large array so an
	// under-sized (or non-array) buffer is a loud RangeError, not a silent NaN
	// from an out-of-bounds read. WORK holds N reals and is only referenced for
	// the one-norm/inf-norm cases.
	if ( ( norm === 'one-norm' || norm === 'inf-norm' ) && N > 0 && ( !WORK || ( WORK.length - offsetWork ) < N ) ) {
		throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', N, offsetWork, ( WORK ) ? WORK.length : 0 ) );
	}
	return base( norm, transr, uplo, N, A, strideA, offsetA, WORK, strideWork, offsetWork ); // eslint-disable-line max-len
}


// EXPORTS //

export default zlansf;
