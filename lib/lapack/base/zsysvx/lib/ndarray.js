

// MODULES //

import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
 * Solves a complex symmetric indefinite system of linear equations A*X = B
 * using the diagonal pivoting factorization A = U*D*U^T or A = L*D*L^T,
 * and provides an estimate of the condition number and error bounds.
 *
 * NOTE: SYMMETRIC (not Hermitian). No conjugation.
 *
 *
 * @param {string} fact - 'not-factored' or 'factored'
 * @param {string} uplo - 'upper' or 'lower'
 * @param {NonNegativeInteger} N - order of the matrix A
 * @param {NonNegativeInteger} nrhs - number of RHS columns
 * @param {Complex128Array} A - symmetric matrix A
 * @param {integer} strideA1 - first stride of A
 * @param {integer} strideA2 - second stride of A
 * @param {NonNegativeInteger} offsetA - offset into A
 * @param {Complex128Array} AF - factored form of A
 * @param {integer} strideAF1 - first stride of AF
 * @param {integer} strideAF2 - second stride of AF
 * @param {NonNegativeInteger} offsetAF - offset into AF
 * @param {Int32Array} IPIV - pivot indices
 * @param {integer} strideIPIV - stride for IPIV
 * @param {NonNegativeInteger} offsetIPIV - offset for IPIV
 * @param {Complex128Array} B - right-hand side matrix
 * @param {integer} strideB1 - first stride of B
 * @param {integer} strideB2 - second stride of B
 * @param {NonNegativeInteger} offsetB - offset into B
 * @param {Complex128Array} X - solution matrix (output)
 * @param {integer} strideX1 - first stride of X
 * @param {integer} strideX2 - second stride of X
 * @param {NonNegativeInteger} offsetX - offset into X
 * @param {Float64Array} rcond - single-element array for reciprocal condition number
 * @param {Float64Array} FERR - forward error bounds (length nrhs)
 * @param {integer} strideFERR - stride for FERR
 * @param {NonNegativeInteger} offsetFERR - offset for FERR
 * @param {Float64Array} BERR - backward error bounds (length nrhs)
 * @param {integer} strideBERR - stride for BERR
 * @param {NonNegativeInteger} offsetBERR - offset for BERR
 * @param {Complex128Array} WORK - workspace
 * @param {integer} strideWORK - stride for WORK
 * @param {NonNegativeInteger} offsetWORK - offset for WORK
 * @param {integer} lwork - length of WORK
 * @param {Float64Array} RWORK - real workspace (length N)
 * @param {integer} strideRWORK - stride for RWORK
 * @param {NonNegativeInteger} offsetRWORK - offset for RWORK
 * @throws {TypeError} Second argument must be a valid matrix triangle
 * @returns {integer} info - 0 on success, k>0 if singular, N+1 if ill-conditioned
 */
function zsysvx( fact, uplo, N, nrhs, A, strideA1, strideA2, offsetA, AF, strideAF1, strideAF2, offsetAF, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, rcond, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWORK, offsetWORK, lwork, RWORK, strideRWORK, offsetRWORK ) { // eslint-disable-line max-len, max-params
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( nrhs < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', nrhs ) );
	}
	return base( fact, uplo, N, nrhs, A, strideA1, strideA2, offsetA, AF, strideAF1, strideAF2, offsetAF, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, rcond, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWORK, offsetWORK, lwork, RWORK, strideRWORK, offsetRWORK ); // eslint-disable-line max-len
}


// EXPORTS //

export default zsysvx;
