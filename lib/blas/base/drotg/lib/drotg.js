/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the BLAS 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

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

	const oab = stride2offset( 2, strideAB );
	const ocs = stride2offset( 2, strideCS );
	return base( ab, strideAB, oab, cs, strideCS, ocs );
}


// EXPORTS //

export default drotg;
