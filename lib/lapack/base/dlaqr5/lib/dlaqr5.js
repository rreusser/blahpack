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
* @license Apache-2.0
*
* @param {Float64Array} A - A
* @param {integer} sA1 - sA1
* @param {integer} sA2 - sA2
* @param {integer} oA - oA
* @param {integer} i - i
* @param {integer} j - j
* @returns {number} element value
*/
function dlaqr5( A, sA1, sA2, oA, i, j ) {
	return base( A, sA1, sA2, oA, i, j );
}


// EXPORTS //

export default dlaqr5;
