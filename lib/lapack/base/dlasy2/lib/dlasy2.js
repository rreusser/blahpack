
// MODULES //

import base from './base.js';


// MAIN //

/**
* @license Apache-2.0
*
* @param {boolean} ltranl - ltranl
* @param {boolean} ltranr - ltranr
* @param {integer} isgn - isgn
* @param {integer} n1 - n1
* @param {integer} n2 - n2
* @param {Float64Array} TL - TL
* @param {PositiveInteger} LDTL - leading dimension of `TL`
* @param {Float64Array} TR - TR
* @param {PositiveInteger} LDTR - leading dimension of `TR`
* @param {Float64Array} B - B
* @param {PositiveInteger} LDB - leading dimension of `B`
* @param {Float64Array} scale - scale
* @param {Float64Array} X - X
* @param {PositiveInteger} LDX - leading dimension of `X`
* @param {Float64Array} xnorm - xnorm
* @returns {integer} info status code
*/
function dlasy2( ltranl, ltranr, isgn, n1, n2, TL, LDTL, TR, LDTR, B, LDB, scale, X, LDX, xnorm ) { // eslint-disable-line max-len, max-params
	var stl1;
	var stl2;
	var str1;
	var str2;
	var sb1;
	var sb2;
	var sx1;
	var sx2;

	stl1 = 1;
	stl2 = LDTL;
	str1 = 1;
	str2 = LDTR;
	sb1 = 1;
	sb2 = LDB;
	sx1 = 1;
	sx2 = LDX;
	return base( ltranl, ltranr, isgn, n1, n2, TL, stl1, stl2, 0, TR, str1, str2, 0, B, sb1, sb2, 0, scale, X, sx1, sx2, 0, xnorm ); // eslint-disable-line max-len
}


// EXPORTS //

export default dlasy2;
