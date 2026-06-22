

// MODULES //

import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
 * Improves the computed solution to a complex Hermitian positive definite
 * tridiagonal system A*X = B, and provides error bounds and backward
 * error estimates for the solution.
 *
 * ## Notes
 *
 * -   D, DF, FERR, BERR, RWORK are real (Float64Array). Strides/offsets are in real elements.
 * -   E, EF, B, X, WORK are complex (Complex128Array). Strides/offsets are in complex elements.
 * -   UPLO = 'U': E stores the superdiagonal of A, so A(i,i+1)=E(i), A(i+1,i)=conj(E(i)).
 *     UPLO = 'L': E stores the subdiagonal of A, so A(i+1,i)=E(i), A(i,i+1)=conj(E(i)).
 *
 *
 * @param {string} uplo - `'upper'` or `'lower'`: which triangle of A is stored in E
 * @param {NonNegativeInteger} N - order of the tridiagonal matrix A
 * @param {NonNegativeInteger} nrhs - number of right hand sides
 * @param {Float64Array} d - original diagonal elements of A (real), length N
 * @param {integer} strideD - stride for `d`
 * @param {NonNegativeInteger} offsetD - starting index for `d`
 * @param {Complex128Array} e - original off-diagonal elements of A (complex), length N-1
 * @param {integer} strideE - stride for `e` (in complex elements)
 * @param {NonNegativeInteger} offsetE - starting index for `e` (in complex elements)
 * @param {Float64Array} DF - factored diagonal from zpttrf (real), length N
 * @param {integer} strideDF - stride for `DF`
 * @param {NonNegativeInteger} offsetDF - starting index for `DF`
 * @param {Complex128Array} EF - factored off-diagonal from zpttrf (complex), length N-1
 * @param {integer} strideEF - stride for `EF` (in complex elements)
 * @param {NonNegativeInteger} offsetEF - starting index for `EF` (in complex elements)
 * @param {Complex128Array} B - right hand side matrix (N x NRHS), complex
 * @param {integer} strideB1 - row stride of `B` (in complex elements)
 * @param {integer} strideB2 - column stride of `B` (in complex elements)
 * @param {NonNegativeInteger} offsetB - starting index for `B` (in complex elements)
 * @param {Complex128Array} X - solution matrix (N x NRHS), refined in-place, complex
 * @param {integer} strideX1 - row stride of `X` (in complex elements)
 * @param {integer} strideX2 - column stride of `X` (in complex elements)
 * @param {NonNegativeInteger} offsetX - starting index for `X` (in complex elements)
 * @param {Float64Array} FERR - forward error bound for each RHS (real), length NRHS
 * @param {integer} strideFERR - stride for `FERR`
 * @param {NonNegativeInteger} offsetFERR - starting index for `FERR`
 * @param {Float64Array} BERR - backward error for each RHS (real), length NRHS
 * @param {integer} strideBERR - stride for `BERR`
 * @param {NonNegativeInteger} offsetBERR - starting index for `BERR`
 * @param {Complex128Array} WORK - complex workspace, length N
 * @param {integer} strideWORK - stride for `WORK` (in complex elements)
 * @param {NonNegativeInteger} offsetWORK - starting index for `WORK` (in complex elements)
 * @param {Float64Array} RWORK - real workspace, length N
 * @param {integer} strideRWORK - stride for `RWORK`
 * @param {NonNegativeInteger} offsetRWORK - starting index for `RWORK`
 * @throws {TypeError} First argument must be a valid matrix triangle
 * @returns {integer} info - 0 on success
 */
function zptrfs( uplo, N, nrhs, d, strideD, offsetD, e, strideE, offsetE, DF, strideDF, offsetDF, EF, strideEF, offsetEF, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWORK, offsetWORK, RWORK, strideRWORK, offsetRWORK ) { // eslint-disable-line max-len, max-params
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( nrhs < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', nrhs ) );
	}
	return base( uplo, N, nrhs, d, strideD, offsetD, e, strideE, offsetE, DF, strideDF, offsetDF, EF, strideEF, offsetEF, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWORK, offsetWORK, RWORK, strideRWORK, offsetRWORK ); // eslint-disable-line max-len
}


// EXPORTS //

export default zptrfs;
