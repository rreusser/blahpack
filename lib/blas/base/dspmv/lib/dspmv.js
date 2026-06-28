/**
* @license Apache-2.0
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the BLAS 3.12.0 reference implementation (BSD-3-Clause).
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
import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Performs the matrix-vector operation `y = alpha*A*x + beta*y` where `A` is an.
* `N` by `N` symmetric matrix supplied in packed form.
*
* @param {string} order - storage layout
* @param {string} uplo - specifies whether upper or lower triangle is stored
* @param {NonNegativeInteger} N - order of the matrix `A`
* @param {number} alpha - scalar constant
* @param {Float64Array} AP - packed symmetric matrix
* @param {Float64Array} x - input vector
* @param {integer} strideX - `x` stride length
* @param {number} beta - scalar constant
* @param {Float64Array} y - output vector
* @param {integer} strideY - `y` stride length
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {Float64Array} `y`
*/
function dspmv( order, uplo, N, alpha, AP, x, strideX, beta, y, strideY ) {
	var ox;
	var oy;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	ox = stride2offset( N, strideX );
	oy = stride2offset( N, strideY );
	return base( uplo, N, alpha, AP, 1, 0, x, strideX, ox, beta, y, strideY, oy );
}


// EXPORTS //

export default dspmv;
