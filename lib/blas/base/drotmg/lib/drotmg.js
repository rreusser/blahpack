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
* @param {Float64Array} D - two-element array containing `[dd1, dd2]`
* @param {integer} strideD - stride length for `D`
* @param {Float64Array} x1 - one-element array containing `dx1`
* @param {integer} strideX1 - stride length for `x1`
* @param {number} dy1 - scalar value `dy1`
* @param {Float64Array} param - five-element output array for the rotation parameters
* @param {integer} strideParam - stride length for `param`
* @returns {void}
*/
function drotmg( D, strideD, x1, strideX1, dy1, param, strideParam ) {
	const od = stride2offset( 2, strideD );
	const ox1 = stride2offset( 1, strideX1 );
	const oparam = stride2offset( 5, strideParam );
	return base( D, strideD, od, x1, strideX1, ox1, dy1, param, strideParam, oparam );
}


// EXPORTS //

export default drotmg;
