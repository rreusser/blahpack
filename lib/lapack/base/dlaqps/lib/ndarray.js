
// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes a step of QR factorization with column pivoting of a.
* real M-by-N matrix A by using Level 3 BLAS. It tries to factorize
* NB columns from A starting from the row OFFSET+1, and updates all
* of the matrix with Level 3 BLAS.
*
* In the description below, let K denote the actual number of columns
* factored, which is returned as kb.
*
* @param {NonNegativeInteger} M - total rows of A
* @param {NonNegativeInteger} N - columns of current submatrix
* @param {NonNegativeInteger} offset - rows already factored
* @param {NonNegativeInteger} nb - desired block size
* @param {Float64Array} A - matrix
* @param {integer} strideA1 - first dim stride of A
* @param {integer} strideA2 - second dim stride of A
* @param {NonNegativeInteger} offsetA - starting index for A
* @param {Int32Array} JPVT - column permutation
* @param {integer} strideJPVT - stride for JPVT
* @param {NonNegativeInteger} offsetJPVT - starting index for JPVT
* @param {Float64Array} TAU - reflector scalars
* @param {integer} strideTAU - stride for TAU
* @param {NonNegativeInteger} offsetTAU - starting index for TAU
* @param {Float64Array} VN1 - partial column norms
* @param {integer} strideVN1 - stride for VN1
* @param {NonNegativeInteger} offsetVN1 - starting index for VN1
* @param {Float64Array} VN2 - original column norms
* @param {integer} strideVN2 - stride for VN2
* @param {NonNegativeInteger} offsetVN2 - starting index for VN2
* @param {Float64Array} AUXV - auxiliary vector (length >= NB)
* @param {integer} strideAUXV - stride for AUXV
* @param {NonNegativeInteger} offsetAUXV - starting index for AUXV
* @param {Float64Array} F - panel update matrix (N-by-NB)
* @param {integer} strideF1 - first dim stride of F
* @param {integer} strideF2 - second dim stride of F
* @param {NonNegativeInteger} offsetF - starting index for F
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} kb - actual number of columns factored
*/
function dlaqps( M, N, offset, nb, kb, A, strideA1, strideA2, offsetA, JPVT, strideJPVT, offsetJPVT, TAU, strideTAU, offsetTAU, VN1, strideVN1, offsetVN1, VN2, strideVN2, offsetVN2, AUXV, strideAUXV, offsetAUXV, F, strideF1, strideF2, offsetF ) { // eslint-disable-line max-len, max-params
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( M, N, offset, nb, kb, A, strideA1, strideA2, offsetA, JPVT, strideJPVT, offsetJPVT, TAU, strideTAU, offsetTAU, VN1, strideVN1, offsetVN1, VN2, strideVN2, offsetVN2, AUXV, strideAUXV, offsetAUXV, F, strideF1, strideF2, offsetF ); // eslint-disable-line max-len
}


// EXPORTS //

export default dlaqps;
