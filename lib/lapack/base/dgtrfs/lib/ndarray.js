
// MODULES //

import isTransposeOperation from '@stdlib/blas/base/assert/is-transpose-operation/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Improves the computed solution to a system of linear equations when.
* the coefficient matrix is tridiagonal, and provides error bounds
* and backward error estimates for the solution.
*
* @param {string} trans - 'no-transpose' or 'transpose'
* @param {NonNegativeInteger} N - order of the matrix A
* @param {NonNegativeInteger} nrhs - number of right hand sides
* @param {Float64Array} DL - sub-diagonal of original A (length N-1)
* @param {integer} strideDL - stride for DL
* @param {NonNegativeInteger} offsetDL - offset for DL
* @param {Float64Array} d - diagonal of original A (length N)
* @param {integer} strideD - stride for d
* @param {NonNegativeInteger} offsetD - offset for d
* @param {Float64Array} DU - super-diagonal of original A (length N-1)
* @param {integer} strideDU - stride for DU
* @param {NonNegativeInteger} offsetDU - offset for DU
* @param {Float64Array} DLF - factored sub-diagonal from dgttrf
* @param {integer} strideDLF - stride for DLF
* @param {NonNegativeInteger} offsetDLF - offset for DLF
* @param {Float64Array} DF - factored diagonal from dgttrf
* @param {integer} strideDF - stride for DF
* @param {NonNegativeInteger} offsetDF - offset for DF
* @param {Float64Array} DUF - factored super-diagonal from dgttrf
* @param {integer} strideDUF - stride for DUF
* @param {NonNegativeInteger} offsetDUF - offset for DUF
* @param {Float64Array} DU2 - second superdiagonal from dgttrf
* @param {integer} strideDU2 - stride for DU2
* @param {NonNegativeInteger} offsetDU2 - offset for DU2
* @param {Int32Array} IPIV - pivot indices from dgttrf (0-based)
* @param {integer} strideIPIV - stride for IPIV
* @param {NonNegativeInteger} offsetIPIV - offset for IPIV
* @param {Float64Array} B - right hand side matrix (N x NRHS)
* @param {integer} strideB1 - row stride of B
* @param {integer} strideB2 - column stride of B
* @param {NonNegativeInteger} offsetB - offset for B
* @param {Float64Array} X - solution matrix (N x NRHS), refined on output
* @param {integer} strideX1 - row stride of X
* @param {integer} strideX2 - column stride of X
* @param {NonNegativeInteger} offsetX - offset for X
* @param {Float64Array} FERR - output: forward error bound for each RHS
* @param {integer} strideFERR - stride for FERR
* @param {NonNegativeInteger} offsetFERR - offset for FERR
* @param {Float64Array} BERR - output: backward error for each RHS
* @param {integer} strideBERR - stride for BERR
* @param {NonNegativeInteger} offsetBERR - offset for BERR
* @param {Float64Array} WORK - workspace of length at least 3*N
* @param {integer} strideWORK - stride for WORK
* @param {NonNegativeInteger} offsetWORK - offset for WORK
* @param {Int32Array} IWORK - integer workspace of length at least N
* @param {integer} strideIWORK - stride for IWORK
* @param {NonNegativeInteger} offsetIWORK - offset for IWORK
* @throws {TypeError} First argument must be a valid transpose operation
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info - 0 if successful
*/
function dgtrfs( trans, N, nrhs, DL, strideDL, offsetDL, d, strideD, offsetD, DU, strideDU, offsetDU, DLF, strideDLF, offsetDLF, DF, strideDF, offsetDF, DUF, strideDUF, offsetDUF, DU2, strideDU2, offsetDU2, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWORK, offsetWORK, IWORK, strideIWORK, offsetIWORK ) { // eslint-disable-line max-len, max-params
	if ( !isTransposeOperation( trans ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid transpose operation. Value: `%s`.', trans ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( nrhs < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', nrhs ) );
	}
	var minWork = 3 * N;
	if ( !WORK || ( WORK.length - offsetWORK ) < minWork ) {
		throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', minWork, offsetWORK, ( WORK ) ? WORK.length : 0 ) );
	}
	return base( trans, N, nrhs, DL, strideDL, offsetDL, d, strideD, offsetD, DU, strideDU, offsetDU, DLF, strideDLF, offsetDLF, DF, strideDF, offsetDF, DUF, strideDUF, offsetDUF, DU2, strideDU2, offsetDU2, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWORK, offsetWORK, IWORK, strideIWORK, offsetIWORK ); // eslint-disable-line max-len
}


// EXPORTS //

export default dgtrfs;
