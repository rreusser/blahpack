// MODULES //

import ndarray from './ndarray.js';


// MAIN //

/**
* Merges two sets of singular values together into a single sorted set and deflates.
*
* @private
* @param {integer} icompq - specifies whether singular vectors are to be computed
* @param {integer} nl - row dimension of the upper block
* @param {integer} nr - row dimension of the lower block
* @param {integer} sqre - 0: square lower block; 1: rectangular
* @param {Float64Array} d - singular values
* @param {Float64Array} z - updating row vector
* @param {Float64Array} ZW - workspace for z
* @param {Float64Array} VF - first components of right singular vectors
* @param {Float64Array} VFW - workspace for VF
* @param {Float64Array} VL - last components of right singular vectors
* @param {Float64Array} VLW - workspace for VL
* @param {number} alpha - diagonal element associated with the added row
* @param {number} beta - off-diagonal element associated with the added row
* @param {Float64Array} DSIGMA - output singular values in secular equation
* @param {Int32Array} IDX - permutation to sort D
* @param {Int32Array} IDXP - permutation to place deflated values at end
* @param {Int32Array} IDXQ - permutation sorting each sub-problem
* @param {Int32Array} PERM - permutations from deflation and sorting
* @param {Int32Array} GIVCOL - pairs of columns for Givens rotations
* @param {integer} LDGCOL - leading dimension of GIVCOL
* @param {Float64Array} GIVNUM - C and S values for Givens rotations
* @param {integer} LDGNUM - leading dimension of GIVNUM
* @returns {Object} object with fields: `info`, `K`, `givptr`, `c`, `s`
*/
function dlasd7( icompq, nl, nr, sqre, d, z, ZW, VF, VFW, VL, VLW, alpha, beta, DSIGMA, IDX, IDXP, IDXQ, PERM, GIVCOL, LDGCOL, GIVNUM, LDGNUM ) { // eslint-disable-line max-len, max-params
	var N = nl + nr + 1; // eslint-disable-line no-unused-vars
	return ndarray( icompq, nl, nr, sqre, d, 1, 0, z, 1, 0, ZW, 1, 0, VF, 1, 0, VFW, 1, 0, VL, 1, 0, VLW, 1, 0, alpha, beta, DSIGMA, 1, 0, IDX, 1, 0, IDXP, 1, 0, IDXQ, 1, 0, PERM, 1, 0, GIVCOL, 1, LDGCOL, 0, GIVNUM, 1, LDGNUM, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default dlasd7;
