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
* Scales a vector by the reciprocal of a scalar, performing the scaling.
*
* @param {NonNegativeInteger} N - number of elements
* @param {number} sa - scalar divisor
* @param {Float64Array} x - input array
* @param {integer} strideX - `x` stride length
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {Float64Array} output array
*/
function drscl( N, sa, x, strideX ) {
	var ox = stride2offset( N, strideX );
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( N, sa, x, strideX, ox );
}


// EXPORTS //

export default drscl;
