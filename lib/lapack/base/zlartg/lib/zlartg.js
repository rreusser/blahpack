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
* @param {Complex128Array} g - second component (input only)
* @param {Float64Array} c - on exit, the real cosine of the rotation
* @param {Complex128Array} s - on exit, the complex sine of the rotation
* @param {Complex128Array} r - on exit, the complex result
* @returns {void}
*/
function zlartg( f, g, c, s, r ) {
	const offsetF = 0;
	const offsetG = 0;
	const offsetC = 0;
	const offsetS = 0;
	const offsetR = 0;
	return base( f, offsetF, g, offsetG, c, offsetC, s, offsetS, r, offsetR );
}


// EXPORTS //

export default zlartg;
