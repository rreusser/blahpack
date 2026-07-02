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

import Float64Array from '@stdlib/array/float64/lib/index.js';
import base from './base.js';


// VARIABLES //

var out = new Float64Array( 3 );


// MAIN //

/**
* Generates a plane rotation with non-negative diagonal.
*
* @param {number} f - first component of the vector to be rotated
* @param {number} g - second component of the vector to be rotated
* @returns {Object} object with properties `c`, `s`, and `r`
*/
function dlartgp( f, g ) {
	base( f, g, out );
	return {
		'c': out[ 0 ],
		's': out[ 1 ],
		'r': out[ 2 ]
	};
}


// EXPORTS //

export default dlartgp;
