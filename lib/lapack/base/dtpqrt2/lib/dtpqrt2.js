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
* Computes a QR factorization of a real triangular-pentagonal matrix `C = [A; B]` using the compact WY representation for `Q`.
*
* @param {string} order - storage layout (`'row-major'` or `'column-major'`)
* @param {NonNegativeInteger} M - number of rows of `B`
* @param {NonNegativeInteger} N - number of columns of `B` and order of `A`
* @param {NonNegativeInteger} l - number of rows of the upper trapezoidal part of `B` (`0 <= l <= min(M,N)`)
* @param {Float64Array} A - input/output `N`-by-`N` upper triangular matrix; on exit contains `R`
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Float64Array} B - input/output `M`-by-`N` pentagonal matrix; on exit contains the reflectors `V`
* @param {PositiveInteger} LDB - leading dimension of `B`
* @param {Float64Array} T - output `N`-by-`N` upper triangular factor `T`
* @param {PositiveInteger} LDT - leading dimension of `T`
* @throws {TypeError} first argument must be a valid layout
* @throws {RangeError} second argument must be a nonnegative integer
* @throws {RangeError} third argument must be a nonnegative integer
* @throws {RangeError} fourth argument must satisfy `0 <= l <= min(M,N)`
* @throws {RangeError} `LDA`, `LDB`, and `LDT` must satisfy the layout-dependent leading-dimension constraints
* @returns {integer} status code (`0` = success)
*/
function dtpqrt2( order, M, N, l, A, LDA, B, LDB, T, LDT ) {
	var sa1;
	var sa2;
	var sb1;
	var sb2;
	var st1;
	var st2;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid layout. Value: `%s`.', order ) );
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

	// A is N-by-N. For row-major: LDA is the row stride and bounds N columns. For column-major: LDA is the column stride and bounds N rows.
	if ( LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be greater than or equal to max(1,N). Value: `%d`.', LDA ) );
	}

	// B is M-by-N. Row-major: LDB bounds N columns. Column-major: LDB bounds M rows.
	if ( order === 'row-major' && LDB < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be greater than or equal to max(1,N). Value: `%d`.', LDB ) );
	}
	if ( order === 'column-major' && LDB < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be greater than or equal to max(1,M). Value: `%d`.', LDB ) );
	}

	// T is N-by-N (same as A).
	if ( LDT < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Tenth argument must be greater than or equal to max(1,N). Value: `%d`.', LDT ) );
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
	return base( M, N, l, A, sa1, sa2, 0, B, sb1, sb2, 0, T, st1, st2, 0 );
}


// EXPORTS //

export default dtpqrt2;
