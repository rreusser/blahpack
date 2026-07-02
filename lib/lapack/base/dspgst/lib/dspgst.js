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
* Reduces a real symmetric-definite generalized eigenproblem to standard form, using packed storage.
*
* @param {integer} itype - problem type (1, 2, or 3)
* @param {string} uplo - specifies whether upper or lower triangle is stored ('upper' or 'lower')
* @param {NonNegativeInteger} N - order of matrices A and B
* @param {Float64Array} AP - symmetric matrix A in packed storage
* @param {Float64Array} BP - triangular factor from Cholesky factorization of B in packed storage
* @throws {TypeError} if a string argument is not a valid option
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info - 0 if successful
*/
function dspgst( itype, uplo, N, AP, BP ) {
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( itype, uplo, N, AP, 1, 0, BP, 1, 0 );
}


// EXPORTS //

export default dspgst;
