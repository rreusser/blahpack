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
import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Equilibrates a complex symmetric matrix A in packed storage using the scaling factors in the vector S.
*
* @param {string} uplo - specifies whether the upper or lower triangular part of `A` is packed ('upper' or 'lower')
* @param {NonNegativeInteger} N - order of the matrix A
* @param {Complex128Array} AP - packed symmetric matrix, length N*(N+1)/2
* @param {Float64Array} S - scaling factors, length N
* @param {integer} strideS - stride for S
* @param {number} scond - ratio of smallest to largest scaling factor
* @param {number} amax - absolute value of largest matrix element
* @throws {TypeError} first argument must be a valid matrix triangle
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {string} equed - 'none' or 'yes'
*/
function zlaqsp( uplo, N, AP, S, strideS, scond, amax ) {
	var os;

	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	os = stride2offset( N, strideS );
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( uplo, N, AP, 1, 0, S, strideS, os, scond, amax );
}


// EXPORTS //

export default zlaqsp;
