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
import base from './base.js';


// MAIN //

/**
* Computes a blocked Tall-Skinny QR (TSQR) factorization of a real `M`-by-`N` matrix `A` (with `M >= N`).
*
* @param {NonNegativeInteger} M - number of rows of the matrix `A` (`M >= N`)
* @param {NonNegativeInteger} N - number of columns of the matrix `A`
* @param {PositiveInteger} mb - row block size (`mb >= 1`)
* @param {PositiveInteger} nb - column block size (`1 <= nb <= N` when `N > 0`)
* @param {Float64Array} A - input/output matrix
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Float64Array} T - output matrix of upper triangular block reflector factors
* @param {integer} strideT1 - stride of the first dimension of `T`
* @param {integer} strideT2 - stride of the second dimension of `T`
* @param {NonNegativeInteger} offsetT - starting index for `T`
* @param {Float64Array} WORK - workspace array of length at least `nb*N`
* @param {integer} strideWORK - stride length for `WORK`
* @param {NonNegativeInteger} offsetWORK - starting index for `WORK`
* @throws {RangeError} first argument must be a nonnegative integer
* @throws {RangeError} second argument must be a nonnegative integer with `M >= N`
* @throws {RangeError} third argument must be a positive integer
* @throws {RangeError} fourth argument must satisfy `1 <= nb <= N` when `N > 0`
* @returns {integer} status code (`0` = success)
*/
function dlatsqr( M, N, mb, nb, A, strideA1, strideA2, offsetA, T, strideT1, strideT2, offsetT, WORK, strideWORK, offsetWORK ) {
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 || M < N ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer satisfying `M >= N`. Value: `%d`.', N ) );
	}
	if ( mb < 1 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a positive integer. Value: `%d`.', mb ) );
	}
	if ( nb < 1 || ( nb > N && N > 0 ) ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must satisfy `1 <= nb <= N` when `N > 0`. Value: `%d`.', nb ) );
	}
	return base( M, N, mb, nb, A, strideA1, strideA2, offsetA, T, strideT1, strideT2, offsetT, WORK, strideWORK, offsetWORK );
}


// EXPORTS //

export default dlatsqr;
