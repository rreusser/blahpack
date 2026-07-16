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

import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// VARIABLES //

var NB = 32; // Block size (must match base.js)


// MAIN //

/**
* Computes the factorization of a complex symmetric matrix `A` using the bounded Bunch-Kaufman ("rook") diagonal pivoting method (blocked algorithm).
*
* @param {string} order - storage layout (`'row-major'` or `'column-major'`)
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the matrix `A`
* @param {Complex128Array} A - input/output complex symmetric matrix
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Int32Array} IPIV - pivot index output array
* @param {integer} strideIPIV - stride length for `IPIV`
* @param {(Complex128Array|null)} WORK - caller-provided workspace (length `>= N*NB` with `NB = 32` when `N > NB`); `null` requests internal allocation
* @param {integer} strideWork - stride for `WORK` (in complex elements)
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be a valid matrix triangle
* @throws {RangeError} third argument must be a nonnegative integer
* @throws {RangeError} fifth argument must be greater than or equal to `max(1,N)`
* @returns {integer} `info` - 0 if successful, k>0 (1-based) if `D(k,k)` is exactly zero
*/
function zsytrfRook( order, uplo, N, A, LDA, IPIV, strideIPIV, WORK, strideWork ) {
	var sa1;
	var sa2;
	var oi;
	var ow;

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
	oi = stride2offset( N, strideIPIV );
	if ( WORK === null || WORK === void 0 ) {
		WORK = new Complex128Array( max( 1, N * NB ) );
		strideWork = 1;
	}
	ow = stride2offset( max( 1, N * NB ), strideWork );
	return base( uplo, N, A, sa1, sa2, 0, IPIV, strideIPIV, oi, WORK, strideWork, ow );
}


// EXPORTS //

export default zsytrfRook;
