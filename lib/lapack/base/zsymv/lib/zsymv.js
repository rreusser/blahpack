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

import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes a matrix-vector product for a complex symmetric matrix.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {string} uplo - whether the upper or lower triangular part of the array A is to be referenced as follows: `uplo === 'upper'` Only the upper triangular part of A is to be referenced. `uplo === 'lower'` Only the lower triangular part of A is to be referenced. Unchanged on exit.
* @param {NonNegativeInteger} N - the order of the matrix A.
* @param {Complex128} alpha - the scalar alpha.
* @param {Complex128Array} A - before entry, with `uplo === 'upper'`, the leading n by n upper triangular part of the array A must contain the upper triangular part of the symmetric matrix and the strictly lower triangular part of A is not referenced.
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Complex128Array} x - before entry, the incremented array X must contain the N- element vector x.
* @param {integer} strideX - stride length for `x`
* @param {Complex128} beta - the scalar beta.
* @param {Complex128Array} y - before entry, the incremented array Y must contain the n element vector y. On exit, Y is overwritten by the updated vector y.
* @param {integer} strideY - stride length for `y`
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be a valid matrix triangle
* @throws {RangeError} third argument must be a nonnegative integer
* @throws {RangeError} sixth argument must be greater than or equal to `max( 1, N )`
* @throws {RangeError} eighth argument must be non-zero
* @throws {RangeError} eleventh argument must be non-zero
* @throws {TypeError} if a string argument is not a valid option
* @returns {Complex128Array} output array
*/
function zsymv( order, uplo, N, alpha, A, LDA, x, strideX, beta, y, strideY ) { // eslint-disable-line max-len, max-params

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDA ) );
	}
	if ( strideX === 0 ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be non-zero. Value: `%d`.', strideX ) );
	}
	if ( strideY === 0 ) {
		throw new RangeError( format( 'invalid argument. Eleventh argument must be non-zero. Value: `%d`.', strideY ) );
	}
	const sa1 = ( order === 'column-major' ) ? 1 : LDA;
	const sa2 = ( order === 'column-major' ) ? LDA : 1;
	const ox = stride2offset( N, strideX );
	const oy = stride2offset( N, strideY );
	return base( uplo, N, alpha, A, sa1, sa2, 0, x, strideX, ox, beta, y, strideY, oy );
}


// EXPORTS //

export default zsymv;
