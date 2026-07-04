/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable max-len, max-params */

// MODULES //

import base from './base.js';


// MAIN //

/**
* Tests for NaN by comparing two arguments for inequality.
*/
function dlaisnan( din1, din2 ) {
	return base( din1, din2 );
}


// EXPORTS //

export default dlaisnan;
