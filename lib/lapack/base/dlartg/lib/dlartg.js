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
* @returns {void}
*
* @example
* import Float64Array from '@stdlib/array/float64/lib/index.js';
*
* const out = dlartg( 3.0, 4.0, new Float64Array( 3 ) );
* // returns <Float64Array>[ 0.6, 0.8, 5.0 ]
*/
function dlartg( f, g, c, s, r ) {
	return base( f, g, c, s, r );
}


// EXPORTS //

export default dlartg;
