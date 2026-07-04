/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable max-len, max-params */

// MODULES //

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes one dqds transform in ping-pong form without a shift.
*
* @param {integer} i0 - first index (1-based)
* @param {integer} n0 - last index (1-based)
* @param {Float64Array} z - input array
* @param {integer} stride - `z` stride length
* @param {integer} pp - ping-pong flag (0 or 1)
* @returns {Object} object with properties: dmin, dmin1, dmin2, dn, dnm1, dnm2
*/
function dlasq6( i0, n0, z, stride, pp ) {
	var oz = stride2offset( 4 * n0, stride );
	return base( i0, n0, z, stride, oz, pp );
}


// EXPORTS //

export default dlasq6;
