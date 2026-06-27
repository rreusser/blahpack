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

import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes a blocked LQ factorization of a complex `M`-by-`N` matrix `A` using the compact WY representation of `Q`.
*
* @param {string} order - storage layout (`'row-major'` or `'column-major'`)
* @param {NonNegativeInteger} M - number of rows of the matrix `A`
* @param {NonNegativeInteger} N - number of columns of the matrix `A`
* @param {PositiveInteger} mb - block size
* @param {Complex128Array} A - input/output matrix
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Complex128Array} T - output `mb`-by-min(`M`,`N`) block triangular factor
* @param {PositiveInteger} LDT - leading dimension of `T`
* @param {Complex128Array} WORK - workspace array (length `mb*N` complex elements)
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} second argument must be a nonnegative integer
* @throws {RangeError} third argument must be a nonnegative integer
* @throws {RangeError} fourth argument must be a positive integer not exceeding min(M,N)
* @throws {RangeError} sixth argument must be greater than or equal to max(1,M) (column-major) or max(1,N) (row-major)
* @throws {RangeError} eighth argument must be greater than or equal to mb (column-major) or min(M,N) (row-major)
* @returns {integer} status code (`0` = success)
*/
function zgelqt( order, M, N, mb, A, LDA, T, LDT, WORK ) {
	var sa1;
	var sa2;
	var st1;
	var st2;
	var k;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	k = ( M < N ) ? M : N;
	if ( mb < 1 || ( mb > k && k > 0 ) ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a positive integer not exceeding min(M,N). Value: `%d`.', mb ) );
	}
	if ( order === 'column-major' && LDA < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be greater than or equal to max(1,M). Value: `%d`.', LDA ) );
	}
	if ( order === 'row-major' && LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be greater than or equal to max(1,N). Value: `%d`.', LDA ) );
	}
	if ( order === 'column-major' && LDT < mb ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be greater than or equal to mb. Value: `%d`.', LDT ) );
	}
	if ( order === 'row-major' && LDT < max( 1, k ) ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be greater than or equal to min(M,N). Value: `%d`.', LDT ) );
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

	if ( WORK === null || WORK === void 0 ) {
		var minWork = Math.max( 1, mb * N );
		WORK = new Float64Array( minWork );
	}
	return base( M, N, mb, A, sa1, sa2, 0, T, st1, st2, 0, WORK, 0 );
}


// EXPORTS //

export default zgelqt;
