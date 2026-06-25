
// MODULES //

import isTransposeOperation from '@stdlib/blas/base/assert/is-transpose-operation/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Improves the computed solution to a system of linear equations and provides.
* error bounds and backward error estimates for the solution.
*
* Uses the LU factorization computed by dgetrf. The caller must supply
* WORK (Float64Array, size >= 3*N) and IWORK (Int32Array, size >= N).
*
* IPIV must contain 0-based pivot indices (as produced by dgetrf).
*
* @param {string} trans - specifies the form of the system: 'no-transpose' or 'transpose'
* @param {NonNegativeInteger} N - order of matrix A
* @param {NonNegativeInteger} nrhs - number of right-hand side columns
* @param {Float64Array} A - original N-by-N matrix
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - index offset for A
* @param {Float64Array} AF - LU-factored N-by-N matrix (from dgetrf)
* @param {integer} strideAF1 - stride of the first dimension of AF
* @param {integer} strideAF2 - stride of the second dimension of AF
* @param {NonNegativeInteger} offsetAF - index offset for AF
* @param {Int32Array} IPIV - pivot indices from dgetrf (0-based)
* @param {integer} strideIPIV - stride for IPIV
* @param {NonNegativeInteger} offsetIPIV - index offset for IPIV
* @param {Float64Array} B - right-hand side matrix
* @param {integer} strideB1 - stride of the first dimension of B
* @param {integer} strideB2 - stride of the second dimension of B
* @param {NonNegativeInteger} offsetB - index offset for B
* @param {Float64Array} X - solution matrix (improved on exit)
* @param {integer} strideX1 - stride of the first dimension of X
* @param {integer} strideX2 - stride of the second dimension of X
* @param {NonNegativeInteger} offsetX - index offset for X
* @param {Float64Array} FERR - output forward error bounds (length nrhs)
* @param {integer} strideFERR - stride for FERR
* @param {NonNegativeInteger} offsetFERR - index offset for FERR
* @param {Float64Array} BERR - output backward error bounds (length nrhs)
* @param {integer} strideBERR - stride for BERR
* @param {NonNegativeInteger} offsetBERR - index offset for BERR
* @param {Float64Array} work - caller-provided workspace (size >= 3*N)
* @param {integer} strideWork - stride for work
* @param {NonNegativeInteger} offsetWork - index offset for work
* @param {Int32Array} iwork - caller-provided integer workspace (size >= N)
* @param {integer} strideIwork - stride for iwork
* @param {NonNegativeInteger} offsetIwork - index offset for iwork
* @throws {TypeError} First argument must be a valid transpose operation
* @throws {RangeError} WORK array must have at least 3*N elements from offset
* @throws {RangeError} IWORK array must have at least N elements from offset
* @returns {integer} info - 0 if successful
*/
function dgerfs( trans, N, nrhs, A, strideA1, strideA2, offsetA, AF, strideAF1, strideAF2, offsetAF, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, work, strideWork, offsetWork, iwork, strideIwork, offsetIwork ) { // eslint-disable-line max-len, max-params
	var minWork;
	var minIwork;

	if ( !isTransposeOperation( trans ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid transpose operation. Value: `%s`.', trans ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( nrhs < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', nrhs ) );
	}
	minWork = 3 * N;
	if ( !work || ( work.length - offsetWork ) < minWork ) {
		throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', minWork, offsetWork, work ? work.length : 0 ) );
	}
	minIwork = N;
	if ( !iwork || ( iwork.length - offsetIwork ) < minIwork ) {
		throw new RangeError( format( 'invalid argument. IWORK array must have at least %d elements from offset %d. Provided length: %d.', minIwork, offsetIwork, iwork ? iwork.length : 0 ) );
	}
	return base( trans, N, nrhs, A, strideA1, strideA2, offsetA, AF, strideAF1, strideAF2, offsetAF, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, work, strideWork, offsetWork, iwork, strideIwork, offsetIwork ); // eslint-disable-line max-len
}


// EXPORTS //

export default dgerfs;
