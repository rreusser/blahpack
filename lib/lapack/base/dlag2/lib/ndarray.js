
// MODULES //

import base from './base.js';


// MAIN //

/**
* Computes the eigenvalues of a 2-by-2 generalized eigenvalue problem `A - w B`, with scaling as necessary to avoid over-/underflow.
*
* The scaling factor `s` results in a modified eigenvalue equation `s A - w B`
* where `s` is a non-negative scaling factor chosen so that `w`, `w B`, and
* `s A` do not overflow and, if possible, do not underflow, either.
*
* @param {Float64Array} A - input 2-by-2 matrix A
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Float64Array} B - input 2-by-2 upper triangular matrix B
* @param {integer} strideB1 - stride of the first dimension of `B`
* @param {integer} strideB2 - stride of the second dimension of `B`
* @param {NonNegativeInteger} offsetB - starting index for `B`
* @param {number} safmin - smallest positive number such that `1/safmin` does not overflow
* @returns {Object} object with fields: scale1, scale2, wr1, wr2, wi
*/
function dlag2( A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, safmin ) { // eslint-disable-line max-len, max-params
	return base( A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, safmin ); // eslint-disable-line max-len
}


// EXPORTS //

export default dlag2;
