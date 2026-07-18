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

import Float64Array from '@stdlib/array/float64/lib/index.js';
import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// VARIABLES //

const NB = 32; // Block size (must match base.js)


// MAIN //

/**
* Computes the factorization of a real symmetric indefinite matrix `A` using the bounded Bunch-Kaufman (rook) diagonal pivoting method (blocked algorithm), with the diagonal of `D` overwriting the diagonal of `A` and the off-diagonal entries of `D` returned in `e`.
*
* @param {string} order - storage layout (`'row-major'` or `'column-major'`)
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the matrix `A`
* @param {Float64Array} A - input/output symmetric matrix
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Float64Array} e - output vector containing the off-diagonal entries of `D`
* @param {integer} strideE - stride for `e`
* @param {Int32Array} IPIV - output pivot index array
* @param {integer} strideIPIV - stride for `IPIV`
* @param {(Float64Array|null)} WORK - caller-provided workspace (length `>= N*NB` with `NB = 32` when `N > NB`); `null` requests internal allocation
* @param {integer} strideWork - stride for `WORK`
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be a valid matrix triangle
* @throws {RangeError} third argument must be a nonnegative integer
* @throws {RangeError} fifth argument must be greater than or equal to `max(1,N)`
* @returns {integer} info - `0` if successful; `k>0` if `D(k,k)` is exactly zero (1-based)
*/
function dsytrfrk( order, uplo, N, A, LDA, e, strideE, IPIV, strideIPIV, WORK, strideWork ) {
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
		throw new RangeError( format( 'invalid argument. Fifth argument must be greater than or equal to max(1,N). Value: `%d`.', LDA ) );
	}
	if ( order === 'column-major' ) {
		sa1 = 1;
		sa2 = LDA;
	} else {
		sa1 = LDA;
		sa2 = 1;
	}
	const oe = stride2offset( N, strideE );
	const oi = stride2offset( N, strideIPIV );
	if ( WORK === null || WORK === void 0 ) {
		WORK = new Float64Array( max( 1, N * NB ) );
		strideWork = 1;
	}
	const ow = stride2offset( max( 1, N * NB ), strideWork );
	return base( uplo, N, A, sa1, sa2, 0, e, strideE, oe, IPIV, strideIPIV, oi, WORK, strideWork, ow );
}


// EXPORTS //

export default dsytrfrk;
