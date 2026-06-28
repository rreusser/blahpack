
// MODULES //

import isTransposeOperation from '@stdlib/blas/base/assert/is-transpose-operation/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Uses the LU factorization to compute the solution to a real system of.
* linear equations A_X = B, A^T_X = B, or A^H*X = B, where A is a
* tridiagonal matrix of order N and X and B are N-by-NRHS matrices.
*
* Error bounds on the solution and a condition estimate are also provided.
*
* @param {string} fact - 'not-factored' or 'factored'
* @param {string} trans - 'no-transpose' or 'transpose'
* @param {NonNegativeInteger} N - order of the matrix A
* @param {NonNegativeInteger} nrhs - number of right hand sides
* @param {Float64Array} DL - sub-diagonal of A (length N-1)
* @param {integer} strideDL - stride for DL
* @param {NonNegativeInteger} offsetDL - offset for DL
* @param {Float64Array} d - diagonal of A (length N)
* @param {integer} strideD - stride for d
* @param {NonNegativeInteger} offsetD - offset for d
* @param {Float64Array} DU - super-diagonal of A (length N-1)
* @param {integer} strideDU - stride for DU
* @param {NonNegativeInteger} offsetDU - offset for DU
* @param {Float64Array} DLF - factored sub-diagonal (length N-1), input if fact='factored', output if fact='not-factored'
* @param {integer} strideDLF - stride for DLF
* @param {NonNegativeInteger} offsetDLF - offset for DLF
* @param {Float64Array} DF - factored diagonal (length N), input if fact='factored', output if fact='not-factored'
* @param {integer} strideDF - stride for DF
* @param {NonNegativeInteger} offsetDF - offset for DF
* @param {Float64Array} DUF - factored super-diagonal (length N-1), input if fact='factored', output if fact='not-factored'
* @param {integer} strideDUF - stride for DUF
* @param {NonNegativeInteger} offsetDUF - offset for DUF
* @param {Float64Array} DU2 - second superdiagonal fill-in (length N-2), input if fact='factored', output if fact='not-factored'
* @param {integer} strideDU2 - stride for DU2
* @param {NonNegativeInteger} offsetDU2 - offset for DU2
* @param {Int32Array} IPIV - pivot indices (length N), 0-based
* @param {integer} strideIPIV - stride for IPIV
* @param {NonNegativeInteger} offsetIPIV - offset for IPIV
* @param {Float64Array} B - right hand side matrix (N x NRHS)
* @param {integer} strideB1 - row stride of B
* @param {integer} strideB2 - column stride of B
* @param {NonNegativeInteger} offsetB - offset for B
* @param {Float64Array} X - solution matrix (N x NRHS), output
* @param {integer} strideX1 - row stride of X
* @param {integer} strideX2 - column stride of X
* @param {NonNegativeInteger} offsetX - offset for X
* @param {Float64Array} rcond - output: rcond[0] is the reciprocal condition number
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
* @throws {TypeError} Second argument must be a valid transpose operation
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info - 0 if successful, >0 if singular, N+1 if ill-conditioned
*/
function dgtsvx( fact, trans, N, nrhs, DL, strideDL, offsetDL, d, strideD, offsetD, DU, strideDU, offsetDU, DLF, strideDLF, offsetDLF, DF, strideDF, offsetDF, DUF, strideDUF, offsetDUF, DU2, strideDU2, offsetDU2, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, rcond, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWORK, offsetWORK, IWORK, strideIWORK, offsetIWORK ) { // eslint-disable-line max-len, max-params
	if ( !isTransposeOperation( trans ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid transpose operation. Value: `%s`.', trans ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( nrhs < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', nrhs ) );
	}
	var minWork = 3 * N;
	if ( !WORK || ( WORK.length - offsetWORK ) < minWork ) {
		throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', minWork, offsetWORK, ( WORK ) ? WORK.length : 0 ) );
	}
	return base( fact, trans, N, nrhs, DL, strideDL, offsetDL, d, strideD, offsetD, DU, strideDU, offsetDU, DLF, strideDLF, offsetDLF, DF, strideDF, offsetDF, DUF, strideDUF, offsetDUF, DU2, strideDU2, offsetDU2, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, rcond, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWORK, offsetWORK, IWORK, strideIWORK, offsetIWORK ); // eslint-disable-line max-len
}


// EXPORTS //

export default dgtsvx;
