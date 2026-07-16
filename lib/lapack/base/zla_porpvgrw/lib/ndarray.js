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
* Computes the reciprocal pivot growth factor `norm(A)/norm(U)` for a complex Hermitian positive-definite matrix.
*
* @param {string} uplo - specifies whether the upper or lower triangle is stored (`upper` or `lower`)
* @param {NonNegativeInteger} ncols - number of columns of the matrix A
* @param {Complex128Array} A - input matrix A
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Complex128Array} AF - triangular factor from the Cholesky factorization
* @param {integer} strideAF1 - stride of the first dimension of `AF`
* @param {integer} strideAF2 - stride of the second dimension of `AF`
* @param {NonNegativeInteger} offsetAF - starting index for `AF`
* @param {Float64Array} WORK - workspace array of length at least `2*ncols`
* @param {integer} strideWork - stride length for `WORK`
* @param {NonNegativeInteger} offsetWork - starting index for `WORK`
* @throws {TypeError} first argument must be a valid matrix triangle
* @returns {number} reciprocal pivot growth factor
*/
function zla_porpvgrw( uplo, ncols, A, strideA1, strideA2, offsetA, AF, strideAF1, strideAF2, offsetAF, WORK, strideWork, offsetWork ) { // eslint-disable-line max-len, max-params
	var need;
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	// Caller owns the workspace; assert it is a sufficiently large array so an
	// under-sized (or non-array) buffer is a loud RangeError, not a silent NaN.
	// WORK (length >= 2*ncols) is only touched when ncols > 0.
	if ( ncols > 0 ) {
		need = 2 * ncols;
		if ( !WORK || ( WORK.length - offsetWork ) < need ) {
			throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', need, offsetWork, ( WORK ) ? WORK.length : 0 ) ); // eslint-disable-line max-len
		}
	}
	return base( uplo, ncols, A, strideA1, strideA2, offsetA, AF, strideAF1, strideAF2, offsetAF, WORK, strideWork, offsetWork ); // eslint-disable-line max-len
}


// EXPORTS //

export default zla_porpvgrw;
