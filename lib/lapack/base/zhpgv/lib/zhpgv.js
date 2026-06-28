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

/* eslint-disable max-len, max-params */

// MODULES //

import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes all eigenvalues and, optionally, eigenvectors of a complex generalized Hermitian-definite eigenproblem in packed storage.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {integer} itype - problem type (1, 2, or 3)
* @param {string} jobz - `'no-vectors'` or `'compute-vectors'`
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of matrices A and B
* @param {Complex128Array} AP - packed Hermitian matrix A (length N*(N+1)/2)
* @param {Complex128Array} BP - packed Hermitian positive definite matrix B (length N*(N+1)/2)
* @param {Float64Array} w - output array for eigenvalues (length N)
* @param {Complex128Array} Z - output eigenvector matrix (N x N)
* @param {PositiveInteger} LDZ - leading dimension of Z
* @param {Complex128Array} WORK - complex workspace array (length >= max(1, 2*N-1))
* @param {Float64Array} RWORK - real workspace array (length >= max(1, 3*N-2))
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} fourth argument must be a valid matrix triangle
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info - 0 if successful
*/
function zhpgv( order, itype, jobz, uplo, N, AP, BP, w, Z, LDZ, WORK, RWORK ) {
	var sz1;
	var sz2;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Fourth argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( LDZ < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Tenth argument must be greater than or equal to max(1,N). Value: `%d`.', LDZ ) );
	}
	if ( jobz !== 'compute-vectors' ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid `jobz` value. Value: `%s`.', jobz ) );
	}
	if ( order === 'column-major' ) {
		sz1 = 1;
		sz2 = LDZ;
	} else {
		sz1 = LDZ;
		sz2 = 1;
	}
	if ( WORK === null || WORK === void 0 ) {
		var minWork = Math.max( 1, Math.max( 1, 2 * N - 1) );
		WORK = new Float64Array( minWork );
	}
	if ( RWORK === null || RWORK === void 0 ) {
		var minRwork = Math.max( 1, Math.max( 1, 3 * N - 2) );
		RWORK = new Float64Array( minRwork );
	}
	return base( itype, jobz, uplo, N, AP, 1, 0, BP, 1, 0, w, 1, 0, Z, sz1, sz2, 0, WORK, 1, 0, RWORK, 1, 0 );
}


// EXPORTS //

export default zhpgv;
