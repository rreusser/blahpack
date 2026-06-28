
// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Uses the LU factorization of the n-by-n matrix Z computed by dgetc2.
* and computes a contribution to the reciprocal Dif-estimate.
*
* The factorization of Z returned by dgetc2 has the form Z = P_L_U*Q,
* where P and Q are permutation matrices.
*
* IPIV and JPIV are 0-based pivot indices from dgetc2.
*
* @param {integer} ijob - method flag: 2 uses dgecon approximation; otherwise local look-ahead
* @param {NonNegativeInteger} N - order of the matrix Z
* @param {Float64Array} Z - LU-factored N-by-N matrix from dgetc2
* @param {integer} strideZ1 - stride of the first dimension of Z
* @param {integer} strideZ2 - stride of the second dimension of Z
* @param {NonNegativeInteger} offsetZ - starting index for Z
* @param {Float64Array} RHS - right-hand side vector (overwritten with solution)
* @param {integer} strideRHS - stride for RHS
* @param {NonNegativeInteger} offsetRHS - starting index for RHS
* @param {number} rdsum - input sum of squares contribution
* @param {number} rdscal - input scaling factor
* @param {Int32Array} IPIV - row pivot indices from dgetc2, 0-based
* @param {integer} strideIPIV - stride for IPIV
* @param {NonNegativeInteger} offsetIPIV - starting index for IPIV
* @param {Int32Array} JPIV - column pivot indices from dgetc2, 0-based
* @param {integer} strideJPIV - stride for JPIV
* @param {NonNegativeInteger} offsetJPIV - starting index for JPIV
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {Object} object with rdsum and rdscal properties
*/
function dlatdf( ijob, N, Z, strideZ1, strideZ2, offsetZ, RHS, strideRHS, offsetRHS, rdsum, rdscal, IPIV, strideIPIV, offsetIPIV, JPIV, strideJPIV, offsetJPIV ) { // eslint-disable-line max-len, max-params
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( ijob, N, Z, strideZ1, strideZ2, offsetZ, RHS, strideRHS, offsetRHS, rdsum, rdscal, IPIV, strideIPIV, offsetIPIV, JPIV, strideJPIV, offsetJPIV ); // eslint-disable-line max-len
}


// EXPORTS //

export default dlatdf;
