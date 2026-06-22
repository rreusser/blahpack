
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
* @returns {Object} object with properties csu, snu, csv, snv, csq, snq
*/
function dlags2( upper, a1, a2, a3, b1, b2, b3 ) { // eslint-disable-line max-len, max-params
	return base( upper, a1, a2, a3, b1, b2, b3 );
}


// EXPORTS //

export default dlags2;
