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

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes a blocked LQ factorization of a complex triangular-pentagonal matrix `C = [A, B]` using the compact WY representation for `Q`.
*
* @param {NonNegativeInteger} M - number of rows of `B` and the order of `A`
* @param {NonNegativeInteger} N - number of columns of `B`
* @param {NonNegativeInteger} l - number of rows of the lower trapezoidal part of `B` (`0 <= l <= min(M,N)`)
* @param {PositiveInteger} mb - block size (`1 <= mb`; if `M > 0`, also `mb <= M`)
* @param {Complex128Array} A - input/output matrix; on exit contains the lower triangular factor `L`
* @param {integer} strideA1 - stride of the first dimension of `A` (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of `A` (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for `A` (in complex elements)
* @param {Complex128Array} B - input/output pentagonal matrix; on exit contains the Householder reflectors `V`
* @param {integer} strideB1 - stride of the first dimension of `B` (in complex elements)
* @param {integer} strideB2 - stride of the second dimension of `B` (in complex elements)
* @param {NonNegativeInteger} offsetB - starting index for `B` (in complex elements)
* @param {Complex128Array} T - output matrix of upper triangular block reflector factors
* @param {integer} strideT1 - stride of the first dimension of `T` (in complex elements)
* @param {integer} strideT2 - stride of the second dimension of `T` (in complex elements)
* @param {NonNegativeInteger} offsetT - starting index for `T` (in complex elements)
* @param {Complex128Array} WORK - workspace array of length at least `mb*M` complex elements
* @param {integer} strideWork - stride length for `WORK` (in complex elements)
* @param {NonNegativeInteger} offsetWork - starting index for `WORK` (in complex elements)
* @throws {RangeError} first argument must be a nonnegative integer
* @throws {RangeError} second argument must be a nonnegative integer
* @throws {RangeError} third argument must satisfy `0 <= l <= min(M,N)`
* @throws {RangeError} fourth argument must satisfy `1 <= mb` (and `mb <= M` when `M > 0`)
* @returns {integer} status code (`0` = success)
*/
function ztplqt( M, N, l, mb, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, T, strideT1, strideT2, offsetT, WORK, strideWork, offsetWork ) {
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( l < 0 || l > Math.min( M, N ) ) {
		throw new RangeError( format( 'invalid argument. Third argument must satisfy `0 <= l <= min(M,N)`. Value: `%d`.', l ) );
	}
	if ( mb < 1 || ( M > 0 && mb > M ) ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must satisfy `1 <= mb` (and `mb <= M` when `M > 0`). Value: `%d`.', mb ) );
	}
	return base( M, N, l, mb, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, T, strideT1, strideT2, offsetT, WORK, strideWork, offsetWork );
}


// EXPORTS //

export default ztplqt;
