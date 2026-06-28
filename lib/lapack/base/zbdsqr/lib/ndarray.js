/**
 * Returns |a| with the sign of b (Fortran SIGN intrinsic).
 *
 *
 * @param {number} a - magnitude source
 * @param {number} b - sign source
 * @throws {TypeError} First argument must be a valid matrix triangle
 * @returns {number} |a| * sign(b)
 */

/* eslint-disable max-len, max-params */

// MODULES //

import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes the singular values and, optionally, the right and/or left.
*
* @param {string} uplo - `'upper'` for upper bidiagonal, `'lower'` for lower bidiagonal
* @param {NonNegativeInteger} N - order of the bidiagonal matrix
* @param {NonNegativeInteger} ncvt - number of columns in VT
* @param {NonNegativeInteger} nru - number of rows in U
* @param {NonNegativeInteger} ncc - number of columns in C
* @param {Float64Array} d - diagonal elements (length N), real
* @param {integer} strideD - stride for `d`
* @param {NonNegativeInteger} offsetD - starting index for `d`
* @param {Float64Array} e - off-diagonal elements (length N-1), real
* @param {integer} strideE - stride for `e`
* @param {NonNegativeInteger} offsetE - starting index for `e`
* @param {Complex128Array} VT - right singular vectors
* @param {integer} strideVT1 - stride of first dimension of VT (complex elements)
* @param {integer} strideVT2 - stride of second dimension of VT (complex elements)
* @param {NonNegativeInteger} offsetVT - starting index for VT (complex elements)
* @param {Complex128Array} U - left singular vectors
* @param {integer} strideU1 - stride of first dimension of U (complex elements)
* @param {integer} strideU2 - stride of second dimension of U (complex elements)
* @param {NonNegativeInteger} offsetU - starting index for U (complex elements)
* @param {Complex128Array} C - matrix C
* @param {integer} strideC1 - stride of first dimension of C (complex elements)
* @param {integer} strideC2 - stride of second dimension of C (complex elements)
* @param {NonNegativeInteger} offsetC - starting index for C (complex elements)
* @param {Float64Array} RWORK - real workspace array
* @param {integer} strideRWork - stride for RWORK
* @param {NonNegativeInteger} offsetRWork - starting index for RWORK
* @throws {TypeError} first argument must be a valid matrix triangle
* @throws {RangeError} second argument must be a nonnegative integer
* @returns {integer} info - 0 on success, >0 if convergence failed
*/
function zbdsqr( uplo, N, ncvt, nru, ncc, d, strideD, offsetD, e, strideE, offsetE, VT, strideVT1, strideVT2, offsetVT, U, strideU1, strideU2, offsetU, C, strideC1, strideC2, offsetC, RWORK, strideRWork, offsetRWork ) {
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( N === 0 ) {
		return 0;
	}
	return base( uplo, N, ncvt, nru, ncc, d, strideD, offsetD, e, strideE, offsetE, VT, strideVT1, strideVT2, offsetVT, U, strideU1, strideU2, offsetU, C, strideC1, strideC2, offsetC, RWORK, strideRWork, offsetRWork );
}


// EXPORTS //

export default zbdsqr;
