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
* Applies a plane rotation, where the cos (C) is real and the sin (S) is.
*
* @param {NonNegativeInteger} N - number of complex elements
* @param {Complex128Array} cx - input array
* @param {integer} strideX - `cx` stride length
* @param {Complex128Array} cy - input array
* @param {integer} strideY - `cy` stride length
* @param {number} c - cosine of rotation (real)
* @param {Float64Array} s - sine of rotation (complex, 2-element array [re, im])
* @returns {Complex128Array} output array
*/
function zrot( N, cx, strideX, cy, strideY, c, s ) {
	var oc = stride2offset( N, strideX );
	var oc = stride2offset( N, strideY );
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( N, cx, strideX, oc, cy, strideY, oc, c, s );
}


// EXPORTS //

export default zrot;
