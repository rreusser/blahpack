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
* Computes the factorization of a complex Hermitian matrix using Bunch-Kaufman.
* diagonal pivoting: A = U_D_U^H or A = L_D_L^H.
*
* Uses blocked algorithm (zlahef) for large matrices and unblocked (zhetf2)
* for small trailing/leading submatrices.
*
* @param {MatrixTriangle} uplo - `'upper'` or `'lower'` indicating upper or lower triangular storage
* @param {NonNegativeInteger} N - order of the matrix
* @param {Complex128Array} A - input/output matrix
* @param {integer} strideA1 - first stride of A
* @param {integer} strideA2 - second stride of A
* @param {NonNegativeInteger} offsetA - offset into A
* @param {Int32Array} IPIV - output pivot indices
* @param {integer} strideIPIV - stride of IPIV
* @param {NonNegativeInteger} offsetIPIV - offset into IPIV
* @param {Complex128Array} WORK - workspace (length >= 1; N*32 enables the full blocked algorithm); if `null`, a workspace of optimal size is allocated
* @param {integer} strideWork - stride length for `WORK`
* @param {NonNegativeInteger} offsetWork - starting index for `WORK`
* @throws {TypeError} first argument must be a valid matrix triangle
* @throws {RangeError} second argument must be a nonnegative integer
* @returns {integer} info value
*/
function zhetrf( uplo, N, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV, WORK, strideWork, offsetWork ) { // eslint-disable-line max-len, max-params
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( WORK.length < offsetWork + 1 ) {
		throw new RangeError( format( 'invalid argument. `WORK` must have at least 1 element starting at offset %d. Length: `%d`.', offsetWork, WORK.length ) );
	}
	if ( strideWork !== 1 ) {
		throw new RangeError( format( 'invalid argument. `strideWork` must be 1 (only contiguous workspace is supported). Value: `%d`.', strideWork ) );
	}
	return base( uplo, N, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV, WORK, strideWork, offsetWork ); // eslint-disable-line max-len
}


// EXPORTS //

export default zhetrf;
