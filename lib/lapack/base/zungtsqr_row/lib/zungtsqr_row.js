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

import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Generates an `M`-by-`N` complex matrix `Q` with orthonormal columns from the output of `zlatsqr`.
*
* @param {string} order - storage layout (`'row-major'` or `'column-major'`)
* @param {NonNegativeInteger} M - number of rows of `A` (`M >= 0`)
* @param {NonNegativeInteger} N - number of columns of `A` (`M >= N >= 0`)
* @param {PositiveInteger} mb - row block size used by `zlatsqr` (`mb > N`)
* @param {PositiveInteger} nb - column block size used by `zlatsqr` (`nb >= 1`)
* @param {Complex128Array} A - input/output matrix
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Complex128Array} T - block reflector factors produced by `zlatsqr`
* @param {PositiveInteger} LDT - leading dimension of `T`
* @param {Complex128Array} WORK - workspace
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} second argument must be a nonnegative integer
* @throws {RangeError} third argument must be a nonnegative integer with `M >= N`
* @throws {RangeError} fourth argument must be a positive integer
* @throws {RangeError} fifth argument must satisfy `1 <= nb <= N` when `N > 0`
* @throws {RangeError} `LDA` must be valid for the chosen order
* @throws {RangeError} `LDT` must satisfy `LDT >= max(1, min(nb, N))`
* @returns {integer} status code (`0` = success)
*/
function zungtsqr_row( order, M, N, mb, nb, A, LDA, T, LDT, WORK ) {
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
	if ( N < 0 || M < N ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer satisfying `M >= N`. Value: `%d`.', N ) );
	}
	if ( mb < 1 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a positive integer. Value: `%d`.', mb ) );
	}
	if ( nb < 1 || ( nb > N && N > 0 ) ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must satisfy `1 <= nb <= N` when `N > 0`. Value: `%d`.', nb ) );
	}
	if ( order === 'column-major' ) {
		if ( LDA < max( 1, M ) ) {
			throw new RangeError( format( 'invalid argument. Seventh argument must be greater than or equal to max(1,M). Value: `%d`.', LDA ) );
		}
		sa1 = 1;
		sa2 = LDA;
		st1 = 1;
		st2 = LDT;
	} else {
		if ( LDA < max( 1, N ) ) {
			throw new RangeError( format( 'invalid argument. Seventh argument must be greater than or equal to max(1,N). Value: `%d`.', LDA ) );
		}
		sa1 = LDA;
		sa2 = 1;
		st1 = LDT;
		st2 = 1;
	}
	if ( LDT < max( 1, ( nb < N ) ? nb : N ) ) {
		throw new RangeError( format( 'invalid argument. Ninth argument must be greater than or equal to max(1, min(nb, N)). Value: `%d`.', LDT ) );
	}
	if ( WORK === null || WORK === void 0 ) {
		var minWork = NBLOCAL * Math.max( NBLOCAL;
		WORK = new Float64Array( minWork );
	}
	return base( M, N, mb, nb, A, sa1, sa2, 0, T, st1, st2, 0, WORK, 1, 0 );
}


// EXPORTS //

export default zungtsqr_row;
