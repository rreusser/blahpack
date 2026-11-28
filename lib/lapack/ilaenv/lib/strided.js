/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable max-params */

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Returns problem-dependent parameters for the local environment, using alternative indexing semantics (the routine takes no arrays).
*
* @param {integer} ispec - parameter to return (1-17)
* @param {string} name - name of the calling routine (e.g. `'DGEQRF'`)
* @param {string} opts - character options of the calling routine, concatenated (not read)
* @param {integer} n1 - first problem dimension
* @param {integer} n2 - second problem dimension
* @param {integer} n3 - third problem dimension
* @param {integer} n4 - fourth problem dimension
* @throws {TypeError} second argument must be a string
* @throws {TypeError} third argument must be a string
* @returns {integer} parameter value
*
* @example
* import ilaenv from '@rreusser/blahpack/lapack/ilaenv';
*
* var nb = ilaenv.strided( 1, 'DGEQRF', ' ', 100, 100, -1, -1 );
* // returns 32
*/
function ilaenv( ispec, name, opts, n1, n2, n3, n4 ) {
	if ( typeof name !== 'string' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a string. Value: `%s`.', name ) );
	}
	if ( typeof opts !== 'string' ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a string. Value: `%s`.', opts ) );
	}
	return base( ispec, name, opts, n1, n2, n3, n4 );
}


// EXPORTS //

export default ilaenv;
