
// MODULES //

import isTransposeOperation from '@stdlib/blas/base/assert/is-transpose-operation/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Improves the computed solution to a complex tridiagonal system and provides error bounds.
*
* @param {string} trans - specifies the form of the system
* @param {NonNegativeInteger} N - order of the matrix A
* @param {NonNegativeInteger} nrhs - number of right-hand side columns
* @param {Complex128Array} DL - sub-diagonal of original A (length N-1)
* @param {integer} strideDL - stride for DL (complex elements)
* @param {NonNegativeInteger} offsetDL - offset for DL (complex elements)
* @param {Complex128Array} d - diagonal of original A (length N)
* @param {integer} strideD - stride for d (complex elements)
* @param {NonNegativeInteger} offsetD - offset for d (complex elements)
* @param {Complex128Array} DU - super-diagonal of original A (length N-1)
* @param {integer} strideDU - stride for DU (complex elements)
* @param {NonNegativeInteger} offsetDU - offset for DU (complex elements)
* @param {Complex128Array} DLF - factored sub-diagonal from zgttrf (length N-1)
* @param {integer} strideDLF - stride for DLF (complex elements)
* @param {NonNegativeInteger} offsetDLF - offset for DLF (complex elements)
* @param {Complex128Array} DF - factored diagonal from zgttrf (length N)
* @param {integer} strideDF - stride for DF (complex elements)
* @param {NonNegativeInteger} offsetDF - offset for DF (complex elements)
* @param {Complex128Array} DUF - factored super-diagonal from zgttrf (length N-1)
* @param {integer} strideDUF - stride for DUF (complex elements)
* @param {NonNegativeInteger} offsetDUF - offset for DUF (complex elements)
* @param {Complex128Array} DU2 - second superdiagonal from zgttrf (length N-2)
* @param {integer} strideDU2 - stride for DU2 (complex elements)
* @param {NonNegativeInteger} offsetDU2 - offset for DU2 (complex elements)
* @param {Int32Array} IPIV - pivot indices from zgttrf (0-based)
* @param {integer} strideIPIV - stride for IPIV
* @param {NonNegativeInteger} offsetIPIV - offset for IPIV
* @param {Complex128Array} B - right-hand side matrix (N x NRHS)
* @param {integer} strideB1 - stride of the first dimension of B (complex elements)
* @param {integer} strideB2 - stride of the second dimension of B (complex elements)
* @param {NonNegativeInteger} offsetB - offset for B (complex elements)
* @param {Complex128Array} X - solution matrix (N x NRHS), refined on output
* @param {integer} strideX1 - stride of the first dimension of X (complex elements)
* @param {integer} strideX2 - stride of the second dimension of X (complex elements)
* @param {NonNegativeInteger} offsetX - offset for X (complex elements)
* @param {Float64Array} FERR - output forward error bounds (length nrhs)
* @param {integer} strideFERR - stride for FERR
* @param {NonNegativeInteger} offsetFERR - offset for FERR
* @param {Float64Array} BERR - output backward error bounds (length nrhs)
* @param {integer} strideBERR - stride for BERR
* @param {NonNegativeInteger} offsetBERR - offset for BERR
* @param {Complex128Array} WORK - workspace of length >= 2*N complex elements
* @param {integer} strideWORK - stride for WORK (complex elements)
* @param {NonNegativeInteger} offsetWORK - offset for WORK (complex elements)
* @param {Float64Array} RWORK - real workspace of length >= N
* @param {integer} strideRWORK - stride for RWORK
* @param {NonNegativeInteger} offsetRWORK - offset for RWORK
* @throws {TypeError} First argument must be a valid transpose operation
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info - 0 if successful
*/
function zgtrfs( trans, N, nrhs, DL, strideDL, offsetDL, d, strideD, offsetD, DU, strideDU, offsetDU, DLF, strideDLF, offsetDLF, DF, strideDF, offsetDF, DUF, strideDUF, offsetDUF, DU2, strideDU2, offsetDU2, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWORK, offsetWORK, RWORK, strideRWORK, offsetRWORK ) { // eslint-disable-line max-len, max-params
	if ( !isTransposeOperation( trans ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid transpose operation. Value: `%s`.', trans ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( nrhs < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', nrhs ) );
	}
	return base( trans, N, nrhs, DL, strideDL, offsetDL, d, strideD, offsetD, DU, strideDU, offsetDU, DLF, strideDLF, offsetDLF, DF, strideDF, offsetDF, DUF, strideDUF, offsetDUF, DU2, strideDU2, offsetDU2, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWORK, offsetWORK, RWORK, strideRWORK, offsetRWORK ); // eslint-disable-line max-len
}


// EXPORTS //

export default zgtrfs;
