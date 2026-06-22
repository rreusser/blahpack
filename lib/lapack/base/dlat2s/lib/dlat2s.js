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
* Converts a double-precision triangular matrix `A` to a single-precision triangular matrix `SA`.
*
* @param {string} order - storage layout (`'row-major'` or `'column-major'`)
* @param {string} uplo - specifies whether `A` is upper (`'upper'`) or lower (`'lower'`) triangular
* @param {NonNegativeInteger} N - order of the matrix `A`
* @param {Float64Array} A - input double-precision matrix
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Float32Array} SA - output single-precision matrix
* @param {PositiveInteger} LDSA - leading dimension of `SA`
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be a valid matrix triangle
* @throws {RangeError} third argument must be a nonnegative integer
* @throws {RangeError} fifth argument must be greater than or equal to `max(1,N)`
* @throws {RangeError} seventh argument must be greater than or equal to `max(1,N)`
* @returns {integer} status code (0 = success, 1 = overflow)
*/
function dlat2s( order, uplo, N, A, LDA, SA, LDSA ) {
	var ssa1;
	var ssa2;
	var sa1;
	var sa2;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be greater than or equal to max(1,N). Value: `%d`.', LDA ) );
	}
	if ( LDSA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be greater than or equal to max(1,N). Value: `%d`.', LDSA ) );
	}
	if ( N === 0 ) {
		return 0;
	}
	if ( order === 'column-major' ) {
		sa1 = 1;
		sa2 = LDA;
		ssa1 = 1;
		ssa2 = LDSA;
	} else {
		sa1 = LDA;
		sa2 = 1;
		ssa1 = LDSA;
		ssa2 = 1;
	}
	return base( uplo, N, A, sa1, sa2, 0, SA, ssa1, ssa2, 0 );
}


// EXPORTS //

export default dlat2s;
