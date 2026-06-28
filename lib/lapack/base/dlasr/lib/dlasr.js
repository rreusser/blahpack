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
import isOperationSide from '@stdlib/blas/base/assert/is-operation-side/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Applies a sequence of real plane rotations to a real general rectangular matrix.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {string} side - `'left'` or `'right'`
* @param {string} pivot - `'variable'`, `'top'`, or `'bottom'`
* @param {string} direct - `'forward'` or `'backward'`
* @param {NonNegativeInteger} M - number of rows of A
* @param {NonNegativeInteger} N - number of columns of A
* @param {Float64Array} c - input array
* @param {integer} strideC - `c` stride length
* @param {Float64Array} s - input array
* @param {integer} strideS - `s` stride length
* @param {Float64Array} A - input matrix
* @param {PositiveInteger} LDA - leading dimension of `A`
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {Float64Array} output array
*/
function dlasr( order, side, pivot, direct, M, N, c, strideC, s, strideS, A, LDA ) {
	var sa1;
	var sa2;
	var oc;
	var os;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( !isOperationSide( side ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid operation side. Value: `%s`.', side ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( order === 'row-major' && LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Twelfth argument must be greater than or equal to max(1,N). Value: `%d`.', LDA ) );
	}
	if ( order === 'column-major' && LDA < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Twelfth argument must be greater than or equal to max(1,M). Value: `%d`.', LDA ) );
	}
	if ( pivot !== 'variable' && pivot !== 'top' && pivot !== 'bottom' ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid `pivot` value. Value: `%s`.', pivot ) );
	}
	if ( direct !== 'forward' ) {
		throw new TypeError( format( 'invalid argument. Fourth argument must be a valid `direct` value. Value: `%s`.', direct ) );
	}
	if ( order === 'column-major' ) {
		sa1 = 1;
		sa2 = LDA;
	} else {
		sa1 = LDA;
		sa2 = 1;
	}
	oc = stride2offset( N, strideC );
	os = stride2offset( N, strideS );
	return base( side, pivot, direct, M, N, c, strideC, oc, s, strideS, os, A, sa1, sa2, 0 );
}


// EXPORTS //

export default dlasr;
