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
* Generate a complex elementary reflector H of order N, such that.
*
* @param {NonNegativeInteger} N - order of the reflector
* @param {Complex128Array} alpha - complex scalar, overwritten with beta
* @param {NonNegativeInteger} offsetAlpha - starting index for alpha (in complex elements)
* @param {Complex128Array} x - input array
* @param {integer} strideX - `x` stride length
* @param {Complex128Array} tau - output complex scalar
* @param {NonNegativeInteger} offsetTau - starting index for tau (in complex elements)
* @throws {RangeError} if a numerical argument does not satisfy constraints
*/
function zlarfg( N, alpha, offsetAlpha, x, strideX, tau, offsetTau ) {
	var ox = stride2offset( N, strideX );
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( N, alpha, offsetAlpha, x, strideX, ox, tau, offsetTau );
}


// EXPORTS //

export default zlarfg;
