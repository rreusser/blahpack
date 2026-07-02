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
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes the inverse of a real symmetric positive definite matrix in packed storage using the Cholesky factorization.
*
* @param {string} uplo - specifies whether the upper or lower triangle is stored
* @param {NonNegativeInteger} N - order of the matrix
* @param {Float64Array} AP - packed triangular matrix
* @throws {TypeError} if a string argument is not a valid option
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info - 0 if successful, k > 0 if the k-th diagonal element of the factor is zero
*/
function dpptri( uplo, N, AP ) {
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( uplo, N, AP, 1, 0 );
}


// EXPORTS //

export default dpptri;
