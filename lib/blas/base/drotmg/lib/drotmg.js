// MODULES //

import base from './base.js';


// MAIN //

/**
* Constructs a modified Givens plane rotation.
*
* @param {Float64Array} D - two-element array containing `[dd1, dd2]`
* @param {Float64Array} x1 - one-element array containing `dx1`
* @param {number} dy1 - scalar value `dy1`
* @param {Float64Array} param - five-element output array for the rotation parameters
* @returns {void}
*/
function drotmg( D, x1, dy1, param ) {
	return base( D, 1, 0, x1, 1, 0, dy1, param, 1, 0 );
}


// EXPORTS //

export default drotmg;
