
// MODULES //

import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Solves a complex Hermitian positive definite system A*X = B where A is in packed storage, with optional equilibration, condition estimation, and error bounds.
*
* @param {string} fact - `'not-factored'`, `'factored'`, or `'equilibrate'`
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the matrix A
* @param {NonNegativeInteger} nrhs - number of right-hand side columns
* @param {Complex128Array} AP - Hermitian positive definite matrix in packed storage (length N*(N+1)/2)
* @param {integer} strideAP - stride for AP (in complex elements)
* @param {NonNegativeInteger} offsetAP - starting index for AP (in complex elements)
* @param {Complex128Array} AFP - factored form in packed storage
* @param {integer} strideAFP - stride for AFP (in complex elements)
* @param {NonNegativeInteger} offsetAFP - starting index for AFP (in complex elements)
* @param {Array} equed - single-element array for equilibration status ('none' or 'yes')
* @param {Float64Array} S - scaling factors (length N)
* @param {integer} strideS - stride for S
* @param {NonNegativeInteger} offsetS - starting index for S
* @param {Complex128Array} B - right-hand side matrix (column-major, N-by-NRHS, in complex elements)
* @param {integer} strideB1 - stride of the first dimension of B (in complex elements)
* @param {integer} strideB2 - stride of the second dimension of B (in complex elements)
* @param {NonNegativeInteger} offsetB - starting index for B (in complex elements)
* @param {Complex128Array} X - solution matrix (column-major, N-by-NRHS, output, in complex elements)
* @param {integer} strideX1 - stride of the first dimension of X (in complex elements)
* @param {integer} strideX2 - stride of the second dimension of X (in complex elements)
* @param {NonNegativeInteger} offsetX - starting index for X (in complex elements)
* @param {Float64Array} rcond - single-element array for reciprocal condition number (output)
* @param {Float64Array} FERR - forward error bounds array (length NRHS, output)
* @param {integer} strideFERR - stride for FERR
* @param {NonNegativeInteger} offsetFERR - starting index for FERR
* @param {Float64Array} BERR - backward error bounds array (length NRHS, output)
* @param {integer} strideBERR - stride for BERR
* @param {NonNegativeInteger} offsetBERR - starting index for BERR
* @param {Complex128Array} WORK - complex workspace array (length at least 2*N)
* @param {integer} strideWORK - stride for WORK (in complex elements)
* @param {NonNegativeInteger} offsetWORK - starting index for WORK (in complex elements)
* @param {Float64Array} RWORK - real workspace array (length at least N)
* @param {integer} strideRWORK - stride for RWORK
* @param {NonNegativeInteger} offsetRWORK - starting index for RWORK
* @throws {TypeError} Second argument must be a valid matrix triangle
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info - 0 if successful, k>0 if factorization failed, N+1 if rcond < machine epsilon
*/
function zppsvx( fact, uplo, N, nrhs, AP, strideAP, offsetAP, AFP, strideAFP, offsetAFP, equed, S, strideS, offsetS, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, rcond, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWORK, offsetWORK, RWORK, strideRWORK, offsetRWORK ) { // eslint-disable-line max-len, max-params
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid matrix triangle. Value: `%S`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( nrhs < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', nrhs ) );
	}
	return base( fact, uplo, N, nrhs, AP, strideAP, offsetAP, AFP, strideAFP, offsetAFP, equed, S, strideS, offsetS, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, rcond, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWORK, offsetWORK, RWORK, strideRWORK, offsetRWORK ); // eslint-disable-line max-len
}


// EXPORTS //

export default zppsvx;
