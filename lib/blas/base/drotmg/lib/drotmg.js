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
* Constructs a modified Givens plane rotation.
*
* @param {Float64Array} dd1 - input/output (length-1 array): `dd1`
* @param {Float64Array} dd2 - input/output (length-1 array): `dd2`
* @param {Float64Array} dx1 - input/output (length-1 array): `dx1`
* @param {number} dy1 - scalar value `dy1`
* @param {Float64Array} param - five-element output array for the rotation parameters
* @param {integer} strideParam - stride length for `param`
* @returns {Float64Array} `param`
*/
function drotmg( dd1, dd2, dx1, dy1, param, strideParam ) {
	const oparam = stride2offset( 5, strideParam );
	return base( dd1, dd2, dx1, dy1, param, strideParam, oparam );
}


// EXPORTS //

export default drotmg;
