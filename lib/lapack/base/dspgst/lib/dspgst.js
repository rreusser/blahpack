/**
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
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
