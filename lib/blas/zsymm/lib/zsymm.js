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
import isOperationSide from '@stdlib/blas/base/assert/is-operation-side/lib/index.js';
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Performs one of the matrix-matrix operations C := α·A·B + β·C, or C := α·B·A + β·C.
*
* @param {Layout} order - storage layout (`'row-major'` or `'column-major'`)
* @param {OperationSide} side - whether the symmetric matrix A appears on the left or right in the operation as follows: `side === 'left'` C := alpha*A*B + beta*C, `side === 'right'` C := alpha*B*A + beta*C.
* @param {MatrixTriangle} uplo - whether the upper or lower triangular part of the symmetric matrix A is to be referenced as follows: `uplo === 'upper'` Only the upper triangular part of the symmetric matrix is to be referenced. `uplo === 'lower'` Only the lower triangular part of the symmetric matrix is to be referenced.
* @param {NonNegativeInteger} M - the number of rows of the matrix C.
* @param {NonNegativeInteger} N - the number of columns of the matrix C.
* @param {Complex128} alpha - the scalar alpha.
* @param {Complex128Array} A - m when `side === 'left'` and is n otherwise.
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Complex128Array} B - before entry, the leading m by n part of the array B must contain the matrix B.
* @param {PositiveInteger} LDB - leading dimension of `B`
* @param {Complex128} beta - the scalar beta.
* @param {Complex128Array} C - before entry, the leading m by n part of the array C must contain the matrix C, except when beta is zero, in which case C need not be set on entry. On exit, the array C is overwritten by the m by n updated matrix.
* @param {PositiveInteger} LDC - leading dimension of `C`
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be a valid operation side
* @throws {TypeError} third argument must be a valid matrix triangle
* @throws {RangeError} fourth argument must be a nonnegative integer
* @throws {RangeError} fifth argument must be a nonnegative integer
* @throws {RangeError} eighth argument must be greater than or equal to `max( 1, side === 'left' ? M : N )`
* @throws {RangeError} tenth argument must be greater than or equal to `max( 1, M )` (column-major)
* @throws {RangeError} tenth argument must be greater than or equal to `max( 1, N )` (row-major)
* @throws {RangeError} thirteenth argument must be greater than or equal to `max( 1, M )` (column-major)
* @throws {RangeError} thirteenth argument must be greater than or equal to `max( 1, N )` (row-major)
* @returns {Complex128Array} output array
*/
function zsymm( order, side, uplo, M, N, alpha, A, LDA, B, LDB, beta, C, LDC ) { // eslint-disable-line max-len, max-params
	let sa1, sa2, sb1, sb2, sc1, sc2;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( !isOperationSide( side ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid operation side. Value: `%s`.', side ) );
	}
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( LDA < max( 1, side === 'left' ? M : N ) ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be greater than or equal to max(1,%d). Value: `%d`.', side === 'left' ? M : N, LDA ) );
	}
	if ( order === 'column-major' && ( LDB < max( 1, M ) ) ) {
		throw new RangeError( format( 'invalid argument. Tenth argument must be greater than or equal to max(1,%d). Value: `%d`.', M, LDB ) );
	}
	if ( order === 'row-major' && ( LDB < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Tenth argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDB ) );
	}
	if ( order === 'column-major' && ( LDC < max( 1, M ) ) ) {
		throw new RangeError( format( 'invalid argument. Thirteenth argument must be greater than or equal to max(1,%d). Value: `%d`.', M, LDC ) );
	}
	if ( order === 'row-major' && ( LDC < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Thirteenth argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDC ) );
	}

	if ( order === 'column-major' ) {
		sa1 = 1;
		sa2 = LDA;
	} else {
		sa1 = LDA;
		sa2 = 1;
	}
	if ( order === 'column-major' ) {
		sb1 = 1;
		sb2 = LDB;
	} else {
		sb1 = LDB;
		sb2 = 1;
	}
	if ( order === 'column-major' ) {
		sc1 = 1;
		sc2 = LDC;
	} else {
		sc1 = LDC;
		sc2 = 1;
	}
	return base( side, uplo, M, N, alpha, A, sa1, sa2, 0, B, sb1, sb2, 0, beta, C, sc1, sc2, 0 );
}


// EXPORTS //

export default zsymm;
