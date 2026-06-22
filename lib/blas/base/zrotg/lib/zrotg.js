
// MODULES //

import base from './base.js';


// MAIN //

/**
* Constructs a complex Givens plane rotation. On exit, `a` is overwritten with the rotated value `r`, `c` holds the real cosine, and `s` holds the complex sine.
*
* @param {Complex128Array} a - on entry, complex scalar `a`; on exit, overwritten with `r`
* @param {Complex128Array} b - complex scalar `b` (input only)
* @param {Float64Array} c - on exit, the real cosine of the rotation
* @param {Complex128Array} s - on exit, the complex sine of the rotation
* @returns {void}
*/
function zrotg( a, b, c, s ) {
	return base( a, 0, b, 0, c, 0, s, 0 );
}


// EXPORTS //

export default zrotg;
