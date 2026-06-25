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
* @param {Float64Array} VT - right singular vectors (N-by-NCVT)
* @param {integer} strideVT1 - stride of first dimension of VT
* @param {integer} strideVT2 - stride of second dimension of VT
* @param {NonNegativeInteger} offsetVT - starting index for VT
* @param {Float64Array} U - left singular vectors (NRU-by-N)
* @param {integer} strideU1 - stride of first dimension of U
* @param {integer} strideU2 - stride of second dimension of U
* @param {NonNegativeInteger} offsetU - starting index for U
* @param {Float64Array} C - matrix C (N-by-NCC)
* @param {integer} strideC1 - stride of first dimension of C
* @param {integer} strideC2 - stride of second dimension of C
* @param {NonNegativeInteger} offsetC - starting index for C
* @param {Float64Array} WORK - real workspace array
* @param {integer} strideWORK - stride for WORK
* @param {NonNegativeInteger} offsetWORK - starting index for WORK
* @throws {TypeError} first argument must be a valid matrix triangle
* @throws {RangeError} second argument must be a nonnegative integer
* @returns {integer} info - 0 on success, >0 if convergence failed
*/
function dbdsqr( uplo, N, ncvt, nru, ncc, d, strideD, offsetD, e, strideE, offsetE, VT, strideVT1, strideVT2, offsetVT, U, strideU1, strideU2, offsetU, C, strideC1, strideC2, offsetC, WORK, strideWORK, offsetWORK ) {
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( N === 0 ) {
		return 0;
	}
	var minWork = ( ncvt === 0 && nru === 0 && ncc === 0 ) ? Math.max( 1, 4*N - 4 ) : Math.max( 1, 4*N );
	if ( !WORK || ( WORK.length - offsetWORK ) < minWork ) {
		throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', minWork, offsetWORK, WORK ? WORK.length : 0 ) );
	}
	return base( uplo, N, ncvt, nru, ncc, d, strideD, offsetD, e, strideE, offsetE, VT, strideVT1, strideVT2, offsetVT, U, strideU1, strideU2, offsetU, C, strideC1, strideC2, offsetC, WORK, strideWORK, offsetWORK );
}


// EXPORTS //

export default dbdsqr;
