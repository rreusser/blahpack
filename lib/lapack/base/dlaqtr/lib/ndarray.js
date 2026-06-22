
// MODULES //

import base from './base.js';


// MAIN //

/**
* Solves a real quasi-triangular system of equations.
*
* @param {boolean} ltran - ltran
* @param {boolean} lreal - lreal
* @param {NonNegativeInteger} N - number of columns
* @param {Float64Array} T - input matrix
* @param {integer} strideT1 - stride of the first dimension of `T`
* @param {integer} strideT2 - stride of the second dimension of `T`
* @param {NonNegativeInteger} offsetT - starting index for `T`
* @param {Float64Array} b - input array
* @param {integer} strideB - stride length for `b`
* @param {NonNegativeInteger} offsetB - starting index for `b`
* @param {number} w - w
* @param {Float64Array} x - input array
* @param {integer} strideX - stride length for `x`
* @param {NonNegativeInteger} offsetX - starting index for `x`
* @param {Float64Array} WORK - output array
* @param {integer} strideWORK - stride length for `WORK`
* @param {NonNegativeInteger} offsetWORK - starting index for `WORK`
* @returns {Object} result with properties: info (0=success), scale
*/
function dlaqtr( ltran, lreal, N, T, strideT1, strideT2, offsetT, b, strideB, offsetB, w, x, strideX, offsetX, WORK, strideWORK, offsetWORK ) { // eslint-disable-line max-len, max-params
	return base( ltran, lreal, N, T, strideT1, strideT2, offsetT, b, strideB, offsetB, w, x, strideX, offsetX, WORK, strideWORK, offsetWORK ); // eslint-disable-line max-len
}


// EXPORTS //

export default dlaqtr;
