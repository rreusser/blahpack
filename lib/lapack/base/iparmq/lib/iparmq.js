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

import base from './base.js';


// MAIN //

/**
* Returns the tuning parameters of the multishift QR algorithm.
*
* @param {integer} ispec - parameter to return (12-17)
* @param {string} name - name of the calling routine
* @param {string} opts - character options of the calling routine (not read)
* @param {integer} N - order of the Hessenberg matrix
* @param {integer} ilo - first row/column of the active block (1-based)
* @param {integer} ihi - last row/column of the active block (1-based)
* @returns {integer} parameter value
*
* @example
* import iparmq from '@rreusser/blahpack/lapack/base/iparmq';
*
* var ns = iparmq( 15, 'DLAQR0', 'SV', 200, 1, 200 );
* // returns 24
*/
function iparmq( ispec, name, opts, N, ilo, ihi ) {
	return base( ispec, name, opts, N, ilo, ihi );
}


// EXPORTS //

export default iparmq;
