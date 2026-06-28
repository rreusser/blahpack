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
* Performs the matrix-matrix multiplication `C = A * B`, where `A` is an `M`-by-`M` real matrix and `B` is an `M`-by-`N` complex matrix.
*
* @param {string} order - storage layout (`'row-major'` or `'column-major'`)
* @param {NonNegativeInteger} M - number of rows of `A` and `C`
* @param {NonNegativeInteger} N - number of columns of `B` and `C`
* @param {Float64Array} A - real `M`-by-`M` input matrix
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Complex128Array} B - complex `M`-by-`N` input matrix
* @param {PositiveInteger} LDB - leading dimension of `B`
* @param {Complex128Array} C - complex `M`-by-`N` output matrix
* @param {PositiveInteger} LDC - leading dimension of `C`
* @param {Float64Array} RWORK - real workspace of length at least `2*M*N`
* @param {integer} strideRWork - stride length for `RWORK`
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} second argument must be a nonnegative integer
* @throws {RangeError} third argument must be a nonnegative integer
* @throws {RangeError} fifth argument must be greater than or equal to `max(1,M)`
* @throws {RangeError} seventh argument must be greater than or equal to `max(1,M)`
* @throws {RangeError} ninth argument must be greater than or equal to `max(1,M)`
* @returns {Complex128Array} `C`
*/
function zlarcm( order, M, N, A, LDA, B, LDB, C, LDC, RWORK, strideRWork ) {
	var sa1;
	var sa2;
	var sb1;
	var sb2;
	var sc1;
	var sc2;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( LDA < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be greater than or equal to max(1,M). Value: `%d`.', LDA ) );
	}
	if ( LDB < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be greater than or equal to max(1,M). Value: `%d`.', LDB ) );
	}
	if ( LDC < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Ninth argument must be greater than or equal to max(1,M). Value: `%d`.', LDC ) );
	}
	if ( order === 'column-major' ) {
		sa1 = 1;
		sa2 = LDA;
		sb1 = 1;
		sb2 = LDB;
		sc1 = 1;
		sc2 = LDC;
	} else {
		sa1 = LDA;
		sa2 = 1;
		sb1 = LDB;
		sb2 = 1;
		sc1 = LDC;
		sc2 = 1;
	}
	base( M, N, A, sa1, sa2, 0, B, sb1, sb2, 0, C, sc1, sc2, 0, RWORK, strideRWork, 0 );
	return C;
}


// EXPORTS //

export default zlarcm;
