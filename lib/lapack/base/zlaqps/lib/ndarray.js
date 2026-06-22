/**
 * Computes a step of QR factorization with column pivoting using a.
 * blocked algorithm. It factors at most NB columns of the M-by-N
 * submatrix A(OFFSET+1:M, 1:N). The actual number of columns
 * factored is returned as kb.
 *
 * A, TAU, AUXV, F are Complex128Arrays. Strides and offsets are in complex elements.
 * VN1, VN2 are real (Float64Array).
 *
 *
 * @param {NonNegativeInteger} M - total rows of A
 * @param {NonNegativeInteger} N - columns of current submatrix
 * @param {NonNegativeInteger} offset - rows already factored
 * @param {NonNegativeInteger} nb - desired block size
 * @param {Complex128Array} A - matrix
 * @param {integer} strideA1 - first dim stride of A (complex elements)
 * @param {integer} strideA2 - second dim stride of A (complex elements)
 * @param {NonNegativeInteger} offsetA - starting index for A (complex elements)
 * @param {Int32Array} JPVT - column permutation
 * @param {integer} strideJPVT - stride for JPVT
 * @param {NonNegativeInteger} offsetJPVT - starting index for JPVT
 * @param {Complex128Array} TAU - reflector scalars
 * @param {integer} strideTAU - stride for TAU (complex elements)
 * @param {NonNegativeInteger} offsetTAU - starting index for TAU (complex elements)
 * @param {Float64Array} VN1 - partial column norms (real)
 * @param {integer} strideVN1 - stride for VN1
 * @param {NonNegativeInteger} offsetVN1 - starting index for VN1
 * @param {Float64Array} VN2 - original column norms (real)
 * @param {integer} strideVN2 - stride for VN2
 * @param {NonNegativeInteger} offsetVN2 - starting index for VN2
 * @param {Complex128Array} AUXV - auxiliary vector (length >= NB)
 * @param {integer} strideAUXV - stride for AUXV (complex elements)
 * @param {NonNegativeInteger} offsetAUXV - starting index for AUXV (complex elements)
 * @param {Complex128Array} F - panel update matrix (N-by-NB)
 * @param {integer} strideF1 - first dim stride of F (complex elements)
 * @param {integer} strideF2 - second dim stride of F (complex elements)
 * @param {NonNegativeInteger} offsetF - starting index for F (complex elements)
 * @returns {integer} kb - actual number of columns factored
 */

/* eslint-disable max-len, max-params */

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes a step of QR factorization with column pivoting using a.
*
* @param {NonNegativeInteger} M - total rows of A
* @param {NonNegativeInteger} N - columns of current submatrix
* @param {NonNegativeInteger} offset - rows already factored
* @param {NonNegativeInteger} nb - desired block size
* @param {Complex128Array} A - matrix
* @param {integer} strideA1 - first dim stride of A (complex elements)
* @param {integer} strideA2 - second dim stride of A (complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (complex elements)
* @param {Int32Array} JPVT - column permutation
* @param {integer} strideJPVT - stride for JPVT
* @param {NonNegativeInteger} offsetJPVT - starting index for JPVT
* @param {Complex128Array} TAU - reflector scalars
* @param {integer} strideTAU - stride for TAU (complex elements)
* @param {NonNegativeInteger} offsetTAU - starting index for TAU (complex elements)
* @param {Float64Array} VN1 - partial column norms (real)
* @param {integer} strideVN1 - stride for VN1
* @param {NonNegativeInteger} offsetVN1 - starting index for VN1
* @param {Float64Array} VN2 - original column norms (real)
* @param {integer} strideVN2 - stride for VN2
* @param {NonNegativeInteger} offsetVN2 - starting index for VN2
* @param {Complex128Array} AUXV - auxiliary vector (length >= NB)
* @param {integer} strideAUXV - stride for AUXV (complex elements)
* @param {NonNegativeInteger} offsetAUXV - starting index for AUXV (complex elements)
* @param {Complex128Array} F - panel update matrix (N-by-NB)
* @param {integer} strideF1 - first dim stride of F (complex elements)
* @param {integer} strideF2 - second dim stride of F (complex elements)
* @param {NonNegativeInteger} offsetF - starting index for F (complex elements)
* @throws {RangeError} first argument must be a nonnegative integer
* @throws {RangeError} second argument must be a nonnegative integer
* @throws {RangeError} fourth argument must be a nonnegative integer
* @returns {integer} kb - actual number of columns factored
*/
function zlaqps( M, N, offset, nb, A, strideA1, strideA2, offsetA, JPVT, strideJPVT, offsetJPVT, TAU, strideTAU, offsetTAU, VN1, strideVN1, offsetVN1, VN2, strideVN2, offsetVN2, AUXV, strideAUXV, offsetAUXV, F, strideF1, strideF2, offsetF ) {
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( nb < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', nb ) );
	}
	if ( M === 0 || N === 0 ) {
		return 0;
	}
	return base( M, N, offset, nb, A, strideA1, strideA2, offsetA, JPVT, strideJPVT, offsetJPVT, TAU, strideTAU, offsetTAU, VN1, strideVN1, offsetVN1, VN2, strideVN2, offsetVN2, AUXV, strideAUXV, offsetAUXV, F, strideF1, strideF2, offsetF );
}


// EXPORTS //

export default zlaqps;
