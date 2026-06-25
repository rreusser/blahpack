/* eslint-disable max-len, max-params */

// MODULES //

import isTransposeOperation from '@stdlib/blas/base/assert/is-transpose-operation/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
 * Expert driver for solving a real system of linear equations A*X = B,
 * using the LU factorization. Provides equilibration, condition estimation,
 * iterative refinement, and error bounds.
 *
 * @param {string} fact - `'not-factored'`, `'equilibrate'`, or `'factored'`
 * @param {string} trans - `'no-transpose'` or `'transpose'`
 * @param {NonNegativeInteger} N - order of matrix A
 * @param {NonNegativeInteger} nrhs - number of right-hand side columns
 * @param {Float64Array} A - N-by-N matrix (may be equilibrated on exit)
 * @param {integer} strideA1 - stride of the first dimension of A
 * @param {integer} strideA2 - stride of the second dimension of A
 * @param {NonNegativeInteger} offsetA - index offset for A
 * @param {Float64Array} AF - N-by-N factored matrix (output)
 * @param {integer} strideAF1 - stride of the first dimension of AF
 * @param {integer} strideAF2 - stride of the second dimension of AF
 * @param {NonNegativeInteger} offsetAF - index offset for AF
 * @param {Int32Array} IPIV - pivot indices (0-based, output)
 * @param {integer} strideIPIV - stride for IPIV
 * @param {NonNegativeInteger} offsetIPIV - index offset for IPIV
 * @param {string} equed - equilibration type (input if FACT=`'factored'`)
 * @param {Float64Array} r - row scale factors
 * @param {integer} strideR - stride for r
 * @param {NonNegativeInteger} offsetR - index offset for r
 * @param {Float64Array} c - column scale factors
 * @param {integer} strideC - stride for c
 * @param {NonNegativeInteger} offsetC - index offset for c
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
 * @param {Float64Array} WORK - workspace array (length >= max(1, 4*N))
 * @param {integer} strideWork - stride for WORK
 * @param {NonNegativeInteger} offsetWork - index offset for WORK
 * @param {Int32Array} IWORK - integer workspace array (length >= N)
 * @param {integer} strideIwork - stride for IWORK
 * @param {NonNegativeInteger} offsetIwork - index offset for IWORK
 * @throws {TypeError} Second argument must be a valid transpose operation
 * @throws {RangeError} WORK array must have at least max(1,4*N) elements from offset
 * @throws {RangeError} IWORK array must have at least N elements from offset
 * @returns {Object} result with info, equed, rcond, rpvgrw
 */
function dgesvx( fact, trans, N, nrhs, A, strideA1, strideA2, offsetA, AF, strideAF1, strideAF2, offsetAF, IPIV, strideIPIV, offsetIPIV, equed, r, strideR, offsetR, c, strideC, offsetC, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWork, offsetWork, IWORK, strideIwork, offsetIwork ) {
	var minWork;
	if ( !isTransposeOperation( trans ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid transpose operation. Value: `%s`.', trans ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( nrhs < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', nrhs ) );
	}
	minWork = Math.max( 1, 4 * N );
	if ( !WORK || ( WORK.length - offsetWork ) < minWork ) {
		throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', minWork, offsetWork, WORK ? WORK.length : 0 ) );
	}
	if ( N > 0 && ( !IWORK || ( IWORK.length - offsetIwork ) < N ) ) {
		throw new RangeError( format( 'invalid argument. IWORK array must have at least %d elements from offset %d. Provided length: %d.', N, offsetIwork, IWORK ? IWORK.length : 0 ) );
	}
	return base( fact, trans, N, nrhs, A, strideA1, strideA2, offsetA, AF, strideAF1, strideAF2, offsetAF, IPIV, strideIPIV, offsetIPIV, equed, r, strideR, offsetR, c, strideC, offsetC, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWork, offsetWork, IWORK, strideIwork, offsetIwork ); // eslint-disable-line max-len
}


// EXPORTS //

export default dgesvx;
