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
import isTransposeOperation from '@stdlib/blas/base/assert/is-transpose-operation/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Performs one of the matrix-vector operations y := α·A·x + β·y, or y := α·Aᵀ·x + β·y, or y := α·Aᴴ·x + β·y.
*
* @param {Layout} order - storage layout (`'row-major'` or `'column-major'`)
* @param {TransposeOperation} trans - the operation to be performed as follows: `trans === 'no-transpose'` y := alpha*A*x + beta*y. `trans === 'transpose'` y := alpha*A**T*x + beta*y. `trans === 'conjugate-transpose'` y := alpha*A**H*x + beta*y.
* @param {NonNegativeInteger} M - the number of rows of the matrix A.
* @param {NonNegativeInteger} N - the number of columns of the matrix A.
* @param {NonNegativeInteger} kl - the number of sub-diagonals of the matrix A.
* @param {NonNegativeInteger} ku - the number of super-diagonals of the matrix A.
* @param {Complex128} alpha - the scalar alpha.
* @param {Complex128Array} A - before entry, the leading ( kl + ku + 1 ) by n part of the array A must contain the matrix of coefficients, supplied column by column, with the leading diagonal of the matrix in row ( ku + 1 ) of the array, the first super-diagonal starting at position 2 in row ku, the first sub-diagonal starting at position 1 in row ( ku + 2 ), and so on.
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Complex128Array} x - before entry, the incremented array X must contain the vector x.
* @param {integer} strideX - stride length for `x`
* @param {Complex128} beta - the scalar beta.
* @param {Complex128Array} y - before entry, the incremented array Y must contain the vector y. On exit, Y is overwritten by the updated vector y.
* @param {integer} strideY - stride length for `y`
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be a valid transpose operation
* @throws {RangeError} third argument must be a nonnegative integer
* @throws {RangeError} fourth argument must be a nonnegative integer
* @throws {RangeError} fifth argument must be a nonnegative integer
* @throws {RangeError} sixth argument must be a nonnegative integer
* @throws {RangeError} ninth argument must be greater than or equal to `kl + ku + 1` (column-major)
* @throws {RangeError} ninth argument must be greater than or equal to `max( 1, N )` (row-major)
* @throws {RangeError} eleventh argument must be non-zero
* @throws {RangeError} fourteenth argument must be non-zero
* @returns {Complex128Array} output array
*/
function zgbmv( order, trans, M, N, kl, ku, alpha, A, LDA, x, strideX, beta, y, strideY ) { // eslint-disable-line max-len, max-params
	let sa1, sa2;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( !isTransposeOperation( trans ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid transpose operation. Value: `%s`.', trans ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( kl < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', kl ) );
	}
	if ( ku < 0 ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be a nonnegative integer. Value: `%d`.', ku ) );
	}
	if ( order === 'column-major' && ( LDA < kl + ku + 1 ) ) {
		throw new RangeError( format( 'invalid argument. Ninth argument must be greater than or equal to %d. Value: `%d`.', kl + ku + 1, LDA ) );
	}
	if ( order === 'row-major' && ( LDA < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Ninth argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDA ) );
	}
	if ( strideX === 0 ) {
		throw new RangeError( format( 'invalid argument. Eleventh argument must be non-zero. Value: `%d`.', strideX ) );
	}
	if ( strideY === 0 ) {
		throw new RangeError( format( 'invalid argument. Fourteenth argument must be non-zero. Value: `%d`.', strideY ) );
	}

	if ( order === 'column-major' ) {
		sa1 = 1;
		sa2 = LDA;
	} else {
		sa1 = LDA;
		sa2 = 1;
	}
	const ox = stride2offset( ( trans === 'no-transpose' ) ? N : M, strideX );
	const oy = stride2offset( ( trans === 'no-transpose' ) ? M : N, strideY );
	return base( trans, M, N, kl, ku, alpha, A, sa1, sa2, 0, x, strideX, ox, beta, y, strideY, oy );
}


// EXPORTS //

export default zgbmv;
