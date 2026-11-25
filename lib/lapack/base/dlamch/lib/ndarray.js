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

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Determines double-precision machine parameters.
*
* @param {MachineParameter} cmach - specifies the machine parameter
* @returns {number} machine parameter value
*
* @example
* import dlamch from '@rreusser/blahpack/lapack/base/dlamch';
*
* var eps = dlamch.ndarray( 'epsilon' );
* // returns 1.1102230246251565e-16
*/
function dlamch( cmach ) {
	if ( typeof cmach !== 'string' ) {
		throw new TypeError( format( 'invalid argument. First argument must be a string specifying the machine parameter. Value: `%s`.', cmach ) );
	}
	return base( cmach );
}


// EXPORTS //

export default dlamch;
