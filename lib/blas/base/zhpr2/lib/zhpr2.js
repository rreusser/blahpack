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
import base from './base.js';


// MAIN //

/**
* Performs the Hermitian rank 2 operation A := α·x·yᴴ + conj(α)·y·xᴴ + A.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {string} uplo - whether the upper or lower triangular part of the matrix A is supplied in the packed array AP as follows: `uplo === 'upper'` The upper triangular part of A is supplied in AP. `uplo === 'lower'` The lower triangular part of A is supplied in AP.
* @param {NonNegativeInteger} N - the order of the matrix A.
* @param {Complex128} alpha - the scalar alpha.
* @param {Complex128Array} x - before entry, the incremented array X must contain the n element vector x.
* @param {integer} strideX - stride length for `x`
* @param {Complex128Array} y - before entry, the incremented array Y must contain the n element vector y.
* @param {integer} strideY - stride length for `y`
* @param {Complex128Array} AP - before entry with `uplo === 'upper'`, the array AP must contain the upper triangular part of the hermitian matrix packed sequentially, column by column, so that AP( 1 ) contains a( 1, 1 ), AP( 2 ) and AP( 3 ) contain a( 1, 2 ) and a( 2, 2 ) respectively, and so on. On exit, the array AP is overwritten by the upper triangular part of the updated matrix.
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be a valid matrix triangle
* @throws {RangeError} third argument must be a nonnegative integer
* @throws {RangeError} sixth argument must be non-zero
* @throws {RangeError} eighth argument must be non-zero
* @throws {TypeError} if a string argument is not a valid option
* @returns {Complex128Array} output array
*/
function zhpr2( order, uplo, N, alpha, x, strideX, y, strideY, AP ) { // eslint-disable-line max-len, max-params

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( strideX === 0 ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be non-zero. Value: `%d`.', strideX ) );
	}
	if ( strideY === 0 ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be non-zero. Value: `%d`.', strideY ) );
	}
	if ( order === 'row-major' ) {
		throw new TypeError( format( 'invalid argument. First argument must be \'column-major\'; packed storage is LAPACK column-major packed. Value: `%s`.', order ) );
	}
	const ox = stride2offset( N, strideX );
	const oy = stride2offset( N, strideY );
	return base( uplo, N, alpha, x, strideX, ox, y, strideY, oy, AP, 1, 0 );
}


// EXPORTS //

export default zhpr2;
