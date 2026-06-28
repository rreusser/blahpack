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
* Computes a blocked LQ factorization of a complex triangular-pentagonal matrix `C = [A, B]` using the compact WY representation for `Q`.
*
* @param {string} order - storage layout (`'row-major'` or `'column-major'`)
* @param {NonNegativeInteger} M - number of rows of `B` and the order of `A`
* @param {NonNegativeInteger} N - number of columns of `B`
* @param {NonNegativeInteger} l - number of rows of the lower trapezoidal part of `B` (`0 <= l <= min(M,N)`)
* @param {PositiveInteger} mb - block size (`1 <= mb`; if `M > 0`, also `mb <= M`)
* @param {Complex128Array} A - input/output matrix; on exit contains the lower triangular factor `L`
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Complex128Array} B - input/output pentagonal matrix; on exit contains the Householder reflectors `V`
* @param {PositiveInteger} LDB - leading dimension of `B`
* @param {Complex128Array} T - output matrix of block reflector factors
* @param {PositiveInteger} LDT - leading dimension of `T` (`LDT >= mb`)
* @param {Complex128Array} WORK - workspace array of length at least `mb*M` complex elements
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} second argument must be a nonnegative integer
* @throws {RangeError} third argument must be a nonnegative integer
* @throws {RangeError} fourth argument must satisfy `0 <= l <= min(M,N)`
* @throws {RangeError} fifth argument must satisfy `1 <= mb` (and `mb <= M` when `M > 0`)
* @throws {RangeError} leading dimensions must be valid
* @returns {integer} status code (`0` = success)
*/
function ztplqt( order, M, N, l, mb, A, LDA, B, LDB, T, LDT, WORK ) {
	var sa1;
	var sa2;
	var sb1;
	var sb2;
	var st1;
	var st2;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( l < 0 || l > Math.min( M, N ) ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must satisfy `0 <= l <= min(M,N)`. Value: `%d`.', l ) );
	}
	if ( mb < 1 || ( M > 0 && mb > M ) ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must satisfy `1 <= mb` (and `mb <= M` when `M > 0`). Value: `%d`.', mb ) );
	}
	if ( order === 'row-major' && LDA < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be greater than or equal to max(1,M). Value: `%d`.', LDA ) );
	}
	if ( order === 'column-major' && LDA < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be greater than or equal to max(1,M). Value: `%d`.', LDA ) );
	}
	if ( order === 'row-major' && LDB < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Ninth argument must be greater than or equal to max(1,N). Value: `%d`.', LDB ) );
	}
	if ( order === 'column-major' && LDB < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Ninth argument must be greater than or equal to max(1,M). Value: `%d`.', LDB ) );
	}
	if ( LDT < max( 1, mb ) ) {
		throw new RangeError( format( 'invalid argument. Eleventh argument must be greater than or equal to max(1,mb). Value: `%d`.', LDT ) );
	}
	if ( order === 'column-major' ) {
		sa1 = 1;
		sa2 = LDA;
		sb1 = 1;
		sb2 = LDB;
		st1 = 1;
		st2 = LDT;
	} else {
		sa1 = LDA;
		sa2 = 1;
		sb1 = LDB;
		sb2 = 1;
		st1 = LDT;
		st2 = 1;
	}
	if ( WORK === null || WORK === void 0 ) {
		var minWork = Math.max( 1, MB * M );
		WORK = new Float64Array( minWork );
	}
	return base( M, N, l, mb, A, sa1, sa2, 0, B, sb1, sb2, 0, T, st1, st2, 0, WORK, 1, 0 );
}


// EXPORTS //

export default ztplqt;
