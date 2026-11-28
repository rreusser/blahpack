/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable max-len, max-params */

// MODULES //

import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Solves a real symmetric indefinite system of linear equations A_X = B where A is stored in packed format, using the diagonal pivoting factorization A = U_D_U^T or A = L_D_L^T, and provides an estimate of the condition number and error bounds on the solution.
*
* @param {('not-factored'|'factored')} fact - 'factored' if AFP and IPIV contain the factorization, 'not-factored' to compute it
* @param {MatrixTriangle} uplo - 'upper' if upper triangle of A stored, 'lower' if lower triangle
* @param {NonNegativeInteger} N - order of the matrix A
* @param {NonNegativeInteger} nrhs - number of right-hand side columns
* @param {Float64Array} AP - symmetric matrix A in packed storage (length N*(N+1)/2)
* @param {integer} strideAP - stride for AP
* @param {NonNegativeInteger} offsetAP - starting index for AP
* @param {Float64Array} AFP - factored form of A in packed storage (output if FACT='not-factored', input if FACT='factored')
* @param {integer} strideAFP - stride for AFP
* @param {NonNegativeInteger} offsetAFP - starting index for AFP
* @param {Int32Array} IPIV - pivot indices (output if FACT='not-factored', input if FACT='factored')
* @param {integer} strideIPIV - stride for IPIV
* @param {NonNegativeInteger} offsetIPIV - starting index for IPIV
* @param {Float64Array} B - right-hand side matrix (column-major, N-by-NRHS)
* @param {integer} strideB1 - stride of the first dimension of B
* @param {integer} strideB2 - stride of the second dimension of B
* @param {NonNegativeInteger} offsetB - starting index for B
* @param {Float64Array} X - solution matrix (column-major, N-by-NRHS, output)
* @param {integer} strideX1 - stride of the first dimension of X
* @param {integer} strideX2 - stride of the second dimension of X
* @param {NonNegativeInteger} offsetX - starting index for X
* @param {Float64Array} rcond - single-element array for reciprocal condition number (output)
* @param {Float64Array} FERR - forward error bounds array (length NRHS, output)
* @param {integer} strideFERR - stride for FERR
* @param {NonNegativeInteger} offsetFERR - starting index for FERR
* @param {Float64Array} BERR - backward error bounds array (length NRHS, output)
* @param {integer} strideBERR - stride for BERR
* @param {NonNegativeInteger} offsetBERR - starting index for BERR
* @param {Float64Array} WORK - workspace array (length at least 3*N)
* @param {integer} strideWork - stride for WORK
* @param {NonNegativeInteger} offsetWork - starting index for WORK
* @param {Int32Array} IWORK - integer workspace array (length at least N)
* @param {integer} strideIWork - stride for IWORK
* @param {NonNegativeInteger} offsetIWork - starting index for IWORK
* @throws {TypeError} first argument must be one of the following: "factored", "not-factored"
* @throws {TypeError} second argument must be a valid matrix triangle
* @throws {RangeError} third argument must be a nonnegative integer
* @throws {RangeError} fourth argument must be a nonnegative integer
* @throws {RangeError} `IWORK` must have at least `N` elements from `offsetIWork`
* @returns {integer} info - 0 if successful, k>0 if D(k,k) is zero (singular), N+1 if rcond < machine epsilon
*/
function dspsvx( fact, uplo, N, nrhs, AP, strideAP, offsetAP, AFP, strideAFP, offsetAFP, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, rcond, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWork, offsetWork, IWORK, strideIWork, offsetIWork ) { // eslint-disable-line max-len, max-params
	if ( fact !== 'factored' && fact !== 'not-factored' ) {
		throw new TypeError( format( 'invalid argument. First argument must be one of the following: "factored", "not-factored". Value: `%s`.', fact ) );
	}
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( nrhs < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', nrhs ) );
	}
	const minWork = Math.max( 1, 3 * N );
	if ( !WORK || ( WORK.length - offsetWork ) < minWork ) {
		throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', minWork, offsetWork, ( WORK ) ? WORK.length : 0 ) );
	}

	if ( strideWork !== 1 ) {
		throw new RangeError( format( 'invalid argument. `strideWork` must be 1 (only contiguous workspace is supported). Value: `%d`.', strideWork ) );
	}
	if ( strideIWork !== 1 ) {
		throw new RangeError( format( 'invalid argument. `strideIWork` must be 1 (only contiguous workspace is supported). Value: `%d`.', strideIWork ) );
	}
	const minIWork = N;
	if ( !IWORK || ( IWORK.length - offsetIWork ) < minIWork ) {
		throw new RangeError( format( 'invalid argument. IWORK array must have at least %d elements from offset %d. Provided length: %d.', minIWork, offsetIWork, ( IWORK ) ? IWORK.length : 0 ) );
	}
	return base( fact, uplo, N, nrhs, AP, strideAP, offsetAP, AFP, strideAFP, offsetAFP, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, rcond, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWork, offsetWork, IWORK, strideIWork, offsetIWork ); // eslint-disable-line max-len
}


// EXPORTS //

export default dspsvx;
