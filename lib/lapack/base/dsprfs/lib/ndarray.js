/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

// MODULES //

import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Improves the computed solution to a real system A * X = B where A is symmetric in packed storage and provides error bounds.
*
* @param {string} uplo - specifies the operation type
* @param {NonNegativeInteger} N - number of columns
* @param {integer} nrhs - nrhs
* @param {Float64Array} AP - input array
* @param {integer} strideAP - stride length for `AP`
* @param {NonNegativeInteger} offsetAP - starting index for `AP`
* @param {Float64Array} AFP - input array
* @param {integer} strideAFP - stride length for `AFP`
* @param {NonNegativeInteger} offsetAFP - starting index for `AFP`
* @param {Int32Array} IPIV - input array
* @param {integer} strideIPIV - stride length for `IPIV`
* @param {NonNegativeInteger} offsetIPIV - starting index for `IPIV`
* @param {Float64Array} B - input matrix
* @param {integer} strideB1 - stride of the first dimension of `B`
* @param {integer} strideB2 - stride of the second dimension of `B`
* @param {NonNegativeInteger} offsetB - starting index for `B`
* @param {Float64Array} X - input matrix
* @param {integer} strideX1 - stride of the first dimension of `X`
* @param {integer} strideX2 - stride of the second dimension of `X`
* @param {NonNegativeInteger} offsetX - starting index for `X`
* @param {Float64Array} FERR - input array
* @param {integer} strideFERR - stride length for `FERR`
* @param {NonNegativeInteger} offsetFERR - starting index for `FERR`
* @param {Float64Array} BERR - input array
* @param {integer} strideBERR - stride length for `BERR`
* @param {NonNegativeInteger} offsetBERR - starting index for `BERR`
* @param {Float64Array} WORK - caller-owned workspace of at least `3*N` elements
* @param {integer} strideWork - stride length for `WORK` (must be 1; workspace is contiguous)
* @param {NonNegativeInteger} offsetWork - starting index for `WORK`
* @param {Int32Array} IWORK - caller-owned integer workspace of at least `N` elements
* @param {integer} strideIWork - stride length for `IWORK` (must be 1; workspace is contiguous)
* @param {NonNegativeInteger} offsetIWork - starting index for `IWORK`
* @throws {TypeError} First argument must be a valid matrix triangle
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @throws {RangeError} WORK array must be large enough
* @throws {RangeError} IWORK array must be large enough
* @returns {integer} status code (0 = success)
*/
function dsprfs( uplo, N, nrhs, AP, strideAP, offsetAP, AFP, strideAFP, offsetAFP, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWork, offsetWork, IWORK, strideIWork, offsetIWork ) { // eslint-disable-line max-len, max-params
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( nrhs < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', nrhs ) );
	}
	// Quick return for an empty problem: no workspace is required, so return
	// before asserting WORK/IWORK sizes (base fills FERR/BERR with zeros).
	if ( N === 0 || nrhs === 0 ) {
		return base( uplo, N, nrhs, AP, strideAP, offsetAP, AFP, strideAFP, offsetAFP, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWork, offsetWork, IWORK, strideIWork, offsetIWork ); // eslint-disable-line max-len
	}
	// Caller owns the workspace; assert it is large enough so an under-sized
	// buffer is a loud RangeError, not a silent NaN from an out-of-bounds read.
	// WORK holds three contiguous N-length segments (3*N); IWORK holds N ints.
	if ( !WORK || ( WORK.length - offsetWork ) < ( 3 * N ) ) {
		throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', 3 * N, offsetWork, ( WORK ) ? WORK.length : 0 ) );
	}
	if ( !IWORK || ( IWORK.length - offsetIWork ) < N ) {
		throw new RangeError( format( 'invalid argument. IWORK array must have at least %d elements from offset %d. Provided length: %d.', N, offsetIWork, ( IWORK ) ? IWORK.length : 0 ) );
	}
	return base( uplo, N, nrhs, AP, strideAP, offsetAP, AFP, strideAFP, offsetAFP, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWork, offsetWork, IWORK, strideIWork, offsetIWork ); // eslint-disable-line max-len
}


// EXPORTS //

export default dsprfs;
