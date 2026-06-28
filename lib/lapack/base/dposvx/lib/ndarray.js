
// MODULES //

import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Expert driver for solving a real symmetric positive definite system of.
* linear equations A_X = B, using the Cholesky factorization A = U^T_U or
* A = L*L^T. Provides equilibration, condition estimation, iterative
* refinement, and error bounds.
*
* FACT controls whether to factor, equilibrate+factor, or use pre-factored:
*   'not-factored' - factor A, no equilibration
*   'equilibrate' - equilibrate if needed, then factor
*   'factored' - use pre-factored AF (and pre-computed S if equilibrated)
*
* UPLO specifies whether the upper or lower triangle of A is stored:
*   'upper' - upper triangle
*   'lower' - lower triangle
*
* EQUED (input if FACT='factored', output otherwise):
*   'none' - no equilibration
*   'yes' - equilibration was done (A replaced by diag(S)_A_diag(S))
*
* Returns { info, equed, rcond } where:
*   info: 0=success, i (1-based)=leading minor not positive definite, N+1=singular to working precision
*   equed: equilibration type applied
*   rcond: reciprocal condition number estimate
*
* @param {string} fact - 'not-factored', 'equilibrate', or 'factored'
* @param {string} uplo - 'upper' or 'lower'
* @param {NonNegativeInteger} N - order of matrix A
* @param {NonNegativeInteger} nrhs - number of right-hand side columns
* @param {Float64Array} A - N-by-N symmetric positive definite matrix (may be equilibrated on exit)
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - index offset for A
* @param {Float64Array} AF - N-by-N factored matrix (output)
* @param {integer} strideAF1 - stride of the first dimension of AF
* @param {integer} strideAF2 - stride of the second dimension of AF
* @param {NonNegativeInteger} offsetAF - index offset for AF
* @param {string} equed - equilibration type (input if FACT='factored')
* @param {Float64Array} s - scaling factors (input if FACT='factored' and equed='yes', output if FACT='equilibrate')
* @param {integer} strideS - stride for s
* @param {NonNegativeInteger} offsetS - index offset for s
* @param {Float64Array} B - N-by-NRHS right-hand side (may be scaled on exit)
* @param {integer} strideB1 - stride of the first dimension of B
* @param {integer} strideB2 - stride of the second dimension of B
* @param {NonNegativeInteger} offsetB - index offset for B
* @param {Float64Array} X - N-by-NRHS solution matrix (output)
* @param {integer} strideX1 - stride of the first dimension of X
* @param {integer} strideX2 - stride of the second dimension of X
* @param {NonNegativeInteger} offsetX - index offset for X
* @param {Float64Array} FERR - forward error bounds (output, length nrhs)
* @param {integer} strideFERR - stride for FERR
* @param {NonNegativeInteger} offsetFERR - index offset for FERR
* @param {Float64Array} BERR - backward error bounds (output, length nrhs)
* @param {integer} strideBERR - stride for BERR
* @param {NonNegativeInteger} offsetBERR - index offset for BERR
* @param {Float64Array} WORK - workspace array of length at least 3*N
* @param {integer} strideWork - stride for WORK
* @param {NonNegativeInteger} offsetWork - index offset for WORK
* @param {Int32Array} IWORK - integer workspace array of length N
* @param {integer} strideIWork - stride for IWORK
* @param {NonNegativeInteger} offsetIWork - index offset for IWORK
* @throws {TypeError} Second argument must be a valid matrix triangle
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {Object} result with info, equed, rcond
*/
function dposvx( fact, uplo, N, nrhs, A, strideA1, strideA2, offsetA, AF, strideAF1, strideAF2, offsetAF, equed, s, strideS, offsetS, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, rcond, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWork, offsetWork, IWORK, strideIWork, offsetIWork ) { // eslint-disable-line max-len, max-params
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( nrhs < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', nrhs ) );
	}
	var minWork = Math.max( 1, 3 * N );
	if ( !WORK || ( WORK.length - offsetWork ) < minWork ) {
		throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', minWork, offsetWork, ( WORK ) ? WORK.length : 0 ) );
	}

	return base( fact, uplo, N, nrhs, A, strideA1, strideA2, offsetA, AF, strideAF1, strideAF2, offsetAF, equed, s, strideS, offsetS, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, rcond, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWork, offsetWork, IWORK, strideIWork, offsetIWork ); // eslint-disable-line max-len
}


// EXPORTS //

export default dposvx;
