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
import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import isTransposeOperation from '@stdlib/blas/base/assert/is-transpose-operation/lib/index.js';
import isDiagonalType from '@stdlib/blas/base/assert/is-diagonal-type/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Performs one of the matrix-vector operations x := A·x, or x := Aᵀ·x, or x := Aᴴ·x.
*
* @param {Layout} order - storage layout (`'row-major'` or `'column-major'`)
* @param {MatrixTriangle} uplo - whether the matrix is an upper or lower triangular matrix as follows: `uplo === 'upper'` A is an upper triangular matrix. `uplo === 'lower'` A is a lower triangular matrix.
* @param {TransposeOperation} trans - the operation to be performed as follows: `trans === 'no-transpose'` x := A*x. `trans === 'transpose'` x := A**T*x. `trans === 'conjugate-transpose'` x := A**H*x.
* @param {DiagonalType} diag - whether or not A is unit triangular as follows: `diag === 'unit'` A is assumed to be unit triangular. `diag === 'non-unit'` A is not assumed to be unit triangular.
* @param {NonNegativeInteger} N - the order of the matrix A.
* @param {NonNegativeInteger} K - on entry with `uplo === 'upper'`, K specifies the number of super-diagonals of the matrix A.
* @param {Complex128Array} A - before entry with `uplo === 'upper'`, the leading ( k + 1 ) by n part of the array A must contain the upper triangular band part of the matrix of coefficients, supplied column by column, with the leading diagonal of the matrix in row ( k + 1 ) of the array, the first super-diagonal starting at position 2 in row k, and so on.
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Complex128Array} x - before entry, the incremented array X must contain the n element vector x. On exit, X is overwritten with the transformed vector x.
* @param {integer} strideX - stride length for `x`
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be a valid matrix triangle
* @throws {TypeError} third argument must be a valid transpose operation
* @throws {TypeError} fourth argument must be a valid diagonal type
* @throws {RangeError} fifth argument must be a nonnegative integer
* @throws {RangeError} sixth argument must be a nonnegative integer
* @throws {RangeError} eighth argument must be greater than or equal to `K + 1` (column-major)
* @throws {RangeError} eighth argument must be greater than or equal to `max( 1, N )` (row-major)
* @throws {RangeError} tenth argument must be non-zero
* @returns {Complex128Array} output array
*/
function ztbmv( order, uplo, trans, diag, N, K, A, LDA, x, strideX ) { // eslint-disable-line max-len, max-params
	let sa1, sa2;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( !isTransposeOperation( trans ) ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid transpose operation. Value: `%s`.', trans ) );
	}
	if ( !isDiagonalType( diag ) ) {
		throw new TypeError( format( 'invalid argument. Fourth argument must be a valid diagonal type. Value: `%s`.', diag ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( K < 0 ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be a nonnegative integer. Value: `%d`.', K ) );
	}
	if ( order === 'column-major' && ( LDA < K + 1 ) ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be greater than or equal to %d. Value: `%d`.', K + 1, LDA ) );
	}
	if ( order === 'row-major' && ( LDA < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDA ) );
	}
	if ( strideX === 0 ) {
		throw new RangeError( format( 'invalid argument. Tenth argument must be non-zero. Value: `%d`.', strideX ) );
	}

	if ( order === 'column-major' ) {
		sa1 = 1;
		sa2 = LDA;
	} else {
		sa1 = LDA;
		sa2 = 1;
	}
	const ox = stride2offset( N, strideX );
	return base( uplo, trans, diag, N, K, A, sa1, sa2, 0, x, strideX, ox );
}


// EXPORTS //

export default ztbmv;
