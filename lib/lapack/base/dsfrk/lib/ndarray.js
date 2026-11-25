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
* Performs a symmetric rank-k operation for a matrix in Rectangular Full Packed format.
*
* @param {('no-transpose'|'transpose')} transr - specifies the storage format (`'no-transpose'` or `'transpose'`)
* @param {MatrixTriangle} uplo - specifies whether the upper or lower triangle is stored (`'upper'` or `'lower'`)
* @param {('no-transpose'|'transpose')} trans - specifies the operation (`'no-transpose'` or `'transpose'`)
* @param {NonNegativeInteger} N - order of the symmetric matrix C
* @param {NonNegativeInteger} K - number of columns of A (if trans='no-transpose') or rows (if trans='transpose')
* @param {number} alpha - scalar multiplier for A*A^T or A^T*A
* @param {Float64Array} A - input matrix
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {number} beta - scalar multiplier for C
* @param {Float64Array} C - RFP array of length N*(N+1)/2
* @param {integer} strideC - stride length for `C`
* @param {NonNegativeInteger} offsetC - starting index for `C`
* @throws {TypeError} first argument must be one of the following: "no-transpose", "transpose"
* @throws {TypeError} second argument must be a valid matrix triangle
* @throws {TypeError} third argument must be one of the following: "no-transpose", "transpose"
* @throws {RangeError} fourth argument must be a nonnegative integer
* @throws {RangeError} fifth argument must be a nonnegative integer
* @returns {Float64Array} `C`
*/
function dsfrk( transr, uplo, trans, N, K, alpha, A, strideA1, strideA2, offsetA, beta, C, strideC, offsetC ) { // eslint-disable-line max-len, max-params
	if ( transr !== 'no-transpose' && transr !== 'transpose' ) {
		throw new TypeError( format( 'invalid argument. First argument must be one of the following: "no-transpose", "transpose". Value: `%s`.', transr ) );
	}
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( trans !== 'no-transpose' && trans !== 'transpose' ) {
		throw new TypeError( format( 'invalid argument. Third argument must be one of the following: "no-transpose", "transpose". Value: `%s`.', trans ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( K < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', K ) );
	}
	return base( transr, uplo, trans, N, K, alpha, A, strideA1, strideA2, offsetA, beta, C, strideC, offsetC ); // eslint-disable-line max-len
}


// EXPORTS //

export default dsfrk;
