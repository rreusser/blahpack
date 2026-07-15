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
* Improves the computed solution to a complex system A * X = B where A is Hermitian in packed storage and provides error bounds.
*
* @param {string} uplo - specifies the operation type
* @param {NonNegativeInteger} N - number of columns
* @param {integer} nrhs - nrhs
* @param {Complex128Array} AP - input array
* @param {integer} strideAP - stride length for `AP`
* @param {NonNegativeInteger} offsetAP - starting index for `AP`
* @param {Complex128Array} AFP - input array
* @param {integer} strideAFP - stride length for `AFP`
* @param {NonNegativeInteger} offsetAFP - starting index for `AFP`
* @param {Int32Array} IPIV - input array
* @param {integer} strideIPIV - stride length for `IPIV`
* @param {NonNegativeInteger} offsetIPIV - starting index for `IPIV`
* @param {Complex128Array} B - input matrix
* @param {integer} strideB1 - stride of the first dimension of `B`
* @param {integer} strideB2 - stride of the second dimension of `B`
* @param {NonNegativeInteger} offsetB - starting index for `B`
* @param {Complex128Array} X - input matrix
* @param {integer} strideX1 - stride of the first dimension of `X`
* @param {integer} strideX2 - stride of the second dimension of `X`
* @param {NonNegativeInteger} offsetX - starting index for `X`
* @param {Float64Array} FERR - output forward error bounds (length nrhs)
* @param {integer} strideFERR - stride length for `FERR`
* @param {NonNegativeInteger} offsetFERR - starting index for `FERR`
* @param {Float64Array} BERR - output backward error bounds (length nrhs)
* @param {integer} strideBERR - stride length for `BERR`
* @param {NonNegativeInteger} offsetBERR - starting index for `BERR`
* @param {Complex128Array} WORK - caller-owned complex workspace of at least `2*N` elements; never allocated here
* @param {integer} strideWork - stride length for `WORK` (must be 1; workspace is contiguous)
* @param {NonNegativeInteger} offsetWork - starting index for `WORK` (in complex elements)
* @param {Float64Array} RWORK - caller-owned real workspace of at least `N` elements; never allocated here
* @param {integer} strideRWork - stride length for `RWORK` (must be 1; workspace is contiguous)
* @param {NonNegativeInteger} offsetRWork - starting index for `RWORK`
* @throws {TypeError} First argument must be a valid matrix triangle
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @throws {RangeError} WORK array must be large enough
* @throws {RangeError} RWORK array must be large enough
* @returns {integer} status code (0 = success)
*/
function zhprfs( uplo, N, nrhs, AP, strideAP, offsetAP, AFP, strideAFP, offsetAFP, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWork, offsetWork, RWORK, strideRWork, offsetRWork ) { // eslint-disable-line max-len, max-params
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
	// before asserting WORK/RWORK sizes (base fills FERR/BERR with zeros).
	if ( N === 0 || nrhs === 0 ) {
		return base( uplo, N, nrhs, AP, strideAP, offsetAP, AFP, strideAFP, offsetAFP, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWork, offsetWork, RWORK, strideRWork, offsetRWork ); // eslint-disable-line max-len
	}
	// Caller owns the workspace; assert it is large enough so an under-sized
	// buffer is a loud RangeError, not a silent NaN from an out-of-bounds read.
	// WORK holds two contiguous N-length complex segments (2*N); RWORK holds N reals.
	if ( !WORK || ( WORK.length - offsetWork ) < ( 2 * N ) ) {
		throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', 2 * N, offsetWork, ( WORK ) ? WORK.length : 0 ) );
	}
	if ( !RWORK || ( RWORK.length - offsetRWork ) < N ) {
		throw new RangeError( format( 'invalid argument. RWORK array must have at least %d elements from offset %d. Provided length: %d.', N, offsetRWork, ( RWORK ) ? RWORK.length : 0 ) );
	}
	return base( uplo, N, nrhs, AP, strideAP, offsetAP, AFP, strideAFP, offsetAFP, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWork, offsetWork, RWORK, strideRWork, offsetRWork ); // eslint-disable-line max-len
}


// EXPORTS //

export default zhprfs;
