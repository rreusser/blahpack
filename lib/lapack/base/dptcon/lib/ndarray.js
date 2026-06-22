
// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes the reciprocal of the condition number (in the 1-norm) of a real.
* symmetric positive definite tridiagonal matrix using the factorization
* A = L_D_L^T computed by dpttrf.
*
* The norm of inv(A) is computed by a direct method, and the reciprocal of
* the condition number is computed as RCOND = 1 / (ANORM * norm(inv(A))).
*
* @param {NonNegativeInteger} N - order of the matrix
* @param {Float64Array} d - diagonal elements of D from dpttrf (length N)
* @param {integer} strideD - stride for d
* @param {NonNegativeInteger} offsetD - starting index for d
* @param {Float64Array} e - subdiagonal elements of L from dpttrf (length N-1)
* @param {integer} strideE - stride for e
* @param {NonNegativeInteger} offsetE - starting index for e
* @param {number} anorm - the 1-norm of the original matrix A
* @param {Float64Array} rcond - out: rcond[0] is the reciprocal condition number
* @param {Float64Array} WORK - workspace array of length at least N
* @param {integer} strideWORK - stride for WORK
* @param {NonNegativeInteger} offsetWORK - starting index for WORK
* @returns {integer} info - 0 if successful
*/
function dptcon( N, d, strideD, offsetD, e, strideE, offsetE, anorm, rcond, WORK, strideWORK, offsetWORK ) { // eslint-disable-line max-len, max-params
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( N, d, strideD, offsetD, e, strideE, offsetE, anorm, rcond, WORK, strideWORK, offsetWORK ); // eslint-disable-line max-len
}


// EXPORTS //

export default dptcon;
