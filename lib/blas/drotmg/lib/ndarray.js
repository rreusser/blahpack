/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the BLAS 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

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
* @param {Float64Array} dd1 - input/output (length-1 array): `dd1`
* @param {Float64Array} dd2 - input/output (length-1 array): `dd2`
* @param {Float64Array} dx1 - input/output (length-1 array): `dx1`
* @param {number} dy1 - scalar value `dy1`
* @param {Float64Array} param - five-element output array for the rotation parameters
* @param {integer} strideParam - stride length for `param`
* @param {NonNegativeInteger} offsetParam - starting index for `param`
* @returns {Float64Array} `param`
*/
function drotmg( dd1, dd2, dx1, dy1, param, strideParam, offsetParam ) {
	return base( dd1, dd2, dx1, dy1, param, strideParam, offsetParam );
}


// EXPORTS //

export default drotmg;
