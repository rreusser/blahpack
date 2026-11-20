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
* @param {Float64Array} a - input/output (length-1 array): `a`
* @param {Float64Array} b - input/output (length-1 array): `b`
* @param {Float64Array} c - output (length-1 array): `c`
* @param {Float64Array} s - output (length-1 array): `s`
*/
function drotg( a, b, c, s ) {
	return base( a, b, c, s );
}


// EXPORTS //

export default drotg;
