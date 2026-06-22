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

/* eslint-disable max-len, max-params, camelcase */

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Applies a complex Householder block reflector `H^H` from the left to a complex `(K+M)`-by-`N` triangular-pentagonal matrix.
*
* @param {string} ident - `'identity'` or `'not-identity'`
* @param {NonNegativeInteger} M - number of rows of `B`
* @param {NonNegativeInteger} N - number of columns of `A` and `B`
* @param {NonNegativeInteger} K - number of rows of `A` (and order of `T`)
* @param {Complex128Array} T - upper-triangular `K`-by-`K` factor of the block reflector
* @param {integer} strideT1 - stride of the first dimension of `T`
* @param {integer} strideT2 - stride of the second dimension of `T`
* @param {NonNegativeInteger} offsetT - starting index for `T`
* @param {Complex128Array} A - input/output `K`-by-`N` matrix
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Complex128Array} B - input/output `M`-by-`N` matrix
* @param {integer} strideB1 - stride of the first dimension of `B`
* @param {integer} strideB2 - stride of the second dimension of `B`
* @param {NonNegativeInteger} offsetB - starting index for `B`
* @param {Complex128Array} WORK - workspace matrix of dimension `K`-by-max(`K`, `N-K`)
* @param {integer} strideWORK1 - stride of the first dimension of `WORK`
* @param {integer} strideWORK2 - stride of the second dimension of `WORK`
* @param {NonNegativeInteger} offsetWORK - starting index for `WORK`
* @throws {TypeError} first argument must be a valid ident string
* @throws {RangeError} dimension arguments must be non-negative
* @returns {Complex128Array} `A`
*/
function zlarfb_gett( ident, M, N, K, T, strideT1, strideT2, offsetT, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, WORK, strideWORK1, strideWORK2, offsetWORK ) {
	if ( ident !== 'identity' && ident !== 'not-identity' ) {
		throw new TypeError( format( 'invalid argument. First argument must be `\'identity\'` or `\'not-identity\'`. Value: `%s`.', ident ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( K < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', K ) );
	}
	return base( ident, M, N, K, T, strideT1, strideT2, offsetT, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, WORK, strideWORK1, strideWORK2, offsetWORK );
}


// EXPORTS //

export default zlarfb_gett;
