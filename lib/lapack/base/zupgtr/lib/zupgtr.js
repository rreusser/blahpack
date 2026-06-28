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

/* eslint-disable max-len, max-params */

// MODULES //

import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Generates a complex unitary matrix Q which is defined as the product of.
* N-1 elementary reflectors of order N, as returned by ZHPTRD using
* packed storage.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {string} uplo - specifies whether the upper or lower triangle was used in ZHPTRD ('upper' or 'lower')
* @param {NonNegativeInteger} N - order of the matrix Q
* @param {Complex128Array} AP - packed reflector vectors from ZHPTRD
* @param {Complex128Array} TAU - scalar factors of the reflectors from ZHPTRD (length N-1)
* @param {Complex128Array} Q - output unitary matrix (N x N)
* @param {PositiveInteger} LDQ - leading dimension of `Q`
* @param {Complex128Array} WORK - workspace array (length >= N-1)
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} status code (0 = success)
*/
function zupgtr( order, uplo, N, AP, TAU, Q, LDQ, WORK ) {
	var sq1;
	var sq2;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( LDQ < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be greater than or equal to max(1,N). Value: `%d`.', LDQ ) );
	}
	if ( order === 'column-major' ) {
		sq1 = 1;
		sq2 = LDQ;
	} else {
		sq1 = LDQ;
		sq2 = 1;
	}
	if ( WORK === null || WORK === void 0 ) {
		var minWork = Math.max( 1, N - 1 );
		WORK = new Float64Array( minWork );
	}
	return base( uplo, N, AP, 1, 0, TAU, 1, 0, Q, sq1, sq2, 0, WORK, 1, 0 );
}


// EXPORTS //

export default zupgtr;
