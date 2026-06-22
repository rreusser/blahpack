// MODULES //

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Constructs a Givens plane rotation.
*
* @param {Float64Array} ab - input/output array containing `[a, b]`
* @param {integer} strideAB - stride for `ab`
* @param {Float64Array} cs - output array for `[c, s]`
* @param {integer} strideCS - stride for `cs`
* @returns {Float64Array} output array `cs`
*/
function drotg( ab, strideAB, cs, strideCS ) {
	var oab;
	var ocs;

	oab = stride2offset( 2, strideAB );
	ocs = stride2offset( 2, strideCS );
	return base( ab, strideAB, oab, cs, strideCS, ocs );
}


// EXPORTS //

export default drotg;
