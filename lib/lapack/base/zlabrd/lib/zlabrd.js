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
* Reduces the first NB rows and columns of a complex general M-by-N matrix A.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {NonNegativeInteger} M - number of rows
* @param {NonNegativeInteger} N - number of columns
* @param {integer} nb - number of leading rows and columns to reduce
* @param {Complex128Array} A - input matrix
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Float64Array} d - input array
* @param {integer} strideD - `d` stride length
* @param {Float64Array} e - input array
* @param {integer} strideE - `e` stride length
* @param {Complex128Array} TAUQ - input array
* @param {integer} strideTAUQ - `TAUQ` stride length
* @param {Complex128Array} TAUP - input array
* @param {integer} strideTAUP - `TAUP` stride length
* @param {Complex128Array} X - input matrix
* @param {PositiveInteger} LDX - leading dimension of `X`
* @param {Complex128Array} Y - input matrix
* @param {PositiveInteger} LDY - leading dimension of `Y`
* @throws {TypeError} first argument must be a valid order
*/
function zlabrd( order, M, N, nb, A, LDA, d, strideD, e, strideE, TAUQ, strideTAUQ, TAUP, strideTAUP, X, LDX, Y, LDY ) {
	var sa1;
	var sa2;
	var sx1;
	var sx2;
	var sy1;
	var sy2;
	var od;
	var oe;
	var ot;
	var ot;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( order === 'row-major' && LDY < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Eighteenth argument must be greater than or equal to max(1,N). Value: `%d`.', LDY ) );
	}
	if ( order === 'column-major' && LDY < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Eighteenth argument must be greater than or equal to max(1,M). Value: `%d`.', LDY ) );
	}
	if ( order === 'row-major' && LDX < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Sixteenth argument must be greater than or equal to max(1,N). Value: `%d`.', LDX ) );
	}
	if ( order === 'column-major' && LDX < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Sixteenth argument must be greater than or equal to max(1,M). Value: `%d`.', LDX ) );
	}
	if ( order === 'row-major' && LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be greater than or equal to max(1,N). Value: `%d`.', LDA ) );
	}
	if ( order === 'column-major' && LDA < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be greater than or equal to max(1,M). Value: `%d`.', LDA ) );
	}
	if ( order === 'column-major' ) {
		sa1 = 1;
		sa2 = LDA;
		sx1 = 1;
		sx2 = LDX;
		sy1 = 1;
		sy2 = LDY;
	} else {
		sa1 = LDA;
		sa2 = 1;
		sx1 = LDX;
		sx2 = 1;
		sy1 = LDY;
		sy2 = 1;
	}
	od = stride2offset( N, strideD );
	oe = stride2offset( N, strideE );
	ot = stride2offset( N, strideTAUQ );
	ot = stride2offset( N, strideTAUP );
	return base( M, N, nb, A, sa1, sa2, 0, d, strideD, od, e, strideE, oe, TAUQ, strideTAUQ, ot, TAUP, strideTAUP, ot, X, sx1, sx2, 0, Y, sy1, sy2, 0 );
}


// EXPORTS //

export default zlabrd;
