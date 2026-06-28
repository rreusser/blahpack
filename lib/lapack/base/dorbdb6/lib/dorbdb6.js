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
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Orthogonalizes the column vector `X = [X1; X2]` against the columns of `Q = [Q1; Q2]`.
*
* @param {string} order - storage layout (`'row-major'` or `'column-major'`)
* @param {NonNegativeInteger} m1 - dimension of `X1` and rows of `Q1`
* @param {NonNegativeInteger} m2 - dimension of `X2` and rows of `Q2`
* @param {NonNegativeInteger} N - number of columns in `Q1` and `Q2`
* @param {Float64Array} X1 - top part of the vector
* @param {integer} strideX1 - `X1` stride length
* @param {Float64Array} X2 - bottom part of the vector
* @param {integer} strideX2 - `X2` stride length
* @param {Float64Array} Q1 - top part of the orthonormal basis matrix
* @param {PositiveInteger} LDQ1 - leading dimension of `Q1`
* @param {Float64Array} Q2 - bottom part of the orthonormal basis matrix
* @param {PositiveInteger} LDQ2 - leading dimension of `Q2`
* @param {Float64Array} WORK - workspace array (length at least `N`)
* @param {integer} strideWork - `WORK` stride length
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} `m1` must be a nonnegative integer
* @throws {RangeError} `m2` must be a nonnegative integer
* @throws {RangeError} `N` must be a nonnegative integer
* @throws {RangeError} `strideX1` must be nonzero
* @throws {RangeError} `strideX2` must be nonzero
* @throws {RangeError} `LDQ1` must satisfy the leading-dimension constraint
* @throws {RangeError} `LDQ2` must satisfy the leading-dimension constraint
* @returns {integer} `info` (0 = success)
*/
function dorbdb6( order, m1, m2, N, X1, strideX1, X2, strideX2, Q1, LDQ1, Q2, LDQ2, WORK, strideWork ) {
	var sq11;
	var sq12;
	var sq21;
	var sq22;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( m1 < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', m1 ) );
	}
	if ( m2 < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', m2 ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( strideX1 === 0 ) {
		throw new RangeError( format( 'invalid argument. `X1` stride must be nonzero. Value: `%d`.', strideX1 ) );
	}
	if ( strideX2 === 0 ) {
		throw new RangeError( format( 'invalid argument. `X2` stride must be nonzero. Value: `%d`.', strideX2 ) );
	}
	if ( order === 'column-major' ) {
		if ( LDQ1 < max( 1, m1 ) ) {
			throw new RangeError( format( 'invalid argument. `LDQ1` must satisfy LDQ1 >= max(1,m1). Value: `%d`.', LDQ1 ) );
		}
		if ( LDQ2 < max( 1, m2 ) ) {
			throw new RangeError( format( 'invalid argument. `LDQ2` must satisfy LDQ2 >= max(1,m2). Value: `%d`.', LDQ2 ) );
		}
		sq11 = 1;
		sq12 = LDQ1;
		sq21 = 1;
		sq22 = LDQ2;
	} else {
		if ( LDQ1 < max( 1, N ) ) {
			throw new RangeError( format( 'invalid argument. `LDQ1` must satisfy LDQ1 >= max(1,N). Value: `%d`.', LDQ1 ) );
		}
		if ( LDQ2 < max( 1, N ) ) {
			throw new RangeError( format( 'invalid argument. `LDQ2` must satisfy LDQ2 >= max(1,N). Value: `%d`.', LDQ2 ) );
		}
		sq11 = LDQ1;
		sq12 = 1;
		sq21 = LDQ2;
		sq22 = 1;
	}
	if ( WORK === null || WORK === void 0 ) {
		var minWork = N;
		WORK = new Float64Array( minWork );
		strideWork = 1;
	}
	return base( m1, m2, N, X1, strideX1, 0, X2, strideX2, 0, Q1, sq11, sq12, 0, Q2, sq21, sq22, 0, WORK, strideWork, 0 );
}


// EXPORTS //

export default dorbdb6;
