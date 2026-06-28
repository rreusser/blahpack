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
import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes a QR factorization with column pivoting of an M-by-N matrix:.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {NonNegativeInteger} M - number of rows
* @param {NonNegativeInteger} N - number of columns
* @param {Complex128Array} A - input matrix
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Int32Array} JPVT - input array
* @param {integer} strideJPVT - `JPVT` stride length
* @param {Complex128Array} TAU - input array
* @param {integer} strideTAU - `TAU` stride length
* @param {Complex128Array} WORK - input array
* @param {integer} strideWork - `WORK` stride length
* @param {integer} lwork - workspace size in complex elements (unused)
* @param {Float64Array} RWORK - input array
* @param {integer} strideRWork - `RWORK` stride length
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info status code
*/
function zgeqp3( order, M, N, A, LDA, JPVT, strideJPVT, TAU, strideTAU, WORK, strideWork, lwork, RWORK, strideRWork ) {
	var sa1;
	var sa2;
	var oj;
	var ot;
	var ow;
	var or;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( order === 'row-major' && LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be greater than or equal to max(1,N). Value: `%d`.', LDA ) );
	}
	if ( order === 'column-major' && LDA < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be greater than or equal to max(1,M). Value: `%d`.', LDA ) );
	}
	if ( order === 'column-major' ) {
		sa1 = 1;
		sa2 = LDA;
	} else {
		sa1 = LDA;
		sa2 = 1;
	}
	oj = stride2offset( N, strideJPVT );
	ot = stride2offset( N, strideTAU );
	if ( WORK === null || WORK === void 0 ) {
		var minWork = N + 1.0;
		WORK = new Float64Array( minWork );
		strideWork = 1;
	}
	if ( RWORK === null || RWORK === void 0 ) {
		var minRwork = Math.max( 1, 2 * N );
		RWORK = new Float64Array( minRwork );
		strideRWork = 1;
	}
	ow = stride2offset( N, strideWork );
	or = stride2offset( N, strideRWork );
	return base( M, N, A, sa1, sa2, 0, JPVT, strideJPVT, oj, TAU, strideTAU, ot, WORK, strideWork, ow, lwork, RWORK, strideRWork, or );
}


// EXPORTS //

export default zgeqp3;
