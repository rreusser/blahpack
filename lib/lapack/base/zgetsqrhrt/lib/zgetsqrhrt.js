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

import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes a column-blocked QR factorization of a complex `M`-by-`N` matrix `A` using TSQR followed by Householder reconstruction.
*
* @param {string} order - storage layout (`'row-major'` or `'column-major'`)
* @param {NonNegativeInteger} M - number of rows of the matrix `A` (`M >= N`)
* @param {NonNegativeInteger} N - number of columns of the matrix `A`
* @param {PositiveInteger} mb1 - row block size for the internal TSQR (`mb1 > N`)
* @param {PositiveInteger} nb1 - column block size for the internal TSQR (`nb1 >= 1`)
* @param {PositiveInteger} nb2 - block size for the output blocked QR (`nb2 >= 1`)
* @param {Complex128Array} A - input/output matrix
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Complex128Array} T - output upper-triangular block reflector factors
* @param {PositiveInteger} LDT - leading dimension of `T` (`LDT >= max(1, min(nb2, N))`)
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} second argument must be a nonnegative integer
* @throws {RangeError} third argument must satisfy `0 <= N <= M`
* @throws {RangeError} fourth argument must satisfy `mb1 > N`
* @throws {RangeError} fifth argument must be a positive integer
* @throws {RangeError} sixth argument must be a positive integer
* @throws {RangeError} `LDA` must satisfy the leading-dimension constraint for `order`
* @throws {RangeError} `LDT` must satisfy the leading-dimension constraint
* @returns {integer} status code (`0` = success)
*/
function zgetsqrhrt( order, M, N, mb1, nb1, nb2, A, LDA, T, LDT ) {
	var nb2local;
	var sa1;
	var sa2;
	var st1;
	var st2;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 || N > M ) {
		throw new RangeError( format( 'invalid argument. Third argument must satisfy `0 <= N <= M`. Value: `%d`.', N ) );
	}
	if ( mb1 <= N ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must satisfy `mb1 > N`. Value: `%d`.', mb1 ) );
	}
	if ( nb1 < 1 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a positive integer. Value: `%d`.', nb1 ) );
	}
	if ( nb2 < 1 ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be a positive integer. Value: `%d`.', nb2 ) );
	}
	if ( order === 'row-major' && LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be greater than or equal to max(1,N). Value: `%d`.', LDA ) );
	}
	if ( order === 'column-major' && LDA < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be greater than or equal to max(1,M). Value: `%d`.', LDA ) );
	}
	nb2local = ( nb2 < N ) ? nb2 : N;
	if ( LDT < max( 1, nb2local ) ) {
		throw new RangeError( format( 'invalid argument. Tenth argument must be greater than or equal to max(1, min(nb2,N)). Value: `%d`.', LDT ) );
	}
	if ( order === 'column-major' ) {
		sa1 = 1;
		sa2 = LDA;
		st1 = 1;
		st2 = LDT;
	} else {
		sa1 = LDA;
		sa2 = 1;
		st1 = LDT;
		st2 = 1;
	}
	return base( M, N, mb1, nb1, nb2, A, sa1, sa2, 0, T, st1, st2, 0 );
}


// EXPORTS //

export default zgetsqrhrt;
