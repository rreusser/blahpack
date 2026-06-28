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

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes an approximation TAU to the smallest eigenvalue using values of d.
*
* @param {integer} i0 - first index (1-based)
* @param {integer} n0 - last index (1-based)
* @param {Float64Array} z - input array
* @param {integer} stride - `z` stride length
* @param {integer} pp - ping-pong flag (0 or 1)
* @param {integer} n0in - value of n0 at start of eigtest
* @param {number} dmin - minimum value of d
* @param {number} dmin1 - minimum value of d, excluding d(n0)
* @param {number} dmin2 - minimum value of d, excluding d(n0) and d(n0-1)
* @param {number} dn - d(n0)
* @param {number} dn1 - d(n0-1)
* @param {number} dn2 - d(n0-2)
* @param {number} tau - (input, unused — kept for API compat)
* @param {integer} ttype - shift type from previous call
* @param {number} g - damping parameter preserved between calls
* @returns {Object} object with `tau` (shift), `ttype` (shift type), and `g` (updated damping)
*/
function dlasq4( i0, n0, z, stride, pp, n0in, dmin, dmin1, dmin2, dn, dn1, dn2, tau, ttype, g ) {
	var oz = stride2offset( 4 * n0, stride );
	return base( i0, n0, z, stride, oz, pp, n0in, dmin, dmin1, dmin2, dn, dn1, dn2, tau, ttype, g );
}


// EXPORTS //

export default dlasq4;
