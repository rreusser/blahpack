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
* Performs complex division: out = X / Y, where X and Y are complex.

* @param {Complex128Array} x - numerator complex number
* @param {Complex128Array} y - denominator complex number
* @param {Complex128Array} out - output complex number
* @returns {Complex128Array} result
*/
function zladiv( x, y, out ) {
	const offsetX = 0;
	const offsetY = 0;
	const offsetOut = 0;
	return base( x, offsetX, y, offsetY, out, offsetOut );
}


// EXPORTS //

export default zladiv;
