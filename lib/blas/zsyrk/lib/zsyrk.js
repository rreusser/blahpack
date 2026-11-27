/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the BLAS 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

// MODULES //

import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Performs one of the symmetric rank k operations C := α·A·Aᵀ + β·C, or C := α·Aᵀ·A + β·C.
*
* @param {Layout} order - storage layout (`'row-major'` or `'column-major'`)
* @param {MatrixTriangle} uplo - whether the upper or lower triangular part of the array C is to be referenced as follows: `uplo === 'upper'` Only the upper triangular part of C is to be referenced. `uplo === 'lower'` Only the lower triangular part of C is to be referenced.
* @param {('no-transpose'|'transpose')} trans - the operation to be performed as follows: `trans === 'no-transpose'` C := alpha*A*A**T + beta*C. `trans === 'transpose'` C := alpha*A**T*A + beta*C.
* @param {NonNegativeInteger} N - the order of the matrix C.
* @param {NonNegativeInteger} K - on entry with `trans === 'no-transpose'`, K specifies the number of columns of the matrix A, and on entry with `trans === 'transpose'`, K specifies the number of rows of the matrix A.
* @param {Complex128} alpha - the scalar alpha.
* @param {Complex128Array} A - k when `trans === 'no-transpose'`, and is n otherwise.
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Complex128} beta - the scalar beta.
* @param {Complex128Array} C - before entry with `uplo === 'upper'`, the leading n by n upper triangular part of the array C must contain the upper triangular part of the symmetric matrix and the strictly lower triangular part of C is not referenced. On exit, the upper triangular part of the array C is overwritten by the upper triangular part of the updated matrix.
* @param {PositiveInteger} LDC - leading dimension of `C`
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be a valid matrix triangle
* @throws {TypeError} third argument must be one of the following: "no-transpose", "transpose"
* @throws {RangeError} fourth argument must be a nonnegative integer
* @throws {RangeError} fifth argument must be a nonnegative integer
* @throws {RangeError} eighth argument must be greater than or equal to `max( 1, trans === 'no-transpose' ? N : K )` (column-major)
* @throws {RangeError} eighth argument must be greater than or equal to `max( 1, trans === 'no-transpose' ? K : N )` (row-major)
* @throws {RangeError} eleventh argument must be greater than or equal to `max( 1, N )`
* @returns {Complex128Array} output array
*/
function zsyrk( order, uplo, trans, N, K, alpha, A, LDA, beta, C, LDC ) { // eslint-disable-line max-len, max-params
	let sa1, sa2, sc1, sc2;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
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
	if ( order === 'column-major' && ( LDA < max( 1, trans === 'no-transpose' ? N : K ) ) ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be greater than or equal to max(1,%d). Value: `%d`.', trans === 'no-transpose' ? N : K, LDA ) );
	}
	if ( order === 'row-major' && ( LDA < max( 1, trans === 'no-transpose' ? K : N ) ) ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be greater than or equal to max(1,%d). Value: `%d`.', trans === 'no-transpose' ? K : N, LDA ) );
	}
	if ( LDC < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Eleventh argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDC ) );
	}

	if ( order === 'column-major' ) {
		sa1 = 1;
		sa2 = LDA;
	} else {
		sa1 = LDA;
		sa2 = 1;
	}
	if ( order === 'column-major' ) {
		sc1 = 1;
		sc2 = LDC;
	} else {
		sc1 = LDC;
		sc2 = 1;
	}
	return base( uplo, trans, N, K, alpha, A, sa1, sa2, 0, beta, C, sc1, sc2, 0 );
}


// EXPORTS //

export default zsyrk;
