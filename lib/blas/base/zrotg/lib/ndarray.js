
// MODULES //

import base from './base.js';


// MAIN //

/**
* Constructs a complex Givens plane rotation. On exit, `a` is overwritten with the rotated value `r`, `c` holds the real cosine, and `s` holds the complex sine.
*
* @param {Complex128Array} a - on entry, complex scalar `a`; on exit, overwritten with `r`
* @param {NonNegativeInteger} offsetA - index offset for `a` (in complex elements)
* @param {Complex128Array} b - complex scalar `b` (input only)
* @param {NonNegativeInteger} offsetB - index offset for `b` (in complex elements)
* @param {Float64Array} c - on exit, the real cosine of the rotation
* @param {NonNegativeInteger} offsetC - index offset for `c`
* @param {Complex128Array} s - on exit, the complex sine of the rotation
* @param {NonNegativeInteger} offsetS - index offset for `s` (in complex elements)
* @returns {void}
*/
function zrotg( a, offsetA, b, offsetB, c, offsetC, s, offsetS ) {
	return base( a, offsetA, b, offsetB, c, offsetC, s, offsetS );
}


// EXPORTS //

export default zrotg;
