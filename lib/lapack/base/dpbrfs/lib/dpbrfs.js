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

import format from '@stdlib/string/format/lib/index.js';
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Improves the computed solution to a system `A * X = B` where `A` is symmetric positive definite band, and provides error bounds.
*
* @param {string} uplo - specifies whether 'upper' or 'lower' triangle is stored
* @param {NonNegativeInteger} N - order of matrix A
* @param {NonNegativeInteger} kd - number of superdiagonals (or subdiagonals) of A
* @param {NonNegativeInteger} nrhs - number of right-hand side columns
* @param {Float64Array} AB - original symmetric band matrix in band storage
* @param {PositiveInteger} LDAB - leading dimension of AB
* @param {Float64Array} AFB - Cholesky-factored band matrix (from dpbtrf)
* @param {PositiveInteger} LDAFB - leading dimension of AFB
* @param {Float64Array} B - right-hand side matrix (column-major)
* @param {PositiveInteger} LDB - leading dimension of B
* @param {Float64Array} X - solution matrix (improved on exit)
* @param {PositiveInteger} LDX - leading dimension of X
* @param {Float64Array} FERR - output forward error bounds (length nrhs)
* @param {Float64Array} BERR - output backward error bounds (length nrhs)
* @param {Float64Array} WORK - workspace array (length >= 3*N)
* @param {Int32Array} IWORK - integer workspace array (length >= N)
* @throws {TypeError} if a string argument is not a valid option
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info - 0 if successful
*/
function dpbrfs( uplo, N, kd, nrhs, AB, LDAB, AFB, LDAFB, B, LDB, X, LDX, FERR, BERR, WORK, IWORK ) {
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( nrhs < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', nrhs ) );
	}
	if ( LDAB < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be greater than or equal to max(1,N). Value: `%d`.', LDAB ) );
	}
	if ( LDAFB < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be greater than or equal to max(1,N). Value: `%d`.', LDAFB ) );
	}
	if ( LDB < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Tenth argument must be greater than or equal to max(1,N). Value: `%d`.', LDB ) );
	}
	if ( LDX < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Twelfth argument must be greater than or equal to max(1,N). Value: `%d`.', LDX ) );
	}
	if ( WORK === null || WORK === void 0 ) {
		var minWork = Math.max( 1, 3 * N );
		WORK = new Float64Array( minWork );
	}
	if ( IWORK === null || IWORK === void 0 ) {
		var minIwork = Math.max( 1, N );
		IWORK = new Int32Array( minIwork );
	}
	return base( uplo, N, kd, nrhs, AB, 1, LDAB, 0, AFB, 1, LDAFB, 0, B, 1, LDB, 0, X, 1, LDX, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default dpbrfs;
