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
* Generates a vector of real plane rotations (Givens rotations).
*
* @param {NonNegativeInteger} N - number of plane rotations to generate
* @param {Float64Array} x - input/output vector x
* @param {integer} strideX - stride for `x`
* @param {Float64Array} y - input/output vector y
* @param {integer} strideY - stride for `y`
* @param {Float64Array} c - output vector for cosines
* @param {integer} strideC - stride for `c`
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {void}
*/
function dlargv( N, x, strideX, y, strideY, c, strideC ) {
	var ox = stride2offset( N, strideX );
	var oy = stride2offset( N, strideY );
	var oc = stride2offset( N, strideC );
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( N, x, strideX, ox, y, strideY, oy, c, strideC, oc );
}


// EXPORTS //

export default dlargv;
