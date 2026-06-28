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
* Reduces a real M-by-N matrix A to upper or lower bidiagonal form B.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {NonNegativeInteger} M - number of rows of A
* @param {NonNegativeInteger} N - number of columns of A
* @param {Float64Array} A - input matrix
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Float64Array} d - input array
* @param {integer} strideD - `d` stride length
* @param {Float64Array} e - input array
* @param {integer} strideE - `e` stride length
* @param {Float64Array} TAUQ - input array
* @param {integer} strideTAUQ - `TAUQ` stride length
* @param {Float64Array} TAUP - input array
* @param {integer} strideTAUP - `TAUP` stride length
* @param {Float64Array} WORK - input array
* @param {integer} strideWORK - `WORK` stride length
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info status code
*/
function dgebd2( order, M, N, A, LDA, d, strideD, e, strideE, TAUQ, strideTAUQ, TAUP, strideTAUP, WORK, strideWORK ) {
	var sa1;
	var sa2;
	var od;
	var oe;
	var otq;
	var otp;
	var ow;

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
	od = stride2offset( N, strideD );
	oe = stride2offset( N, strideE );
	otq = stride2offset( N, strideTAUQ );
	otp = stride2offset( N, strideTAUP );
	if ( WORK === null || WORK === void 0 ) {
		var minWork = Math.max( 1, Math.max( M, N ) );
		WORK = new Float64Array( minWork );
		strideWORK = 1;
	}
	ow = stride2offset( N, strideWORK );
	return base( M, N, A, sa1, sa2, 0, d, strideD, od, e, strideE, oe, TAUQ, strideTAUQ, otq, TAUP, strideTAUP, otp, WORK, strideWORK, ow );
}


// EXPORTS //

export default dgebd2;
