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

import base from './base.js';


// MAIN //

/**
* Generates a plane rotation so that:.
*
* ```text
* [  C         S  ] . [ F ]  =  [ R ]
* [ -conjg(S)  C  ]   [ G ]     [ 0 ]
* ```
*
* where C is real and `C**2 + |S|**2 = 1`.
*
* @param {Complex128Array} f - first component (input only)
* @param {NonNegativeInteger} offsetF - index offset for `f` (in complex elements)
* @param {Complex128Array} g - second component (input only)
* @param {NonNegativeInteger} offsetG - index offset for `g` (in complex elements)
* @param {Float64Array} c - on exit, the real cosine of the rotation
* @param {NonNegativeInteger} offsetC - index offset for `c`
* @param {Complex128Array} s - on exit, the complex sine of the rotation
* @param {NonNegativeInteger} offsetS - index offset for `s` (in complex elements)
* @param {Complex128Array} r - on exit, the complex result
* @param {NonNegativeInteger} offsetR - index offset for `r` (in complex elements)
* @returns {void}
*/
function zlartg( f, offsetF, g, offsetG, c, offsetC, s, offsetS, r, offsetR ) {
	return base( f, offsetF, g, offsetG, c, offsetC, s, offsetS, r, offsetR );
}


// EXPORTS //

export default zlartg;
