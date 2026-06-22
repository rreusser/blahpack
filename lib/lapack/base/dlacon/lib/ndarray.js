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

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Estimates the 1-norm of a square real matrix using reverse communication.
*
* @param {NonNegativeInteger} N - order of the matrix
* @param {Float64Array} v - workspace array of length N
* @param {integer} strideV - stride length for `v`
* @param {NonNegativeInteger} offsetV - starting index for `v`
* @param {Float64Array} x - input/output vector of length N
* @param {integer} strideX - stride length for `x`
* @param {NonNegativeInteger} offsetX - starting index for `x`
* @param {Int32Array} ISGN - sign array of length N
* @param {integer} strideISGN - stride length for `ISGN`
* @param {NonNegativeInteger} offsetISGN - starting index for `ISGN`
* @param {Float64Array} EST - in/out: EST[0] is the estimated norm
* @param {Int32Array} KASE - in/out: KASE[0] is the operation to perform
* @throws {RangeError} first argument must be a nonnegative integer
* @returns {void}
*/
function dlacon( N, v, strideV, offsetV, x, strideX, offsetX, ISGN, strideISGN, offsetISGN, EST, KASE ) {
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( N === 0 ) {
		return;
	}
	return base( N, v, strideV, offsetV, x, strideX, offsetX, ISGN, strideISGN, offsetISGN, EST, KASE );
}


// EXPORTS //

export default dlacon;
