// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Merges the two sets of eigenvalues together into a single sorted set, then tries to deflate the size of the problem.
*
* @param {NonNegativeInteger} N - dimension of the symmetric tridiagonal matrix
* @param {integer} n1 - location of the last eigenvalue in the leading sub-matrix
* @param {Float64Array} d - eigenvalues of the two submatrices (length N)
* @param {integer} strideD - stride length for `d`
* @param {NonNegativeInteger} offsetD - starting index for `d`
* @param {Float64Array} Q - eigenvectors of two submatrices (N-by-N)
* @param {integer} strideQ1 - stride of the first dimension of `Q`
* @param {integer} strideQ2 - stride of the second dimension of `Q`
* @param {NonNegativeInteger} offsetQ - starting index for `Q`
* @param {Int32Array} INDXQ - permutation sorting each sub-problem (1-based values, length N)
* @param {integer} strideINDXQ - stride length for `INDXQ`
* @param {NonNegativeInteger} offsetINDXQ - starting index for `INDXQ`
* @param {number} rho - off-diagonal element associated with the rank-1 cut
* @param {Float64Array} z - updating vector (length N)
* @param {integer} strideZ - stride length for `z`
* @param {NonNegativeInteger} offsetZ - starting index for `z`
* @param {Float64Array} DLAMBDA - output: first K eigenvalues for the secular equation (length N)
* @param {integer} strideDLAMBDA - stride length for `DLAMBDA`
* @param {NonNegativeInteger} offsetDLAMBDA - starting index for `DLAMBDA`
* @param {Float64Array} w - output: first K values of the deflation-altered z-vector (length N)
* @param {integer} strideW - stride length for `w`
* @param {NonNegativeInteger} offsetW - starting index for `w`
* @param {Float64Array} Q2 - output: copy of eigenvectors for matrix multiply
* @param {integer} strideQ21 - stride length for `Q2`
* @param {NonNegativeInteger} offsetQ2 - starting index for `Q2`
* @param {Int32Array} INDX - output: permutation sorting DLAMBDA (1-based, length N)
* @param {integer} strideINDX - stride length for `INDX`
* @param {NonNegativeInteger} offsetINDX - starting index for `INDX`
* @param {Int32Array} INDXC - output: permutation arranging Q columns by type (1-based, length N)
* @param {integer} strideINDXC - stride length for `INDXC`
* @param {NonNegativeInteger} offsetINDXC - starting index for `INDXC`
* @param {Int32Array} INDXP - output: permutation placing deflated values at end (1-based, length N)
* @param {integer} strideINDXP - stride length for `INDXP`
* @param {NonNegativeInteger} offsetINDXP - starting index for `INDXP`
* @param {Int32Array} COLTYP - output: column type labels (length N)
* @param {integer} strideCOLTYP - stride length for `COLTYP`
* @param {NonNegativeInteger} offsetCOLTYP - starting index for `COLTYP`
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {Object} result object with `info`, `K`, and `rho`
*/
function dlaed2( N, n1, d, strideD, offsetD, Q, strideQ1, strideQ2, offsetQ, INDXQ, strideINDXQ, offsetINDXQ, rho, z, strideZ, offsetZ, DLAMBDA, strideDLAMBDA, offsetDLAMBDA, w, strideW, offsetW, Q2, strideQ21, offsetQ2, INDX, strideINDX, offsetINDX, INDXC, strideINDXC, offsetINDXC, INDXP, strideINDXP, offsetINDXP, COLTYP, strideCOLTYP, offsetCOLTYP ) { // eslint-disable-line max-len, max-params
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( N, n1, d, strideD, offsetD, Q, strideQ1, strideQ2, offsetQ, INDXQ, strideINDXQ, offsetINDXQ, rho, z, strideZ, offsetZ, DLAMBDA, strideDLAMBDA, offsetDLAMBDA, w, strideW, offsetW, Q2, strideQ21, offsetQ2, INDX, strideINDX, offsetINDX, INDXC, strideINDXC, offsetINDXC, INDXP, strideINDXP, offsetINDXP, COLTYP, strideCOLTYP, offsetCOLTYP ); // eslint-disable-line max-len
}


// EXPORTS //

export default dlaed2;
