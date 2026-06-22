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
import base from './base.js';


// MAIN //

/**
* Checks for deflation, computes a shift (TAU) and calls dqds. In case of.
*
* @param {integer} i0 - first index (1-based)
* @param {integer} n0 - last index (1-based)
* @param {Float64Array} z - input array
* @param {integer} stride - `z` stride length
* @param {integer} pp - ping-pong flag (0, 1, or 2)
* @param {number} dmin - minimum value of d
* @param {number} sigma - accumulated shift
* @param {number} desig - lower order part of sigma
* @param {number} qmax - maximum value of q
* @param {integer} nfail - failure counter
* @param {integer} iter - iteration counter
* @param {integer} ndiv - division counter
* @param {integer} ttype - shift type
* @param {number} dmin1 - min d excluding d(n0)
* @param {number} dmin2 - min d excluding d(n0) and d(n0-1)
* @param {number} dn - d(n0)
* @param {number} dn1 - d(n0-1)
* @param {number} dn2 - d(n0-2)
* @param {number} g - damping parameter
* @param {number} tau - shift value
* @returns {Object} object with updated values
*/
function dlasq3( i0, n0, z, stride, pp, dmin, sigma, desig, qmax, nfail, iter, ndiv, ieee, ttype, dmin1, dmin2, dn, dn1, dn2, g, tau ) {
	var oz = stride2offset( 4 * n0, stride );
	return base( i0, n0, z, stride, oz, pp, dmin, sigma, desig, qmax, nfail, iter, ndiv, ieee, ttype, dmin1, dmin2, dn, dn1, dn2, g, tau );
}


// EXPORTS //

export default dlasq3;
