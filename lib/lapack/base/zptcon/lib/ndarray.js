

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes the reciprocal of the condition number (in the 1-norm) of a complex.
* Hermitian positive definite tridiagonal matrix using the factorization
* A = L_D_L^H computed by zpttrf.
*
* The norm of inv(A) is computed by a direct method, and the reciprocal of
* the condition number is computed as RCOND = 1 / (ANORM * norm(inv(A))).
*
* @param {NonNegativeInteger} N - order of the matrix
* @param {Float64Array} d - diagonal elements of D from zpttrf (length N, real)
* @param {integer} strideD - stride for d
* @param {NonNegativeInteger} offsetD - starting index for d
* @param {Complex128Array} e - subdiagonal elements of L from zpttrf (length N-1, complex)
* @param {integer} strideE - stride for e (in complex elements)
* @param {NonNegativeInteger} offsetE - starting index for e (in complex elements)
* @param {number} anorm - the 1-norm of the original matrix A
* @param {Float64Array} rcond - out: rcond[0] is the reciprocal condition number
* @param {Float64Array} RWORK - workspace array of length at least N
* @param {integer} strideRWORK - stride for RWORK
* @param {NonNegativeInteger} offsetRWORK - starting index for RWORK
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info - 0 if successful
*/
function zptcon( N, d, strideD, offsetD, e, strideE, offsetE, anorm, rcond, RWORK, strideRWORK, offsetRWORK ) { // eslint-disable-line max-len, max-params
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( N, d, strideD, offsetD, e, strideE, offsetE, anorm, rcond, RWORK, strideRWORK, offsetRWORK ); // eslint-disable-line max-len
}


// EXPORTS //

export default zptcon;
