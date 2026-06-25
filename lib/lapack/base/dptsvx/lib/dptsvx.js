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
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Solves a real symmetric positive definite tridiagonal system A_X = B, and provides an estimate of the condition number and error bounds on the solution.
*
* @param {string} fact - `'not-factored'` or `'factored'`
* @param {NonNegativeInteger} N - order of the matrix A
* @param {NonNegativeInteger} nrhs - number of right-hand sides
* @param {Float64Array} d - diagonal elements of A (length N)
* @param {Float64Array} e - off-diagonal elements of A (length N-1)
* @param {Float64Array} DF - factored diagonal (length N)
* @param {Float64Array} EF - factored off-diagonal (length N-1)
* @param {Float64Array} B - right-hand side matrix
* @param {PositiveInteger} LDB - leading dimension of B
* @param {Float64Array} X - solution matrix (output)
* @param {PositiveInteger} LDX - leading dimension of X
* @param {Float64Array} rcond - single-element array for reciprocal condition number (output)
* @param {Float64Array} FERR - forward error bounds (length NRHS, output)
* @param {Float64Array} BERR - backward error bounds (length NRHS, output)
* @param {Float64Array} WORK - workspace array (length at least 2*N)
* @returns {integer} info - 0 if successful, k>0 if D(k)<=0, N+1 if rcond < machine epsilon
*/
function dptsvx( fact, N, nrhs, d, e, DF, EF, B, LDB, X, LDX, rcond, FERR, BERR, WORK ) {
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( nrhs < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', nrhs ) );
	}
	if ( LDB < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Ninth argument must be greater than or equal to max(1,N). Value: `%d`.', LDB ) );
	}
	if ( LDX < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Eleventh argument must be greater than or equal to max(1,N). Value: `%d`.', LDX ) );
	}
	if ( fact !== 'not-factored' ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid `fact` value. Value: `%s`.', fact ) );
	}
	if ( WORK === null || WORK === void 0 ) {
		var minWork = Math.max( 1, 2 * N );
		WORK = new Float64Array( minWork );
	}
	return base( fact, N, nrhs, d, 1, 0, e, 1, 0, DF, 1, 0, EF, 1, 0, B, 1, LDB, 0, X, 1, LDX, 0, rcond, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default dptsvx;
