
// MODULES //

import base from './base.js';


// MAIN //

/**
* Swaps adjacent diagonal 1-by-1 blocks in an upper triangular matrix pair.
*
* @param {boolean} wantq - whether to update the left transformation matrix Q
* @param {boolean} wantz - whether to update the right transformation matrix Z
* @param {NonNegativeInteger} N - order of the matrices
* @param {Complex128Array} A - upper triangular matrix A
* @param {integer} strideA1 - stride of the first dimension of `A` (complex elements)
* @param {integer} strideA2 - stride of the second dimension of `A` (complex elements)
* @param {NonNegativeInteger} offsetA - starting index for `A` (complex elements)
* @param {Complex128Array} B - upper triangular matrix B
* @param {integer} strideB1 - stride of the first dimension of `B` (complex elements)
* @param {integer} strideB2 - stride of the second dimension of `B` (complex elements)
* @param {NonNegativeInteger} offsetB - starting index for `B` (complex elements)
* @param {Complex128Array} Q - left transformation matrix
* @param {integer} strideQ1 - stride of the first dimension of `Q` (complex elements)
* @param {integer} strideQ2 - stride of the second dimension of `Q` (complex elements)
* @param {NonNegativeInteger} offsetQ - starting index for `Q` (complex elements)
* @param {Complex128Array} Z - right transformation matrix
* @param {integer} strideZ1 - stride of the first dimension of `Z` (complex elements)
* @param {integer} strideZ2 - stride of the second dimension of `Z` (complex elements)
* @param {NonNegativeInteger} offsetZ - starting index for `Z` (complex elements)
* @param {integer} j1 - index of the first block to swap (0-based)
* @returns {integer} status code (0 = success, 1 = swap rejected)
*/
function ztgex2( wantq, wantz, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, Q, strideQ1, strideQ2, offsetQ, Z, strideZ1, strideZ2, offsetZ, j1 ) { // eslint-disable-line max-len, max-params
	return base( wantq, wantz, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, Q, strideQ1, strideQ2, offsetQ, Z, strideZ1, strideZ2, offsetZ, j1 ); // eslint-disable-line max-len
}


// EXPORTS //

export default ztgex2;
