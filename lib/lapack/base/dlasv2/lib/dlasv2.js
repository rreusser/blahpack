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
* Computes the singular value decomposition of a 2-by-2 triangular matrix:.
*/
function dlasv2( f, g, h ) {
	return base( f, g, h );
}


// EXPORTS //

export default dlasv2;
