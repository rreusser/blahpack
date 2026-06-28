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

import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes the solution to a real system of linear equations `A * X = B`.
* where `A` is an N-by-N symmetric positive definite matrix stored in
* packed format and `X` and `B` are N-by-NRHS matrices.
*
* @param {string} uplo - specifies whether the upper or lower triangular part of `A` is stored (`'upper'` or `'lower'`)
* @param {NonNegativeInteger} N - order of matrix `A`
* @param {NonNegativeInteger} nrhs - number of right-hand sides
* @param {Float64Array} AP - input/output packed symmetric matrix; on exit, the Cholesky factor
* @param {integer} strideAP - stride length for `AP`
* @param {NonNegativeInteger} offsetAP - starting index for `AP`
* @param {Float64Array} B - input/output right-hand side matrix
* @param {integer} strideB1 - stride of the first dimension of `B`
* @param {integer} strideB2 - stride of the second dimension of `B`
* @param {NonNegativeInteger} offsetB - starting index for `B`
* @throws {TypeError} first argument must be a valid matrix triangle
* @throws {RangeError} second argument must be a nonnegative integer
* @throws {RangeError} third argument must be a nonnegative integer
* @returns {integer} status code (0 = success)
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
*
* // 2x2 symmetric positive definite packed upper: [ a11, a12, a22 ] = [ 4, 2, 5 ]
* var AP = new Float64Array( [ 4.0, 2.0, 5.0 ] );
* var B = new Float64Array( [ 8.0, 12.0 ] );
*
* var info = dppsv( 'upper', 2, 1, AP, 1, 0, B, 1, 2, 0 );
* // info => 0
*/
function dppsv( uplo, N, nrhs, AP, strideAP, offsetAP, B, strideB1, strideB2, offsetB ) {
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( nrhs < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', nrhs ) );
	}
	return base( uplo, N, nrhs, AP, strideAP, offsetAP, B, strideB1, strideB2, offsetB );
}


// EXPORTS //

export default dppsv;
