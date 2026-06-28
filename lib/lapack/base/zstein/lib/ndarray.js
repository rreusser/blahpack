

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes the eigenvectors of a real symmetric tridiagonal matrix T.
* corresponding to specified eigenvalues, using inverse iteration.
* The output is stored in a complex array (imaginary parts are zero).
*
* @param {NonNegativeInteger} N - order of the matrix
* @param {Float64Array} d - diagonal elements of T, length N
* @param {integer} strideD - stride for d
* @param {NonNegativeInteger} offsetD - offset for d
* @param {Float64Array} e - subdiagonal elements of T, length N-1
* @param {integer} strideE - stride for e
* @param {NonNegativeInteger} offsetE - offset for e
* @param {NonNegativeInteger} M - number of eigenvectors to compute
* @param {Float64Array} w - eigenvalues (first M elements), grouped by block
* @param {integer} strideW - stride for w
* @param {NonNegativeInteger} offsetW - offset for w
* @param {Int32Array} IBLOCK - block indices for eigenvalues
* @param {integer} strideIBLOCK - stride for IBLOCK
* @param {NonNegativeInteger} offsetIBLOCK - offset for IBLOCK
* @param {Int32Array} ISPLIT - splitting points
* @param {integer} strideISPLIT - stride for ISPLIT
* @param {NonNegativeInteger} offsetISPLIT - offset for ISPLIT
* @param {Complex128Array} Z - output eigenvectors (N x M column-major), strides in complex elements
* @param {integer} strideZ1 - first dimension stride for Z (complex elements)
* @param {integer} strideZ2 - second dimension stride for Z (complex elements)
* @param {NonNegativeInteger} offsetZ - offset for Z (complex elements)
* @param {Float64Array} WORK - workspace of length 5*N
* @param {integer} strideWORK - stride for WORK
* @param {NonNegativeInteger} offsetWORK - offset for WORK
* @param {Int32Array} IWORK - integer workspace of length N
* @param {integer} strideIWORK - stride for IWORK
* @param {NonNegativeInteger} offsetIWORK - offset for IWORK
* @param {Int32Array} IFAIL - output, indices of non-converged eigenvectors
* @param {integer} strideIFAIL - stride for IFAIL
* @param {NonNegativeInteger} offsetIFAIL - offset for IFAIL
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info: 0 = success, >0 = number of non-converged eigenvectors
*/
function zstein( N, d, strideD, offsetD, e, strideE, offsetE, M, w, strideW, offsetW, IBLOCK, strideIBLOCK, offsetIBLOCK, ISPLIT, strideISPLIT, offsetISPLIT, Z, strideZ1, strideZ2, offsetZ, WORK, strideWORK, offsetWORK, IWORK, strideIWORK, offsetIWORK, IFAIL, strideIFAIL, offsetIFAIL ) { // eslint-disable-line max-len, max-params
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	return base( N, d, strideD, offsetD, e, strideE, offsetE, M, w, strideW, offsetW, IBLOCK, strideIBLOCK, offsetIBLOCK, ISPLIT, strideISPLIT, offsetISPLIT, Z, strideZ1, strideZ2, offsetZ, WORK, strideWORK, offsetWORK, IWORK, strideIWORK, offsetIWORK, IFAIL, strideIFAIL, offsetIFAIL ); // eslint-disable-line max-len
}


// EXPORTS //

export default zstein;
