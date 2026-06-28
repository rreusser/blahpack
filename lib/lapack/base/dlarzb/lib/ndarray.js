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

import isOperationSide from '@stdlib/blas/base/assert/is-operation-side/lib/index.js';
import isTransposeOperation from '@stdlib/blas/base/assert/is-transpose-operation/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Applies a real block reflector from an RZ factorization to a real M-by-N matrix C, from either the left or the right.
*
* Only `direct = 'backward'` and `storev = 'rowwise'` are supported.
*
* @param {string} side - `'left'` or `'right'`
* @param {string} trans - `'no-transpose'` or `'transpose'`
* @param {string} direct - direction (`'backward'`)
* @param {string} storev - storage direction (`'rowwise'`)
* @param {NonNegativeInteger} M - number of rows of C
* @param {NonNegativeInteger} N - number of columns of C
* @param {NonNegativeInteger} K - order of the block reflector
* @param {NonNegativeInteger} l - number of columns of V
* @param {Float64Array} V - matrix of Householder vectors (K-by-L, rowwise)
* @param {integer} strideV1 - stride of the first dimension of `V`
* @param {integer} strideV2 - stride of the second dimension of `V`
* @param {NonNegativeInteger} offsetV - starting index for `V`
* @param {Float64Array} T - triangular factor of the block reflector (K-by-K, lower triangular)
* @param {integer} strideT1 - stride of the first dimension of `T`
* @param {integer} strideT2 - stride of the second dimension of `T`
* @param {NonNegativeInteger} offsetT - starting index for `T`
* @param {Float64Array} C - M-by-N matrix, overwritten on exit
* @param {integer} strideC1 - stride of the first dimension of `C`
* @param {integer} strideC2 - stride of the second dimension of `C`
* @param {NonNegativeInteger} offsetC - starting index for `C`
* @param {Float64Array} WORK - workspace
* @param {integer} strideWork1 - stride of the first dimension of `WORK`
* @param {integer} strideWork2 - stride of the second dimension of `WORK`
* @param {NonNegativeInteger} offsetWork - starting index for `WORK`
* @throws {TypeError} first argument must be a valid operation side
* @throws {TypeError} second argument must be a valid transpose operation
* @throws {TypeError} third argument must be a valid direction
* @throws {TypeError} fourth argument must be a valid storage direction
* @throws {RangeError} fifth argument must be a nonnegative integer
* @throws {RangeError} sixth argument must be a nonnegative integer
* @throws {RangeError} seventh argument must be a nonnegative integer
* @throws {RangeError} eighth argument must be a nonnegative integer
* @returns {Float64Array} `C`
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
*
* var V = new Float64Array( [ 0.3, -0.4 ] );
* var T = new Float64Array( [ 0.8 ] );
* var C = new Float64Array( [ 1.0, 2.0, 3.0, 4.0, 5.0, 6.0 ] );
* var WORK = new Float64Array( 3 );
*
* dlarzb( 'left', 'no-transpose', 'backward', 'rowwise', 2, 3, 1, 2, V, 1, 1, 0, T, 1, 1, 0, C, 1, 2, 0, WORK, 1, 3, 0 );
*/
function dlarzb( side, trans, direct, storev, M, N, K, l, V, strideV1, strideV2, offsetV, T, strideT1, strideT2, offsetT, C, strideC1, strideC2, offsetC, WORK, strideWork1, strideWork2, offsetWork ) {
	if ( !isOperationSide( side ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid operation side. Value: `%s`.', side ) );
	}
	if ( !isTransposeOperation( trans ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid transpose operation. Value: `%s`.', trans ) );
	}
	if ( direct !== 'backward' ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid direction. Value: `%s`.', direct ) );
	}
	if ( storev !== 'rowwise' ) {
		throw new TypeError( format( 'invalid argument. Fourth argument must be a valid storage direction. Value: `%s`.', storev ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( K < 0 ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be a nonnegative integer. Value: `%d`.', K ) );
	}
	if ( l < 0 ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be a nonnegative integer. Value: `%d`.', l ) );
	}
	var minWork = ( side === 'left' ) ? Math.max( 1, K * N ) : Math.max( 1, K * M );
	if ( !WORK || ( WORK.length - offsetWork ) < minWork ) {
		throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', minWork, offsetWork, ( WORK ) ? WORK.length : 0 ) );
	}

	base( side, trans, direct, storev, M, N, K, l, V, strideV1, strideV2, offsetV, T, strideT1, strideT2, offsetT, C, strideC1, strideC2, offsetC, WORK, strideWork1, strideWork2, offsetWork );
	return C;
}


// EXPORTS //

export default dlarzb;
