/**
 * Performs complex division: out = X / Y, where X and Y are complex.
 *
 * The computation will not overflow on an intermediary step unless
 * the result overflows.
 *
 *
 * @param {Complex128Array} x - numerator complex number
 * @param {integer} offsetX - offset (in complex elements) into x
 * @param {Complex128Array} y - denominator complex number
 * @param {integer} offsetY - offset (in complex elements) into y
 * @param {Complex128Array} out - output complex number
 * @param {integer} offsetOut - offset (in complex elements) into out
 * @returns {Complex128Array} out
 */

// MODULES //

import base from './base.js';


// MAIN //

/**
* Performs complex division: out = X / Y, where X and Y are complex.
*
* @param {Complex128Array} x - numerator complex number
* @param {integer} offsetX - offset (in complex elements) into x
* @param {Complex128Array} y - denominator complex number
* @param {integer} offsetY - offset (in complex elements) into y
* @param {Complex128Array} out - output complex number
* @param {integer} offsetOut - offset (in complex elements) into out
* @returns {Complex128Array} out
*/
function zladiv( x, offsetX, y, offsetY, out, offsetOut ) {
	return base( x, offsetX, y, offsetY, out, offsetOut );
}


// EXPORTS //

export default zladiv;
