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
* Generates a plane rotation with non-negative diagonal.
*
* @param {number} f - first component of the vector to be rotated
* @param {number} g - second component of the vector to be rotated
* @param {Float64Array} cs - output (length-1 array): the cosine of the rotation
* @param {Float64Array} sn - output (length-1 array): the sine of the rotation
* @param {Float64Array} r - output (length-1 array): the nonzero component of the rotated vector
*
* @example
* import Float64Array from '@stdlib/array/float64/lib/index.js';
*
* const out = dlartgp( 3.0, 4.0, new Float64Array( 3 ) );
* // returns <Float64Array>[ 0.6, 0.8, 5.0 ]
*/
function dlartgp( f, g, cs, sn, r ) {
	return base( f, g, cs, sn, r );
}


// EXPORTS //

export default dlartgp;
