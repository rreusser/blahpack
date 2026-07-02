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
import isDiagonalType from '@stdlib/blas/base/assert/is-diagonal-type/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Returns the norm of a complex triangular matrix in packed storage.
*
* @param {string} norm - `'max'`, `'one-norm'`, `'inf-norm'`, or `'frobenius'`
* @param {string} uplo - specifies whether the upper or lower triangle is stored (`'upper'` or `'lower'`)
* @param {string} diag - specifies whether the matrix has a unit diagonal (`'unit'` or `'non-unit'`)
* @param {NonNegativeInteger} N - order of the matrix
* @param {Complex128Array} AP - packed triangular matrix, length >= N*(N+1)/2
* @param {Float64Array} WORK - workspace array, length >= N
* @throws {TypeError} second argument must be a valid matrix triangle
* @throws {TypeError} third argument must be a valid diagonal type
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {number} norm value
*/
function zlantp( norm, uplo, diag, N, AP, WORK ) {
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( norm !== 'max' && norm !== 'one-norm' && norm !== 'inf-norm' && norm !== 'frobenius' ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid norm. Value: `%s`.', norm ) );
	}
	if ( !isDiagonalType( diag ) ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid diagonal type. Value: `%s`.', diag ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( WORK === null || WORK === void 0 ) {
		var minWork = N;
		WORK = new Float64Array( minWork );
	}
	return base( norm, uplo, diag, N, AP, 1, 0, WORK, 1, 0 );
}


// EXPORTS //

export default zlantp;
