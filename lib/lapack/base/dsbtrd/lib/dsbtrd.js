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
import format from '@stdlib/string/format/lib/index.js';
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Reduces a real symmetric band matrix to tridiagonal form by orthogonal similarity transformation.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {string} vect - `'none'`, `'initialize'`, or `'update'`
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the matrix A
* @param {NonNegativeInteger} kd - number of super- (or sub-) diagonals
* @param {Float64Array} AB - band matrix (LDAB x N)
* @param {PositiveInteger} LDAB - leading dimension of `AB`
* @param {Float64Array} d - output array for diagonal elements (length N)
* @param {Float64Array} e - output array for off-diagonal elements (length N-1)
* @param {Float64Array} Q - orthogonal matrix (LDQ x N)
* @param {PositiveInteger} LDQ - leading dimension of `Q`
* @param {Float64Array} WORK - workspace (length N)
* @throws {TypeError} first argument must be a valid order
* @returns {integer} status code (0 = success)
*/
function dsbtrd( order, vect, uplo, N, kd, AB, LDAB, d, e, Q, LDQ, WORK ) {
	var sab1;
	var sab2;
	var sq1;
	var sq2;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( LDAB < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be greater than or equal to max(1,N). Value: `%d`.', LDAB ) );
	}
	if ( LDQ < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Eleventh argument must be greater than or equal to max(1,N). Value: `%d`.', LDQ ) );
	}
	if ( vect !== 'initialize' && vect !== 'update' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid `vect` value. Value: `%s`.', vect ) );
	}
	if ( order === 'column-major' ) {
		sab1 = 1;
		sab2 = LDAB;
		sq1 = 1;
		sq2 = LDQ;
	} else {
		sab1 = LDAB;
		sab2 = 1;
		sq1 = LDQ;
		sq2 = 1;
	}
	if ( WORK === null || WORK === void 0 ) {
		var minWork = Math.max( 1, N );
		WORK = new Float64Array( minWork );
	}
	return base( vect, uplo, N, kd, AB, sab1, sab2, 0, d, 1, 0, e, 1, 0, Q, sq1, sq2, 0, WORK, 1, 0 );
}


// EXPORTS //

export default dsbtrd;
