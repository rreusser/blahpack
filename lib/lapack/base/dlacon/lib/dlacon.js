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

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Estimates the 1-norm of a square real matrix using reverse communication.
*
* @param {NonNegativeInteger} N - order of the matrix
* @param {Float64Array} v - workspace array of length N
* @param {integer} strideV - `v` stride length
* @param {Float64Array} x - input/output vector of length N
* @param {integer} strideX - `x` stride length
* @param {Int32Array} ISGN - sign array of length N
* @param {integer} strideISGN - `ISGN` stride length
* @param {Float64Array} EST - in/out: EST[0] is the estimated norm
* @param {Int32Array} KASE - in/out: KASE[0] is the operation to perform
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {void}
*/
function dlacon( N, v, strideV, x, strideX, ISGN, strideISGN, EST, KASE ) {
	var ov = stride2offset( N, strideV );
	var ox = stride2offset( N, strideX );
	var oi = stride2offset( N, strideISGN );
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( N, v, strideV, ov, x, strideX, ox, ISGN, strideISGN, oi, EST, KASE );
}


// EXPORTS //

export default dlacon;
