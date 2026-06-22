
// MODULES //

import base from './base.js';


// MAIN //

/**
* @license Apache-2.0
*
* @param {boolean} ltrans - ltrans
* @param {integer} na - na
* @param {integer} nw - nw
* @param {number} smin - smin
* @param {number} ca - ca
* @param {Float64Array} A - A
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {number} d1 - d1
* @param {number} d2 - d2
* @param {Float64Array} B - B
* @param {PositiveInteger} LDB - leading dimension of `B`
* @param {number} wr - wr
* @param {number} wi - wi
* @param {Float64Array} X - X
* @param {PositiveInteger} LDX - leading dimension of `X`
* @returns {Object} result with properties: info (0=exact, 1=perturbed), scale, xnorm
*/
function dlaln2( ltrans, na, nw, smin, ca, A, LDA, d1, d2, B, LDB, wr, wi, X, LDX ) { // eslint-disable-line max-len, max-params
	var sa1;
	var sa2;
	var sb1;
	var sb2;
	var sx1;
	var sx2;

	sa1 = 1;
	sa2 = LDA;
	sb1 = 1;
	sb2 = LDB;
	sx1 = 1;
	sx2 = LDX;
	return base( ltrans, na, nw, smin, ca, A, sa1, sa2, 0, d1, d2, B, sb1, sb2, 0, wr, wi, X, sx1, sx2, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default dlaln2;
