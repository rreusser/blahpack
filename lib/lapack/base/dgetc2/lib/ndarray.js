
// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Performs LU factorization with complete pivoting of a general N-by-N matrix.
*
* On exit, A contains the LU factors. IPIV(i) and JPIV(i) are the row and
* column pivots applied at step i. INFO > 0 indicates that U(INFO,INFO) is
* likely to produce overflow when used in dgesc2.
*
* IPIV and JPIV are 0-based in this implementation.
*
* @param {NonNegativeInteger} N - order of the matrix
* @param {Float64Array} A - N-by-N matrix (overwritten with L and U)
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - starting index for A
* @param {Int32Array} IPIV - row pivot indices (length N), 0-based
* @param {integer} strideIPIV - stride for IPIV
* @param {NonNegativeInteger} offsetIPIV - starting index for IPIV
* @param {Int32Array} JPIV - column pivot indices (length N), 0-based
* @param {integer} strideJPIV - stride for JPIV
* @param {NonNegativeInteger} offsetJPIV - starting index for JPIV
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info - 0 if successful, >0 if U(info,info) is small
*/
function dgetc2( N, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV, JPIV, strideJPIV, offsetJPIV ) { // eslint-disable-line max-len, max-params
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( N, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV, JPIV, strideJPIV, offsetJPIV ); // eslint-disable-line max-len
}


// EXPORTS //

export default dgetc2;
