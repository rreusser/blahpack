

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Compute a safe BLAS-style constant for scaling matrix norms
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
