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
import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import isMatrixTranspose from '@stdlib/blas/base/assert/is-transpose-operation/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Performs a Hermitian rank-k operation for a matrix in Rectangular Full Packed format.
*
* C := alpha\*A\*A^H + beta\*C, or C := alpha\*A^H\*A + beta\*C,
* where alpha and beta are real scalars, C is an N-by-N Hermitian matrix
* stored in RFP format, and A is an N-by-K or K-by-N complex matrix.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {string} transr - specifies the storage format (`'no-transpose'` or `'conjugate-transpose'`)
* @param {string} uplo - specifies whether the upper or lower triangle is stored (`'upper'` or `'lower'`)
* @param {string} trans - specifies the operation (`'no-transpose'` or `'conjugate-transpose'`)
* @param {NonNegativeInteger} N - order of Hermitian matrix C
* @param {NonNegativeInteger} K - number of columns of A (if trans='no-transpose') or rows (if trans='conjugate-transpose')
* @param {number} alpha - real scalar multiplier for A\*A^H or A^H\*A
* @param {Complex128Array} A - complex input matrix
* @param {NonNegativeInteger} LDA - leading dimension of `A`
* @param {number} beta - real scalar multiplier for C
* @param {Complex128Array} C - RFP array of length N*(N+1)/2
* @param {integer} strideC - stride length for `C`
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} if a string argument is not a valid option
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {Complex128Array} `C`
*/
function zhfrk( order, transr, uplo, trans, N, K, alpha, A, LDA, beta, C, strideC ) {
	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	const oc = stride2offset( N * ( N + 1 ) / 2, strideC );
	const sa1 = ( order === 'column-major' ) ? 1 : LDA;
	const sa2 = ( order === 'column-major' ) ? LDA : 1;
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( !isMatrixTranspose( trans ) ) {
		throw new TypeError( format( 'invalid argument. Fourth argument must be a valid transpose operation. Value: `%s`.', trans ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( K < 0 ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be a nonnegative integer. Value: `%d`.', K ) );
	}
	if ( order === 'column-major' && ( LDA < max( 1, ( ( trans === 'no-transpose' ) ? N : K ) ) ) ) {
		throw new RangeError( format( 'invalid argument. Ninth argument violates the reference leading-dimension rule (column-major: rejected when `LDA.LT.MAX( 1, NROWA )`). Value: `%d`.', LDA ) );
	}
	if ( order === 'row-major' && ( LDA < max( 1, ( ( trans === 'no-transpose' ) ? K : N ) ) ) ) {
		throw new RangeError( format( 'invalid argument. Ninth argument violates the reference leading-dimension rule (row-major: must also cover the NCOLA columns). Value: `%d`.', LDA ) );
	}
	if ( transr !== 'no-transpose' && transr !== 'conjugate-transpose' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid `transr` value. Value: `%s`.', transr ) );
	}
	return base( transr, uplo, trans, N, K, alpha, A, sa1, sa2, 0, beta, C, strideC, oc ); // eslint-disable-line max-len
}


// EXPORTS //

export default zhfrk;
