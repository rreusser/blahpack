/* eslint-disable max-len, max-params */

/**
* @license Apache-2.0
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

// MODULES //

import base from './base.js';


// MAIN //

/**
* Merges the two sets of singular values together into a single sorted set. Then it tries to deflate the size of the problem.
*
* @param {integer} icompq - specifies whether singular vectors are to be computed (0: singular values only, 1: compact form)
* @param {integer} nl - row dimension of the upper block (nl >= 1)
* @param {integer} nr - row dimension of the lower block (nr >= 1)
* @param {integer} sqre - 0: lower block is square; 1: lower block is rectangular
* @param {Float64Array} d - singular values array of dimension N = nl + nr + 1
* @param {integer} strideD - stride for `d`
* @param {NonNegativeInteger} offsetD - starting index for `d`
* @param {Float64Array} z - updating row vector of dimension M = N + sqre
* @param {integer} strideZ - stride for `z`
* @param {NonNegativeInteger} offsetZ - starting index for `z`
* @param {Float64Array} ZW - workspace for z (dimension M)
* @param {integer} strideZW - stride for `ZW`
* @param {NonNegativeInteger} offsetZW - starting index for `ZW`
* @param {Float64Array} VF - first components of right singular vectors (dimension M)
* @param {integer} strideVF - stride for `VF`
* @param {NonNegativeInteger} offsetVF - starting index for `VF`
* @param {Float64Array} VFW - workspace for VF (dimension M)
* @param {integer} strideVFW - stride for `VFW`
* @param {NonNegativeInteger} offsetVFW - starting index for `VFW`
* @param {Float64Array} VL - last components of right singular vectors (dimension M)
* @param {integer} strideVL - stride for `VL`
* @param {NonNegativeInteger} offsetVL - starting index for `VL`
* @param {Float64Array} VLW - workspace for VL (dimension M)
* @param {integer} strideVLW - stride for `VLW`
* @param {NonNegativeInteger} offsetVLW - starting index for `VLW`
* @param {number} alpha - diagonal element associated with the added row
* @param {number} beta - off-diagonal element associated with the added row
* @param {Float64Array} DSIGMA - output array for singular values in secular equation (dimension N)
* @param {integer} strideDSIGMA - stride for `DSIGMA`
* @param {NonNegativeInteger} offsetDSIGMA - starting index for `DSIGMA`
* @param {Int32Array} IDX - permutation to sort D into ascending order (dimension N)
* @param {integer} strideIDX - stride for `IDX`
* @param {NonNegativeInteger} offsetIDX - starting index for `IDX`
* @param {Int32Array} IDXP - permutation to place deflated values at end (dimension N)
* @param {integer} strideIDXP - stride for `IDXP`
* @param {NonNegativeInteger} offsetIDXP - starting index for `IDXP`
* @param {Int32Array} IDXQ - permutation sorting each sub-problem (dimension N)
* @param {integer} strideIDXQ - stride for `IDXQ`
* @param {NonNegativeInteger} offsetIDXQ - starting index for `IDXQ`
* @param {Int32Array} PERM - permutations from deflation and sorting (dimension N, not referenced if icompq=0)
* @param {integer} stridePERM - stride for `PERM`
* @param {NonNegativeInteger} offsetPERM - starting index for `PERM`
* @param {Int32Array} GIVCOL - pairs of columns for Givens rotations (dimension (LDGCOL, 2), not referenced if icompq=0)
* @param {integer} strideGIVCOL1 - first dimension stride for `GIVCOL`
* @param {integer} strideGIVCOL2 - second dimension stride for `GIVCOL`
* @param {NonNegativeInteger} offsetGIVCOL - starting index for `GIVCOL`
* @param {Float64Array} GIVNUM - C and S values for Givens rotations (dimension (LDGNUM, 2), not referenced if icompq=0)
* @param {integer} strideGIVNUM1 - first dimension stride for `GIVNUM`
* @param {integer} strideGIVNUM2 - second dimension stride for `GIVNUM`
* @param {NonNegativeInteger} offsetGIVNUM - starting index for `GIVNUM`
* @returns {Object} object with fields: `info` (0 = success), `K` (dimension of non-deflated matrix), `givptr` (number of Givens rotations), `c` (cosine of Givens rotation for null space), `s` (sine of Givens rotation for null space)
*/
function dlasd7( icompq, nl, nr, sqre, d, strideD, offsetD, z, strideZ, offsetZ, ZW, strideZW, offsetZW, VF, strideVF, offsetVF, VFW, strideVFW, offsetVFW, VL, strideVL, offsetVL, VLW, strideVLW, offsetVLW, alpha, beta, DSIGMA, strideDSIGMA, offsetDSIGMA, IDX, strideIDX, offsetIDX, IDXP, strideIDXP, offsetIDXP, IDXQ, strideIDXQ, offsetIDXQ, PERM, stridePERM, offsetPERM, GIVCOL, strideGIVCOL1, strideGIVCOL2, offsetGIVCOL, GIVNUM, strideGIVNUM1, strideGIVNUM2, offsetGIVNUM ) {
	return base( icompq, nl, nr, sqre, d, strideD, offsetD, z, strideZ, offsetZ, ZW, strideZW, offsetZW, VF, strideVF, offsetVF, VFW, strideVFW, offsetVFW, VL, strideVL, offsetVL, VLW, strideVLW, offsetVLW, alpha, beta, DSIGMA, strideDSIGMA, offsetDSIGMA, IDX, strideIDX, offsetIDX, IDXP, strideIDXP, offsetIDXP, IDXQ, strideIDXQ, offsetIDXQ, PERM, stridePERM, offsetPERM, GIVCOL, strideGIVCOL1, strideGIVCOL2, offsetGIVCOL, GIVNUM, strideGIVNUM1, strideGIVNUM2, offsetGIVNUM );
}


// EXPORTS //

export default dlasd7;
