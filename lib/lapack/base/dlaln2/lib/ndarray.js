
// MODULES //

import base from './base.js';


// MAIN //

/**
* Solves a 1-by-1 or 2-by-2 linear system of the form:.
*
*   (ca_A    - w_D) _ X = scale _ B  (if ltrans = false)
*   (ca_A__T - w_D) _ X = scale _ B  (if ltrans = true)
*
* where A is NA-by-NA (NA = 1 or 2), w = (wr, wi), D is an NA-by-NA
* diagonal matrix, and scale is chosen (0 < scale <= 1) to prevent overflow.
*
* @param {boolean} ltrans - if true, solve transposed system
* @param {integer} na - order of A (1 or 2)
* @param {integer} nw - 1 for real, 2 for complex system
* @param {number} smin - lower bound on singular values; clamped to machine threshold
* @param {number} ca - scalar multiplier for A
* @param {Float64Array} A - matrix A
* @param {integer} strideA1 - first dimension stride of A
* @param {integer} strideA2 - second dimension stride of A
* @param {NonNegativeInteger} offsetA - starting index for A
* @param {number} d1 - D(1,1) diagonal element
* @param {number} d2 - D(2,2) diagonal element
* @param {Float64Array} B - right-hand side matrix
* @param {integer} strideB1 - first dimension stride of B
* @param {integer} strideB2 - second dimension stride of B
* @param {NonNegativeInteger} offsetB - starting index for B
* @param {number} wr - real part of the scalar w
* @param {number} wi - imaginary part of the scalar w
* @param {Float64Array} X - output matrix (solution)
* @param {integer} strideX1 - first dimension stride of X
* @param {integer} strideX2 - second dimension stride of X
* @param {NonNegativeInteger} offsetX - starting index for X
* @returns {Object} result with properties: info (0=exact, 1=perturbed), scale, xnorm
*/
function dlaln2( ltrans, na, nw, smin, ca, A, strideA1, strideA2, offsetA, d1, d2, B, strideB1, strideB2, offsetB, wr, wi, X, strideX1, strideX2, offsetX, scale, xnorm ) { // eslint-disable-line max-len, max-params
	return base( ltrans, na, nw, smin, ca, A, strideA1, strideA2, offsetA, d1, d2, B, strideB1, strideB2, offsetB, wr, wi, X, strideX1, strideX2, offsetX, scale, xnorm ); // eslint-disable-line max-len
}


// EXPORTS //

export default dlaln2;
