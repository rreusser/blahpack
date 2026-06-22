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

import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Converts a double-precision triangular matrix `A` to a single-precision triangular matrix `SA`.
*
* @param {string} uplo - specifies whether `A` is upper (`'upper'`) or lower (`'lower'`) triangular
* @param {NonNegativeInteger} N - order of the matrix `A`
* @param {Float64Array} A - input double-precision matrix
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - index offset for `A`
* @param {Float32Array} SA - output single-precision matrix
* @param {integer} strideSA1 - stride of the first dimension of `SA`
* @param {integer} strideSA2 - stride of the second dimension of `SA`
* @param {NonNegativeInteger} offsetSA - index offset for `SA`
* @throws {TypeError} first argument must be a valid matrix triangle
* @throws {RangeError} second argument must be a nonnegative integer
* @returns {integer} status code (0 = success, 1 = overflow)
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
* var Float32Array = require( '@stdlib/array/float32' );
*
* var A = new Float64Array( [ 1.0, 0.0, 2.0, 3.0 ] );
* var SA = new Float32Array( 4 );
*
* var info = dlat2s( 'upper', 2, A, 1, 2, 0, SA, 1, 2, 0 );
* // returns 0
*/
function dlat2s( uplo, N, A, strideA1, strideA2, offsetA, SA, strideSA1, strideSA2, offsetSA ) {
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( N === 0 ) {
		return 0;
	}
	return base( uplo, N, A, strideA1, strideA2, offsetA, SA, strideSA1, strideSA2, offsetSA );
}


// EXPORTS //

export default dlat2s;
