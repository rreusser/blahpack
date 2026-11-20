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
* Solves A_X = B with a complex Hermitian matrix A using the factorization.
_ A = U_D_U^H or A = L_D*L^H computed by ZHETRF.
*
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the matrix
* @param {NonNegativeInteger} nrhs - number of right hand sides
* @param {Complex128Array} A - factored matrix from zhetrf
* @param {integer} strideA1 - first stride of A
* @param {integer} strideA2 - second stride of A
* @param {NonNegativeInteger} offsetA - offset into A
* @param {Int32Array} IPIV - pivot indices from zhetrf
* @param {integer} strideIPIV - stride of IPIV
* @param {NonNegativeInteger} offsetIPIV - offset into IPIV
* @param {Complex128Array} B - right hand side / solution matrix
* @param {integer} strideB1 - first stride of B
* @param {integer} strideB2 - second stride of B
* @param {NonNegativeInteger} offsetB - offset into B
* @param {Complex128Array} WORK - workspace, length N
* @param {integer} strideWork - stride of WORK
* @param {NonNegativeInteger} offsetWork - offset into WORK
* @throws {TypeError} first argument must be a valid matrix triangle
* @throws {RangeError} second argument must be a nonnegative integer
* @throws {RangeError} third argument must be a nonnegative integer
* @returns {integer} info - 0 if successful
*/
function zhetrs2( uplo, N, nrhs, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB, WORK, strideWork, offsetWork ) { // eslint-disable-line max-len, max-params
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( nrhs < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', nrhs ) );
	}
	// Caller owns the workspace; assert it is a sufficiently large array so an
	// under-sized (or non-array) buffer is a loud RangeError, not a silent NaN
	// from an out-of-bounds read. WORK needs at least N complex elements
	// (N === 0 is a quick return that references no workspace).
	if ( N > 0 && ( !WORK || ( WORK.length - offsetWork ) < N ) ) {
		throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', N, offsetWork, ( WORK ) ? WORK.length : 0 ) );
	}
	if ( strideWork !== 1 ) {
		throw new RangeError( format( 'invalid argument. `strideWork` must be 1 (only contiguous workspace is supported). Value: `%d`.', strideWork ) );
	}
	return base( uplo, N, nrhs, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB, WORK, strideWork, offsetWork ); // eslint-disable-line max-len
}


// EXPORTS //

export default zhetrs2;
