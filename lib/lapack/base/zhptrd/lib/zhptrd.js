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
* Reduces a complex Hermitian matrix in packed form to real symmetric tridiagonal form.
*
* @param {string} uplo - specifies whether the upper ('upper') or lower ('lower') triangular part of A is stored
* @param {NonNegativeInteger} N - order of the matrix A
* @param {Complex128Array} AP - packed Hermitian matrix (complex elements)
* @param {Float64Array} d - output array for diagonal elements (length N)
* @param {Float64Array} e - output array for off-diagonal elements (length N-1)
* @param {Complex128Array} TAU - output array for reflector scalars (length N-1, complex elements)
* @throws {TypeError} first argument must be a valid matrix triangle
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} status code (0 = success)
*/
function zhptrd( uplo, N, AP, d, e, TAU ) {
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( uplo, N, AP, 1, 0, d, 1, 0, e, 1, 0, TAU, 1, 0 );
}


// EXPORTS //

export default zhptrd;
