/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable max-len, max-params */

// MODULES //

import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import strided from './strided.js';


// MAIN //

/**
* Estimates the reciprocal of the 1-norm condition number of a real symmetric matrix `A` using the factorization computed by `dsytrf_rk`.
*
* @param {Layout} order - storage layout (`'row-major'` or `'column-major'`)
* @param {MatrixTriangle} uplo - `'upper'` or `'lower'`, must match the factorization
* @param {NonNegativeInteger} N - order of the matrix `A`
* @param {Float64Array} A - factored matrix from `dsytrf_rk`
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Float64Array} e - super- or sub-diagonal entries of the block diagonal matrix `D`
* @param {integer} strideE - stride length for `e`
* @param {Int32Array} IPIV - pivot indices from `dsytrf_rk`
* @param {integer} strideIPIV - stride length for `IPIV`
* @param {number} anorm - the 1-norm of the original matrix `A`
* @param {Float64Array} rcond - output: `rcond[0]` is the reciprocal condition number
* @param {(Float64Array|null)} WORK - workspace array of length at least `2*N`
* @param {(Int32Array|null)} IWORK - workspace array of length at least `N`
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be a valid matrix triangle
* @throws {RangeError} third argument must be a nonnegative integer
* @throws {RangeError} fifth argument must be greater than or equal to `max( 1, N )`
* @throws {RangeError} tenth argument is invalid (rejected when `anorm < 0`)
* @returns {integer} status code (0 = success)
*/
function dsycon3( order, uplo, N, A, LDA, e, strideE, IPIV, strideIPIV, anorm, rcond, WORK, IWORK ) {
	let sa1, sa2;

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
		throw new RangeError( format( 'invalid argument. Fifth argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDA ) );
	}
	if ( anorm < 0 ) {
		throw new RangeError( format( 'invalid argument. Tenth argument is invalid (rejected when `anorm < 0`). Value: `%s`.', anorm ) );
	}
	if ( order === 'column-major' ) {
		sa1 = 1;
		sa2 = LDA;
	} else {
		sa1 = LDA;
		sa2 = 1;
	}
	if ( WORK === null || WORK === void 0 ) {
		WORK = new Float64Array( 2 * N );
	}
	if ( IWORK === null || IWORK === void 0 ) {
		IWORK = new Int32Array( N );
	}
	const oe = stride2offset( N, strideE );
	const oipiv = stride2offset( N, strideIPIV );
	return strided( uplo, N, A, sa1, sa2, 0, e, strideE, oe, IPIV, strideIPIV, oipiv, anorm, rcond, WORK, 1, 0, IWORK, 1, 0 );
}


// EXPORTS //

export default dsycon3;
