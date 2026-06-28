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
* Computes a column-blocked QR factorization of a complex `M`-by-`N` matrix `A` using TSQR followed by Householder reconstruction.
*
* @param {NonNegativeInteger} M - number of rows of the matrix `A` (`M >= N`)
* @param {NonNegativeInteger} N - number of columns of the matrix `A`
* @param {PositiveInteger} mb1 - row block size for the internal TSQR (`mb1 > N`)
* @param {PositiveInteger} nb1 - column block size for the internal TSQR (`nb1 >= 1`)
* @param {PositiveInteger} nb2 - block size for the output blocked QR (`nb2 >= 1`)
* @param {Complex128Array} A - input/output matrix
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Complex128Array} T - output upper-triangular block reflector factors
* @param {integer} strideT1 - stride of the first dimension of `T`
* @param {integer} strideT2 - stride of the second dimension of `T`
* @param {NonNegativeInteger} offsetT - starting index for `T`
* @throws {RangeError} first argument must be a nonnegative integer
* @throws {RangeError} second argument must satisfy `0 <= N <= M`
* @throws {RangeError} third argument must satisfy `mb1 > N`
* @throws {RangeError} fourth argument must be a positive integer
* @throws {RangeError} fifth argument must be a positive integer
* @returns {integer} status code (`0` = success)
*/
function zgetsqrhrt( M, N, mb1, nb1, nb2, A, strideA1, strideA2, offsetA, T, strideT1, strideT2, offsetT ) {
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 || N > M ) {
		throw new RangeError( format( 'invalid argument. Second argument must satisfy `0 <= N <= M`. Value: `%d`.', N ) );
	}
	if ( mb1 <= N ) {
		throw new RangeError( format( 'invalid argument. Third argument must satisfy `mb1 > N`. Value: `%d`.', mb1 ) );
	}
	if ( nb1 < 1 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a positive integer. Value: `%d`.', nb1 ) );
	}
	if ( nb2 < 1 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a positive integer. Value: `%d`.', nb2 ) );
	}
	return base( M, N, mb1, nb1, nb2, A, strideA1, strideA2, offsetA, T, strideT1, strideT2, offsetT );
}


// EXPORTS //

export default zgetsqrhrt;
