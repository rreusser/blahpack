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
* Checks whether infinity and NaN arithmetic is safe, using alternative indexing semantics (the routine takes no arrays).
*
* @param {integer} ispec - `0` checks infinity arithmetic only; any other value also checks NaN arithmetic
* @param {number} zero - the value `0.0`
* @param {number} one - the value `1.0`
* @returns {integer} `1` if the arithmetic is safe, `0` otherwise
*
* @example
* import ieeeck from '@rreusser/blahpack/lapack/ieeeck';
*
* var v = ieeeck.ndarray( 1, 0.0, 1.0 );
* // returns 1
*/
function ieeeck( ispec, zero, one ) {
	return base( ispec, zero, one );
}


// EXPORTS //

export default ieeeck;
