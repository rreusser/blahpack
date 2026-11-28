/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

// MODULES //

import base from './base.js';


// MAIN //

/**
* Generates a plane rotation (real Givens rotation).
*
* @param {number} f - first component of the vector to be rotated
* @param {number} g - second component of the vector to be rotated
* @param {Float64Array} c - output (length-1 array): `c`
* @param {Float64Array} s - output (length-1 array): `s`
* @param {Float64Array} r - output (length-1 array): `r`
*
* @example
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import dlartg from '@rreusser/blahpack/lapack/dlartg';
*
* var c = new Float64Array( 1 );
* var s = new Float64Array( 1 );
* var r = new Float64Array( 1 );
*
* dlartg( 3.0, 4.0, c, s, r );
* // c[ 0 ] => 0.6
* // s[ 0 ] => 0.8
* // r[ 0 ] => 5.0
*/
function dlartg( f, g, c, s, r ) {
	return base( f, g, c, s, r );
}


// EXPORTS //

export default dlartg;
