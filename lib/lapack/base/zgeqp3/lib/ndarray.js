/**
 * Computes a QR factorization with column pivoting of an M-by-N matrix:.
 * `A*P = Q*R`
 * using level 3 BLAS.
 *
 * A, TAU, WORK are Complex128Arrays. Strides and offsets are in complex elements.
 * RWORK is real (Float64Array).
 *
 *
 * @param {NonNegativeInteger} M - number of rows
 * @param {NonNegativeInteger} N - number of columns
 * @param {Complex128Array} A - input/output matrix
 * @param {integer} strideA1 - first dim stride of A (complex elements)
 * @param {integer} strideA2 - second dim stride of A (complex elements)
 * @param {NonNegativeInteger} offsetA - starting index for A (complex elements)
 * @param {Int32Array} JPVT - column permutation (1-based on exit)
 * @param {integer} strideJPVT - stride for JPVT
 * @param {NonNegativeInteger} offsetJPVT - starting index for JPVT
 * @param {Complex128Array} TAU - output reflector scalars
 * @param {integer} strideTAU - stride for TAU (complex elements)
 * @param {NonNegativeInteger} offsetTAU - starting index for TAU (complex elements)
 * @param {Complex128Array} WORK - workspace
 * @param {integer} strideWORK - stride for WORK (complex elements)
 * @param {NonNegativeInteger} offsetWORK - starting index for WORK (complex elements)
 * @param {integer} lwork - workspace size in complex elements (unused)
 * @param {Float64Array} RWORK - real workspace (length >= 2*N)
 * @param {integer} strideRWORK - stride for RWORK
 * @param {NonNegativeInteger} offsetRWORK - starting index for RWORK
 * @returns {integer} info - 0 if successful
 */

/* eslint-disable max-len, max-params */

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes a QR factorization with column pivoting of an M-by-N matrix:.
*
* @param {NonNegativeInteger} M - number of rows
* @param {NonNegativeInteger} N - number of columns
* @param {Complex128Array} A - input/output matrix
* @param {integer} strideA1 - first dim stride of A (complex elements)
* @param {integer} strideA2 - second dim stride of A (complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (complex elements)
* @param {Int32Array} JPVT - column permutation (1-based on exit)
* @param {integer} strideJPVT - stride for JPVT
* @param {NonNegativeInteger} offsetJPVT - starting index for JPVT
* @param {Complex128Array} TAU - output reflector scalars
* @param {integer} strideTAU - stride for TAU (complex elements)
* @param {NonNegativeInteger} offsetTAU - starting index for TAU (complex elements)
* @param {Complex128Array} WORK - workspace
* @param {integer} strideWORK - stride for WORK (complex elements)
* @param {NonNegativeInteger} offsetWORK - starting index for WORK (complex elements)
* @param {integer} lwork - workspace size in complex elements (unused)
* @param {Float64Array} RWORK - real workspace (length >= 2*N)
* @param {integer} strideRWORK - stride for RWORK
* @param {NonNegativeInteger} offsetRWORK - starting index for RWORK
* @throws {RangeError} first argument must be a nonnegative integer
* @throws {RangeError} second argument must be a nonnegative integer
* @returns {integer} info - 0 if successful
*/
function zgeqp3( M, N, A, strideA1, strideA2, offsetA, JPVT, strideJPVT, offsetJPVT, TAU, strideTAU, offsetTAU, WORK, strideWORK, offsetWORK, lwork, RWORK, strideRWORK, offsetRWORK ) {
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( M === 0 || N === 0 ) {
		return 0;
	}
	return base( M, N, A, strideA1, strideA2, offsetA, JPVT, strideJPVT, offsetJPVT, TAU, strideTAU, offsetTAU, WORK, strideWORK, offsetWORK, lwork, RWORK, strideRWORK, offsetRWORK );
}


// EXPORTS //

export default zgeqp3;
