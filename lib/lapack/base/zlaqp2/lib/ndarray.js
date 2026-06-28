/**
 * Computes a QR factorization with column pivoting of the M-by-N matrix A.
 * using an unblocked algorithm. The factored form is A_P = Q_R.
 *
 * A, TAU, WORK are Complex128Arrays. Strides and offsets are in complex elements.
 * VN1, VN2 are real (Float64Array).
 *
 *
 * @param {NonNegativeInteger} M - total number of rows of A
 * @param {NonNegativeInteger} N - number of columns of A
 * @param {NonNegativeInteger} offset - number of rows already factored
 * @param {Complex128Array} A - input/output matrix
 * @param {integer} strideA1 - stride of the first dimension of A (complex elements)
 * @param {integer} strideA2 - stride of the second dimension of A (complex elements)
 * @param {NonNegativeInteger} offsetA - starting index for A (complex elements)
 * @param {Int32Array} JPVT - column permutation array (length >= N)
 * @param {integer} strideJPVT - stride for JPVT
 * @param {NonNegativeInteger} offsetJPVT - starting index for JPVT
 * @param {Complex128Array} TAU - output reflector scalars
 * @param {integer} strideTAU - stride for TAU (complex elements)
 * @param {NonNegativeInteger} offsetTAU - starting index for TAU (complex elements)
 * @param {Float64Array} VN1 - partial column norms (real array)
 * @param {integer} strideVN1 - stride for VN1
 * @param {NonNegativeInteger} offsetVN1 - starting index for VN1
 * @param {Float64Array} VN2 - original column norms (real array)
 * @param {integer} strideVN2 - stride for VN2
 * @param {NonNegativeInteger} offsetVN2 - starting index for VN2
 * @param {Complex128Array} WORK - workspace
 * @param {integer} strideWork - stride for WORK (complex elements)
 * @param {NonNegativeInteger} offsetWork - starting index for WORK (complex elements)
 */

/* eslint-disable max-len, max-params */

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes a QR factorization with column pivoting of the M-by-N matrix A.
*
* @param {NonNegativeInteger} M - total number of rows of A
* @param {NonNegativeInteger} N - number of columns of A
* @param {NonNegativeInteger} offset - number of rows already factored
* @param {Complex128Array} A - input/output matrix
* @param {integer} strideA1 - stride of the first dimension of A (complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (complex elements)
* @param {Int32Array} JPVT - column permutation array (length >= N)
* @param {integer} strideJPVT - stride for JPVT
* @param {NonNegativeInteger} offsetJPVT - starting index for JPVT
* @param {Complex128Array} TAU - output reflector scalars
* @param {integer} strideTAU - stride for TAU (complex elements)
* @param {NonNegativeInteger} offsetTAU - starting index for TAU (complex elements)
* @param {Float64Array} VN1 - partial column norms (real array)
* @param {integer} strideVN1 - stride for VN1
* @param {NonNegativeInteger} offsetVN1 - starting index for VN1
* @param {Float64Array} VN2 - original column norms (real array)
* @param {integer} strideVN2 - stride for VN2
* @param {NonNegativeInteger} offsetVN2 - starting index for VN2
* @param {Complex128Array} WORK - workspace
* @param {integer} strideWork - stride for WORK (complex elements)
* @param {NonNegativeInteger} offsetWork - starting index for WORK (complex elements)
* @throws {RangeError} first argument must be a nonnegative integer
* @throws {RangeError} second argument must be a nonnegative integer
*/
function zlaqp2( M, N, offset, A, strideA1, strideA2, offsetA, JPVT, strideJPVT, offsetJPVT, TAU, strideTAU, offsetTAU, VN1, strideVN1, offsetVN1, VN2, strideVN2, offsetVN2, WORK, strideWork, offsetWork ) {
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( M === 0 || N === 0 ) {
		return;
	}
	return base( M, N, offset, A, strideA1, strideA2, offsetA, JPVT, strideJPVT, offsetJPVT, TAU, strideTAU, offsetTAU, VN1, strideVN1, offsetVN1, VN2, strideVN2, offsetVN2, WORK, strideWork, offsetWork );
}


// EXPORTS //

export default zlaqp2;
