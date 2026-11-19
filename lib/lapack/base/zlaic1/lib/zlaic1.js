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
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Applies one step of incremental condition estimation for complex matrices.
*
* @param {string} job - specifies whether to estimate the largest or smallest singular value (`largest-singular-value` or `smallest-singular-value`)
* @param {NonNegativeInteger} j - length of X and W
* @param {Complex128Array} x - input vector x
* @param {integer} strideX - stride for `x` (in complex elements)
* @param {number} sest - estimated singular value of L
* @param {Complex128Array} w - input vector w
* @param {integer} strideW - stride for `w` (in complex elements)
* @param {Complex128} gamma - diagonal element gamma
* @param {Float64Array} sestpr - output: `sestpr[0]` receives the updated singular value estimate
* @param {Complex128Array} s - output: receives the sine
* @param {Complex128Array} c - output: receives the cosine
* @returns {void}
*/
function zlaic1( job, j, x, strideX, sest, w, strideW, gamma, sestpr, s, c ) {
	const ox = stride2offset( j, strideX );
	const ow = stride2offset( j, strideW );

	if ( job !== 'largest-singular-value' && job !== 'smallest-singular-value' ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid job string. Value: `%s`.', job ) ); // eslint-disable-line max-len
	}
	return base( job, j, x, strideX, ox, sest, w, strideW, ow, gamma, sestpr, s, 0, c, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default zlaic1;
