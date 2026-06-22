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

// MODULES //

import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Converts the factorization output format used in `dsytrf` to the format used in `dsytrf_rk` and vice versa.
*
* ## Notes
*
* -   `way = 'convert'` maps the `dsytrf` format in `A` into the `dsytrf_rk` format in `(A, E)`.
* -   `way = 'revert'` performs the inverse transformation.
* -   `IPIV` is 0-based. Negative entries encode 2-by-2 pivot blocks via `~IPIV[i]`.
*
* @param {string} uplo - `'upper'` or `'lower'`
* @param {string} way - `'convert'` or `'revert'`
* @param {NonNegativeInteger} N - order of the matrix
* @param {Float64Array} A - input/output matrix
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Float64Array} E - auxiliary array of length `N`
* @param {integer} strideE - stride length for `E`
* @param {NonNegativeInteger} offsetE - starting index for `E`
* @param {Int32Array} IPIV - pivot indices (length `N`)
* @param {integer} strideIPIV - stride length for `IPIV`
* @param {NonNegativeInteger} offsetIPIV - starting index for `IPIV`
* @throws {TypeError} first argument must be a valid matrix triangle
* @throws {TypeError} second argument must be `'convert'` or `'revert'`
* @throws {RangeError} third argument must be a nonnegative integer
* @returns {integer} status code (0 = success)
*/
function dsyconvf( uplo, way, N, A, strideA1, strideA2, offsetA, E, strideE, offsetE, IPIV, strideIPIV, offsetIPIV ) { // eslint-disable-line max-len, max-params
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( way !== 'convert' && way !== 'revert' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be one of `convert` or `revert`. Value: `%s`.', way ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( uplo, way, N, A, strideA1, strideA2, offsetA, E, strideE, offsetE, IPIV, strideIPIV, offsetIPIV ); // eslint-disable-line max-len
}


// EXPORTS //

export default dsyconvf;
