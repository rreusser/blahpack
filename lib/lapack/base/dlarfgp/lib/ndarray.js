/* eslint-disable max-len, max-params */

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

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Generates a real elementary reflector `H` of order `N` with non-negative `beta`.
*
* @param {NonNegativeInteger} N - order of the reflector
* @param {Float64Array} alpha - on entry, the scalar `alpha`; on exit, the scalar `beta` (non-negative)
* @param {NonNegativeInteger} offsetAlpha - index into `alpha`
* @param {Float64Array} x - vector, overwritten with `v` on exit
* @param {integer} strideX - stride for `x`
* @param {NonNegativeInteger} offsetX - starting index for `x`
* @param {Float64Array} tau - output scalar
* @param {NonNegativeInteger} offsetTau - index into `tau`
* @throws {RangeError} first argument must be a nonnegative integer
* @returns {void}
*/
function dlarfgp( N, alpha, offsetAlpha, x, strideX, offsetX, tau, offsetTau ) {
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	base( N, alpha, offsetAlpha, x, strideX, offsetX, tau, offsetTau );
}


// EXPORTS //

export default dlarfgp;
