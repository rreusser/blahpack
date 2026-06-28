
// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Solves a complex system of linear equations `A * X = B` for a banded matrix.
*
* A is an N-by-N band matrix with KL subdiagonals and KU superdiagonals.
* Uses the LU factorization computed by zgbtrf.
*
* The band matrix A is stored in an array AB with 2*KL+KU+1 rows and N
* columns. The first KL rows are reserved for fill-in during factorization.
*
* On exit, AB contains the LU factors and IPIV contains the (0-based)
* pivot indices. B is overwritten with the solution matrix X.
*
* @param {NonNegativeInteger} N - order of the matrix A
* @param {NonNegativeInteger} kl - number of subdiagonals
* @param {NonNegativeInteger} ku - number of superdiagonals
* @param {NonNegativeInteger} nrhs - number of right-hand sides (columns of B)
* @param {Complex128Array} AB - band matrix in LAPACK band storage (2*KL+KU+1 by N)
* @param {integer} strideAB1 - stride of the first dimension of AB
* @param {integer} strideAB2 - stride of the second dimension of AB
* @param {NonNegativeInteger} offsetAB - starting index for AB
* @param {Int32Array} IPIV - pivot index array of length N (output, 0-based)
* @param {integer} strideIPIV - stride for IPIV
* @param {NonNegativeInteger} offsetIPIV - starting index for IPIV
* @param {Complex128Array} B - right-hand side matrix (N by NRHS)
* @param {integer} strideB1 - stride of the first dimension of B
* @param {integer} strideB2 - stride of the second dimension of B
* @param {NonNegativeInteger} offsetB - starting index for B
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info - 0 if successful, >0 if U(i,i) is zero (1-based index)
*/
function zgbsv( N, kl, ku, nrhs, AB, strideAB1, strideAB2, offsetAB, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB ) { // eslint-disable-line max-len, max-params
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( nrhs < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', nrhs ) );
	}
	return base( N, kl, ku, nrhs, AB, strideAB1, strideAB2, offsetAB, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB ); // eslint-disable-line max-len
}


// EXPORTS //

export default zgbsv;
