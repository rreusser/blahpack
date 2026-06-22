
// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Solves a system of linear equations A _ X = scale _ RHS with a general.
* N-by-N matrix A using the LU factorization with complete pivoting computed
* by dgetc2.
*
* IPIV and JPIV are 0-based pivot indices from dgetc2.
*
* @param {NonNegativeInteger} N - order of the matrix A
* @param {Float64Array} A - LU-factored N-by-N matrix from dgetc2
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - starting index for A
* @param {Float64Array} RHS - right-hand side vector (overwritten with solution)
* @param {integer} strideRHS - stride for RHS
* @param {NonNegativeInteger} offsetRHS - starting index for RHS
* @param {Int32Array} IPIV - row pivot indices from dgetc2, 0-based
* @param {integer} strideIPIV - stride for IPIV
* @param {NonNegativeInteger} offsetIPIV - starting index for IPIV
* @param {Int32Array} JPIV - column pivot indices from dgetc2, 0-based
* @param {integer} strideJPIV - stride for JPIV
* @param {NonNegativeInteger} offsetJPIV - starting index for JPIV
* @param {Float64Array} scale - output: scale[0] receives the scaling factor
*/
function dgesc2( N, A, strideA1, strideA2, offsetA, RHS, strideRHS, offsetRHS, IPIV, strideIPIV, offsetIPIV, JPIV, strideJPIV, offsetJPIV, scale ) { // eslint-disable-line max-len, max-params
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( N, A, strideA1, strideA2, offsetA, RHS, strideRHS, offsetRHS, IPIV, strideIPIV, offsetIPIV, JPIV, strideJPIV, offsetJPIV, scale ); // eslint-disable-line max-len
}


// EXPORTS //

export default dgesc2;
