/**
* @license Apache-2.0
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
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

import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Estimates the reciprocal condition number of a real symmetric packed matrix.
*
* Uses the factorization A = U_D_U^T or A = L_D_L^T computed by dsptrf.
*
* @param {string} uplo - specifies whether the upper or lower triangular part of A is packed ('upper' or 'lower')
* @param {NonNegativeInteger} N - order of the matrix A
* @param {Float64Array} AP - factored packed matrix from dsptrf, length N*(N+1)/2
* @param {Int32Array} IPIV - pivot indices from dsptrf, length N
* @param {number} anorm - the 1-norm of the original matrix A
* @param {Float64Array} rcond - out: rcond[0] is the reciprocal condition number
* @param {Float64Array} WORK - workspace array of length at least 2*N
* @param {Int32Array} IWORK - workspace array of length at least N
* @throws {TypeError} first argument must be a valid matrix triangle
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info - 0 on success
*/
function dspcon( uplo, N, AP, IPIV, anorm, rcond, WORK, IWORK ) {
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid matrix triangle. Value: `%s`.', uplo ) ); // eslint-disable-line max-len
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( WORK === null || WORK === void 0 ) {
		var minWork = Math.max( 1, 2 * N );
		WORK = new Float64Array( minWork );
	}
	if ( IWORK === null || IWORK === void 0 ) {
		var minIwork = Math.max( 1, N );
		IWORK = new Int32Array( minIwork );
	}
	return base( uplo, N, AP, 1, 0, IPIV, 1, 0, anorm, rcond, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default dspcon;
