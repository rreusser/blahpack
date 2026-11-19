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
* Checks for deflation, computes a shift (TAU) and calls dqds. In case of.
*
* @param {integer} i0 - first index (1-based)
* @param {Int32Array} n0 - input/output (length-1 array): last index (1-based)
* @param {Float64Array} z - input array
* @param {integer} stride - `z` stride length
* @param {Int32Array} pp - input/output (length-1 array): ping-pong flag (0, 1, or 2)
* @param {Float64Array} dmin - input/output (length-1 array): minimum value of d
* @param {Float64Array} sigma - input/output (length-1 array): accumulated shift
* @param {Float64Array} desig - input/output (length-1 array): lower order part of sigma
* @param {Float64Array} qmax - input/output (length-1 array): maximum value of q
* @param {Int32Array} nfail - input/output (length-1 array): failure counter
* @param {Int32Array} iter - input/output (length-1 array): iteration counter
* @param {Int32Array} ndiv - input/output (length-1 array): division counter
* @param {Int32Array} ttype - input/output (length-1 array): shift type
* @param {Float64Array} dmin1 - input/output (length-1 array): min d excluding d(n0)
* @param {Float64Array} dmin2 - input/output (length-1 array): min d excluding d(n0) and d(n0-1)
* @param {Float64Array} dn - input/output (length-1 array): d(n0)
* @param {Float64Array} dn1 - input/output (length-1 array): d(n0-1)
* @param {Float64Array} dn2 - input/output (length-1 array): d(n0-2)
* @param {Float64Array} g - input/output (length-1 array): damping parameter
* @param {Float64Array} tau - input/output (length-1 array): shift value
* @returns {Float64Array} `z`
*/
function dlasq3( i0, n0, z, stride, pp, dmin, sigma, desig, qmax, nfail, iter, ndiv, ieee, ttype, dmin1, dmin2, dn, dn1, dn2, g, tau ) {
	const oz = stride2offset( 4 * n0, stride );
	return base( i0, n0, z, stride, oz, pp, dmin, sigma, desig, qmax, nfail, iter, ndiv, ieee, ttype, dmin1, dmin2, dn, dn1, dn2, g, tau );
}


// EXPORTS //

export default dlasq3;
