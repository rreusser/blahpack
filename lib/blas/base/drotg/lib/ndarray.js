
// MODULES //

import base from './base.js';


// MAIN //

/**
* Constructs a Givens plane rotation.
*
* The rotation is defined such that:
*
* ```text
* [  c  s ] [ a ] = [ r ]
* [ -s  c ] [ b ]   [ 0 ]
* ```
*
* where `c**2 + s**2 = 1`.
*
* @param {Float64Array} ab - two-element array containing `[a, b]` on entry; `[r, z]` on exit
* @param {integer} strideAB - stride length for `ab`
* @param {NonNegativeInteger} offsetAB - starting index for `ab`
* @param {Float64Array} cs - two-element array; on exit contains `[c, s]`
* @param {integer} strideCS - stride length for `cs`
* @param {NonNegativeInteger} offsetCS - starting index for `cs`
* @returns {void}
*/
function drotg( ab, strideAB, offsetAB, cs, strideCS, offsetCS ) {
	return base( ab, strideAB, offsetAB, cs, strideCS, offsetCS );
}


// EXPORTS //

export default drotg;
