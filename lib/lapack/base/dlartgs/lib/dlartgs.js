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

var out = new Float64Array( 2 );


// MAIN //

/**
* Generates a plane rotation designed to introduce a bulge in implicit QR iteration for the bidiagonal SVD problem.
*
* @param {number} x - the `(1,1)` entry of an upper bidiagonal matrix
* @param {number} y - the `(1,2)` entry of an upper bidiagonal matrix
* @param {number} sigma - shift
* @returns {Object} object with properties `cs` and `sn`
*/
function dlartgs( x, y, sigma ) {
	base( x, y, sigma, out );
	return {
		'cs': out[ 0 ],
		'sn': out[ 1 ]
	};
}


// EXPORTS //

export default dlartgs;
