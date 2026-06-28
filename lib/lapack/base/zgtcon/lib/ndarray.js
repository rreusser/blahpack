
// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Estimates the reciprocal of the condition number of a complex general.
* tridiagonal matrix A, in either the 1-norm or the infinity-norm, using
* the LU factorization computed by zgttrf.
*
* An estimate is obtained for norm(inv(A)), and the reciprocal of the
* condition number is computed as RCOND = 1 / (ANORM * norm(inv(A))).
*
* @param {string} norm - 'one-norm' for 1-norm, 'inf-norm' for infinity-norm
* @param {NonNegativeInteger} N - order of the matrix A
* @param {Complex128Array} DL - multipliers from zgttrf (length N-1)
* @param {integer} strideDL - stride for DL (complex elements)
* @param {NonNegativeInteger} offsetDL - starting index for DL (complex elements)
* @param {Complex128Array} d - diagonal of U from zgttrf (length N)
* @param {integer} strideD - stride for d (complex elements)
* @param {NonNegativeInteger} offsetD - starting index for d (complex elements)
* @param {Complex128Array} DU - first superdiagonal of U from zgttrf (length N-1)
* @param {integer} strideDU - stride for DU (complex elements)
* @param {NonNegativeInteger} offsetDU - starting index for DU (complex elements)
* @param {Complex128Array} DU2 - second superdiagonal of U from zgttrf (length N-2)
* @param {integer} strideDU2 - stride for DU2 (complex elements)
* @param {NonNegativeInteger} offsetDU2 - starting index for DU2 (complex elements)
* @param {Int32Array} IPIV - pivot indices from zgttrf (0-based, length N)
* @param {integer} strideIPIV - stride for IPIV
* @param {NonNegativeInteger} offsetIPIV - starting index for IPIV
* @param {number} anorm - the 1-norm or infinity-norm of the original matrix
* @param {Float64Array} rcond - out: rcond[0] is the reciprocal condition number
* @param {Complex128Array} WORK - workspace array of length at least 2*N
* @param {integer} strideWork - stride for WORK (complex elements)
* @param {NonNegativeInteger} offsetWork - starting index for WORK (complex elements)
* @throws {TypeError} if a string argument is not a valid option
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info - 0 if successful
*/
function zgtcon( norm, N, DL, strideDL, offsetDL, d, strideD, offsetD, DU, strideDU, offsetDU, DU2, strideDU2, offsetDU2, IPIV, strideIPIV, offsetIPIV, anorm, rcond, WORK, strideWork, offsetWork ) { // eslint-disable-line max-len, max-params
	if ( norm !== 'max' && norm !== 'one-norm' && norm !== 'inf-norm' && norm !== 'frobenius' ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid norm value. Value: `%s`.', norm ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( norm, N, DL, strideDL, offsetDL, d, strideD, offsetD, DU, strideDU, offsetDU, DU2, strideDU2, offsetDU2, IPIV, strideIPIV, offsetIPIV, anorm, rcond, WORK, strideWork, offsetWork ); // eslint-disable-line max-len
}


// EXPORTS //

export default zgtcon;
