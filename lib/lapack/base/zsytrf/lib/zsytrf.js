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

import format from '@stdlib/string/format/lib/index.js';
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes the factorization of a complex symmetric matrix using Bunch-Kaufman diagonal pivoting.
*
* @param {string} uplo - `'upper'` or `'lower'` indicating upper or lower triangular storage
* @param {integer} N - order of the matrix
* @param {Complex128Array} A - input/output matrix
* @param {integer} strideA1 - first stride of A
* @param {integer} strideA2 - second stride of A
* @param {integer} offsetA - offset into A
* @param {Int32Array} IPIV - output pivot indices
* @param {integer} strideIPIV - stride of IPIV
* @param {integer} offsetIPIV - offset into IPIV
* @param {(Complex128Array|null)} WORK - workspace (length >= 1; N*32 enables the full blocked algorithm); if `null`, a workspace of optimal size is allocated
* @param {integer} strideWork - stride length for `WORK` (complex elements)
* @param {NonNegativeInteger} offsetWork - starting index for `WORK` (complex elements)
* @throws {TypeError} first argument must be a valid matrix triangle
* @throws {RangeError} second argument must be a nonnegative integer
* @returns {integer} info value
*/
function zsytrf( uplo, N, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV, WORK, strideWork, offsetWork ) {
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( WORK === null ) {
		WORK = new Complex128Array( max( 1, N * 32 ) ); // optimal size: N*NB, NB = 32
		strideWork = 1;
		offsetWork = 0;
	}
	return base( uplo, N, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV, WORK, strideWork, offsetWork );
}


// EXPORTS //

export default zsytrf;
