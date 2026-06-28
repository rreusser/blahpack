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
* Applies a complex elementary reflector `H`, defined by the `RZ` factorization, to a complex M-by-N matrix `C`, from either the left or the right.
*
* @param {string} order - storage layout (`'row-major'` or `'column-major'`)
* @param {string} side - `'left'` applies `H` from the left; `'right'` applies `H` from the right
* @param {NonNegativeInteger} M - number of rows of `C`
* @param {NonNegativeInteger} N - number of columns of `C`
* @param {NonNegativeInteger} l - number of entries of the vector `v` containing the meaningful part of the reflector
* @param {Complex128Array} v - reflector vector
* @param {integer} strideV - stride for `v` (in complex elements)
* @param {Complex128Array} tau - complex scalar
* @param {NonNegativeInteger} offsetTau - starting index for `tau` (in complex elements)
* @param {Complex128Array} C - matrix, modified in place
* @param {PositiveInteger} LDC - leading dimension of `C`
* @param {Complex128Array} WORK - workspace
* @param {integer} strideWork - stride for `WORK` (in complex elements)
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be a valid operation side
* @throws {RangeError} third argument must be a nonnegative integer
* @throws {RangeError} fourth argument must be a nonnegative integer
* @throws {RangeError} eleventh argument must be greater than or equal to max(1,N) (row-major) or max(1,M) (column-major)
* @returns {Complex128Array} `C`
*/
function zlarz( order, side, M, N, l, v, strideV, tau, offsetTau, C, LDC, WORK, strideWork ) {
	var nwork;
	var sc1;
	var sc2;
	var ov;
	var ow;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( !isOperationSide( side ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid operation side. Value: `%s`.', side ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( order === 'row-major' && LDC < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Eleventh argument must be greater than or equal to max(1,N). Value: `%d`.', LDC ) );
	}
	if ( order === 'column-major' && LDC < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Eleventh argument must be greater than or equal to max(1,M). Value: `%d`.', LDC ) );
	}
	if ( M === 0 || N === 0 ) {
		return C;
	}
	if ( order === 'column-major' ) {
		sc1 = 1;
		sc2 = LDC;
	} else {
		sc1 = LDC;
		sc2 = 1;
	}
	ov = stride2offset( l, strideV );
	nwork = ( side === 'left' ) ? N : M;
	if ( WORK === null || WORK === void 0 ) {
		WORK = new Float64Array( 1 ); // TODO: set correct size
		strideWork = 1;
	}
	ow = stride2offset( nwork, strideWork );
	base( side, M, N, l, v, strideV, ov, tau, offsetTau, C, sc1, sc2, 0, WORK, strideWork, ow );
	return C;
}


// EXPORTS //

export default zlarz;
