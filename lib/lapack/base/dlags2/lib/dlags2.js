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
* @param {boolean} upper - upper
* @param {number} a1 - a1
* @param {number} a2 - a2
* @param {number} a3 - a3
* @param {number} b1 - b1
* @param {number} b2 - b2
* @param {number} b3 - b3
* @param {Float64Array} csu - output (length-1 array): `csu`
* @param {Float64Array} snu - output (length-1 array): the desired orthogonal matrix U
* @param {Float64Array} csv - output (length-1 array): `csv`
* @param {Float64Array} snv - output (length-1 array): the desired orthogonal matrix V
* @param {Float64Array} csq - output (length-1 array): `csq`
* @param {Float64Array} snq - output (length-1 array): the desired orthogonal matrix Q
* @returns {void}
*/
function dlags2( upper, a1, a2, a3, b1, b2, b3, csu, snu, csv, snv, csq, snq ) { // eslint-disable-line max-len, max-params
	return base( upper, a1, a2, a3, b1, b2, b3, csu, snu, csv, snv, csq, snq );
}


// EXPORTS //

export default dlags2;
