
// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Solves a system of linear equations `A * X = scale * RHS` with a general.
* N-by-N matrix A using the LU factorization with complete pivoting computed
* by zgetc2.
*
* IPIV and JPIV are 0-based in this implementation.
*
* @param {NonNegativeInteger} N - order of the matrix A
* @param {Complex128Array} A - LU-factored N-by-N matrix from zgetc2
* @param {integer} strideA1 - stride of the first dimension of A (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (in complex elements)
* @param {Complex128Array} RHS - right-hand side vector (overwritten with solution)
* @param {integer} strideRHS - stride for RHS (in complex elements)
* @param {NonNegativeInteger} offsetRHS - starting index for RHS (in complex elements)
* @param {Int32Array} IPIV - row pivot indices from zgetc2, 0-based
* @param {integer} strideIPIV - stride for IPIV
* @param {NonNegativeInteger} offsetIPIV - starting index for IPIV
* @param {Int32Array} JPIV - column pivot indices from zgetc2, 0-based
* @param {integer} strideJPIV - stride for JPIV
* @param {NonNegativeInteger} offsetJPIV - starting index for JPIV
* @param {Float64Array} scale - output: `scale[0]` receives the scaling factor
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {void}
*/
function zgesc2( N, A, strideA1, strideA2, offsetA, RHS, strideRHS, offsetRHS, IPIV, strideIPIV, offsetIPIV, JPIV, strideJPIV, offsetJPIV, scale ) { // eslint-disable-line max-len, max-params
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( N, A, strideA1, strideA2, offsetA, RHS, strideRHS, offsetRHS, IPIV, strideIPIV, offsetIPIV, JPIV, strideJPIV, offsetJPIV, scale ); // eslint-disable-line max-len
}


// EXPORTS //

export default zgesc2;
