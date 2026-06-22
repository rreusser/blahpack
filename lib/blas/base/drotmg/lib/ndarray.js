/* eslint-disable max-len, max-params */

// MODULES //

import base from './base.js';


// MAIN //

/**
* Constructs a modified Givens plane rotation.
*
* The routine constructs the modified Givens transformation matrix `H` which
* zeros the second component of the 2-vector
* `(sqrt(dd1)*dx1, sqrt(dd2)*dy1)^T`.
*
* With `DPARAM[0] = DFLAG`, `H` has one of the following forms:
*
* ```text
* DFLAG=-1:     DFLAG=0:      DFLAG=1:      DFLAG=-2:
*
* (DH11  DH12)  (1     DH12)  (DH11  1   )  (1  0)
* (DH21  DH22)  (DH21  1   )  (-1    DH22)  (0  1)
* ```
*
* Locations 1-4 of `DPARAM` contain `DH11`, `DH21`, `DH12`, and `DH22`
* respectively. Values implied by the value of `DPARAM[0]` are not stored.
*
* @param {Float64Array} D - two-element array containing `[dd1, dd2]`
* @param {integer} strideD - stride length for `D`
* @param {NonNegativeInteger} offsetD - starting index for `D`
* @param {Float64Array} x1 - one-element array containing `dx1`
* @param {integer} strideX1 - stride length for `x1`
* @param {NonNegativeInteger} offsetX1 - starting index for `x1`
* @param {number} dy1 - scalar value `dy1`
* @param {Float64Array} param - five-element output array for the rotation parameters
* @param {integer} strideParam - stride length for `param`
* @param {NonNegativeInteger} offsetParam - starting index for `param`
* @returns {void}
*/
function drotmg( D, strideD, offsetD, x1, strideX1, offsetX1, dy1, param, strideParam, offsetParam ) {
	return base( D, strideD, offsetD, x1, strideX1, offsetX1, dy1, param, strideParam, offsetParam );
}


// EXPORTS //

export default drotmg;
