
// MODULES //

import base from './base.js';


// MAIN //

/**
* Solves for the N1-by-N2 matrix X in:.
*
*   op(TL)_X + ISGN_X_op(TR) = SCALE_B
*
* where TL is N1-by-N1, TR is N2-by-N2, B is N1-by-N2, and 1 <= N1,N2 <= 2.
*
* @param {boolean} ltranl - if true, use transpose of TL
* @param {boolean} ltranr - if true, use transpose of TR
* @param {integer} isgn - +1 or -1
* @param {integer} n1 - order of TL (1 or 2)
* @param {integer} n2 - order of TR (1 or 2)
* @param {Float64Array} TL - N1-by-N1 matrix
* @param {integer} strideTL1 - stride of the first dimension of `TL`
* @param {integer} strideTL2 - stride of the second dimension of `TL`
* @param {NonNegativeInteger} offsetTL - starting index for `TL`
* @param {Float64Array} TR - N2-by-N2 matrix
* @param {integer} strideTR1 - stride of the first dimension of `TR`
* @param {integer} strideTR2 - stride of the second dimension of `TR`
* @param {NonNegativeInteger} offsetTR - starting index for `TR`
* @param {Float64Array} B - N1-by-N2 right-hand side
* @param {integer} strideB1 - stride of the first dimension of `B`
* @param {integer} strideB2 - stride of the second dimension of `B`
* @param {NonNegativeInteger} offsetB - starting index for `B`
* @param {Float64Array} scale - output: scale[0] is the scaling factor
* @param {Float64Array} X - output N1-by-N2 solution matrix
* @param {integer} strideX1 - stride of the first dimension of `X`
* @param {integer} strideX2 - stride of the second dimension of `X`
* @param {NonNegativeInteger} offsetX - starting index for `X`
* @param {Float64Array} xnorm - output: xnorm[0] is the infinity-norm of X
* @returns {integer} info (0 = success, 1 = TL and TR have too-close eigenvalues)
*/
function dlasy2( ltranl, ltranr, isgn, n1, n2, TL, strideTL1, strideTL2, offsetTL, TR, strideTR1, strideTR2, offsetTR, B, strideB1, strideB2, offsetB, scale, X, strideX1, strideX2, offsetX, xnorm ) { // eslint-disable-line max-len, max-params
	return base( ltranl, ltranr, isgn, n1, n2, TL, strideTL1, strideTL2, offsetTL, TR, strideTR1, strideTR2, offsetTR, B, strideB1, strideB2, offsetB, scale, X, strideX1, strideX2, offsetX, xnorm ); // eslint-disable-line max-len
}


// EXPORTS //

export default dlasy2;
