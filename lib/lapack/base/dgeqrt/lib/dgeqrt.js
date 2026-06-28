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
* Computes a blocked QR factorization of a real `M`-by-`N` matrix `A` using the compact `WY` representation of `Q`.
*
* @param {string} order - storage layout (`'row-major'` or `'column-major'`)
* @param {NonNegativeInteger} M - number of rows of the matrix `A`
* @param {NonNegativeInteger} N - number of columns of the matrix `A`
* @param {PositiveInteger} nb - block size
* @param {Float64Array} A - input/output matrix
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Float64Array} T - output matrix (`nb`-by-`min(M,N)`)
* @param {PositiveInteger} LDT - leading dimension of `T`
* @param {Float64Array} WORK - workspace array (length `>= nb*N`)
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} second argument must be a nonnegative integer
* @throws {RangeError} third argument must be a nonnegative integer
* @throws {RangeError} fourth argument must satisfy `1 <= nb <= min(M,N)` when `min(M,N) > 0`
* @throws {RangeError} `LDA` must be valid for the chosen order
* @throws {RangeError} `LDT` must be valid for the chosen order
* @returns {integer} status code (`0` = success)
*/
function dgeqrt( order, M, N, nb, A, LDA, T, LDT, WORK ) { // eslint-disable-line max-params
	var sa1;
	var sa2;
	var st1;
	var st2;
	var K;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	K = ( M < N ) ? M : N;
	if ( nb < 1 || ( nb > K && K > 0 ) ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must satisfy `1 <= nb <= min(M,N)`. Value: `%d`.', nb ) );
	}
	if ( order === 'column-major' ) {
		if ( LDA < max( 1, M ) ) {
			throw new RangeError( format( 'invalid argument. Sixth argument must be greater than or equal to max(1,M). Value: `%d`.', LDA ) );
		}
		if ( LDT < nb ) {
			throw new RangeError( format( 'invalid argument. Eighth argument must be greater than or equal to `nb`. Value: `%d`.', LDT ) );
		}
		sa1 = 1;
		sa2 = LDA;
		st1 = 1;
		st2 = LDT;
	} else {
		if ( LDA < max( 1, N ) ) {
			throw new RangeError( format( 'invalid argument. Sixth argument must be greater than or equal to max(1,N). Value: `%d`.', LDA ) );
		}
		if ( LDT < max( 1, K ) ) {
			throw new RangeError( format( 'invalid argument. Eighth argument must be greater than or equal to max(1,min(M,N)). Value: `%d`.', LDT ) );
		}
		sa1 = LDA;
		sa2 = 1;
		st1 = LDT;
		st2 = 1;
	}
	if ( WORK === null || WORK === void 0 ) {
		var minWork = nb * N;
		WORK = new Float64Array( minWork );
	}
	return base( M, N, nb, A, sa1, sa2, 0, T, st1, st2, 0, WORK, 1, 0 );
}


// EXPORTS //

export default dgeqrt;
