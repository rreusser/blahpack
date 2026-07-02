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
* Compute a safe BLAS-style constant for scaling matrix norms.
*
* @param {number} anorm - anorm
* @param {number} bnorm - bnorm
* @param {number} cnorm - cnorm
* @returns {number} result
*/
function dlarmm( anorm, bnorm, cnorm ) {
	return base( anorm, bnorm, cnorm );
}


// EXPORTS //

export default dlarmm;
