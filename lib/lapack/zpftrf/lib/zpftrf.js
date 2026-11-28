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

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes the Cholesky factorization of a complex Hermitian positive definite matrix in Rectangular Full Packed format.
*
* @param {('no-transpose'|'conjugate-transpose')} transr - specifies the storage format (`'no-transpose'` or `'conjugate-transpose'`)
* @param {MatrixTriangle} uplo - specifies whether the upper or lower triangle is stored (`'upper'` or `'lower'`)
* @param {NonNegativeInteger} N - order of the matrix
* @param {Complex128Array} A - input/output array in RFP format
* @param {integer} strideA - stride length for `A`
* @throws {TypeError} first argument must be one of the following: "conjugate-transpose", "no-transpose"
* @throws {TypeError} second argument must be a valid matrix triangle
* @throws {RangeError} third argument must be a nonnegative integer
* @throws {TypeError} if a string argument is not a valid option
* @returns {integer} status code (0 = success)
*/
function zpftrf( transr, uplo, N, A, strideA ) {
	if ( transr !== 'conjugate-transpose' && transr !== 'no-transpose' ) {
		throw new TypeError( format( 'invalid argument. First argument must be one of the following: "conjugate-transpose", "no-transpose". Value: `%s`.', transr ) );
	}
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	const oa = stride2offset( N * ( N + 1 ) / 2, strideA );
	return base( transr, uplo, N, A, strideA, oa );
}


// EXPORTS //

export default zpftrf;
