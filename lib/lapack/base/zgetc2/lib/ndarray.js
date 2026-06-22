
// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes an LU factorization with complete pivoting of a general N-by-N complex matrix.
*
* The factorization has the form `A = P * L * U * Q`, where P and Q are
* permutation matrices, L is lower triangular with unit diagonal elements,
* and U is upper triangular.
*
* IPIV and JPIV are 0-based in this implementation.
*
* @param {NonNegativeInteger} N - order of the matrix
* @param {Complex128Array} A - N-by-N complex matrix (overwritten with L and U)
* @param {integer} strideA1 - stride of the first dimension of A (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (in complex elements)
* @param {Int32Array} IPIV - row pivot indices (length N), 0-based
* @param {integer} strideIPIV - stride for IPIV
* @param {NonNegativeInteger} offsetIPIV - starting index for IPIV
* @param {Int32Array} JPIV - column pivot indices (length N), 0-based
* @param {integer} strideJPIV - stride for JPIV
* @param {NonNegativeInteger} offsetJPIV - starting index for JPIV
* @returns {integer} info - 0 if successful, >0 if U(info,info) is small
*/
function zgetc2( N, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV, JPIV, strideJPIV, offsetJPIV ) { // eslint-disable-line max-len, max-params
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( N, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV, JPIV, strideJPIV, offsetJPIV ); // eslint-disable-line max-len
}


// EXPORTS //

export default zgetc2;
