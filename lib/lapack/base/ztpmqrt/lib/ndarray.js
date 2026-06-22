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

import isOperationSide from '@stdlib/blas/base/assert/is-operation-side/lib/index.js';
import isTransposeOperation from '@stdlib/blas/base/assert/is-transpose-operation/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Applies a complex unitary matrix `Q` (or its conjugate-transpose) obtained from a triangular-pentagonal compact-WY block reflector — the output of `ztpqrt` — to a stacked matrix `C` formed by two blocks `A` and `B`.
*
* @param {string} side - `'left'` to apply Q from the left, `'right'` from the right
* @param {string} trans - `'no-transpose'` for Q, `'conjugate-transpose'` for Q^H
* @param {NonNegativeInteger} M - number of rows of B
* @param {NonNegativeInteger} N - number of columns of B
* @param {NonNegativeInteger} K - number of elementary reflectors
* @param {NonNegativeInteger} l - order of the trapezoidal part of V (`0 <= L <= K`)
* @param {PositiveInteger} nb - block size used to construct T
* @param {Complex128Array} V - pentagonal reflector matrix produced by `ztpqrt`
* @param {integer} strideV1 - stride of the first dimension of V (in complex elements)
* @param {integer} strideV2 - stride of the second dimension of V (in complex elements)
* @param {NonNegativeInteger} offsetV - starting index for V (in complex elements)
* @param {Complex128Array} T - block triangular factor produced by `ztpqrt`
* @param {integer} strideT1 - stride of the first dimension of T (in complex elements)
* @param {integer} strideT2 - stride of the second dimension of T (in complex elements)
* @param {NonNegativeInteger} offsetT - starting index for T (in complex elements)
* @param {Complex128Array} A - upper (left) or left (right) block of C, modified in-place
* @param {integer} strideA1 - stride of the first dimension of A (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (in complex elements)
* @param {Complex128Array} B - lower (left) or right (right) block of C, modified in-place
* @param {integer} strideB1 - stride of the first dimension of B (in complex elements)
* @param {integer} strideB2 - stride of the second dimension of B (in complex elements)
* @param {NonNegativeInteger} offsetB - starting index for B (in complex elements)
* @param {Complex128Array} WORK - workspace buffer (in complex elements)
* @param {integer} strideWORK - element stride for WORK (in complex elements)
* @param {NonNegativeInteger} offsetWORK - starting index for WORK (in complex elements)
* @throws {TypeError} first argument must be a valid operation side
* @throws {TypeError} second argument must be `no-transpose` or `conjugate-transpose` (the unitary operator forbids plain `transpose`)
* @throws {RangeError} M, N, K must be nonnegative integers
* @throws {RangeError} L must satisfy `0 <= L <= K`
* @throws {RangeError} nb must be a positive integer satisfying `nb <= K` when `K > 0`
* @returns {integer} info status code (0 = success)
*/
function ztpmqrt( side, trans, M, N, K, l, nb, V, strideV1, strideV2, offsetV, T, strideT1, strideT2, offsetT, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, WORK, strideWORK, offsetWORK ) {
	if ( !isOperationSide( side ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid operation side. Value: `%s`.', side ) );
	}
	if ( !isTransposeOperation( trans ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid transpose operation. Value: `%s`.', trans ) );
	}
	if ( trans !== 'no-transpose' && trans !== 'conjugate-transpose' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be `no-transpose` or `conjugate-transpose` for a unitary operator. Value: `%s`.', trans ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( K < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', K ) );
	}
	if ( l < 0 || l > K ) {
		throw new RangeError( format( 'invalid argument. Sixth argument (l) must satisfy 0 <= L <= K. Value: `%d`.', l ) );
	}
	if ( nb < 1 ) {
		throw new RangeError( format( 'invalid argument. Seventh argument (nb) must be a positive integer. Value: `%d`.', nb ) );
	}
	if ( K > 0 && nb > K ) {
		throw new RangeError( format( 'invalid argument. Seventh argument (nb) must satisfy 1 <= nb <= K. Value: `%d`.', nb ) );
	}
	return base( side, trans, M, N, K, l, nb, V, strideV1, strideV2, offsetV, T, strideT1, strideT2, offsetT, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, WORK, strideWORK, offsetWORK );
}


// EXPORTS //

export default ztpmqrt;
