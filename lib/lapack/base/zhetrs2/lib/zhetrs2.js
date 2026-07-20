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

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Solves a system of linear equations A * X = B with a complex Hermitian matrix A using the factorization from `zhetrf` and converting the block-diagonal factor.
*
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of matrix A
* @param {NonNegativeInteger} nrhs - number of right-hand side columns
* @param {Complex128Array} A - block-diagonal factorization from `zhetrf`
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Int32Array} IPIV - pivot indices from `zhetrf`
* @param {integer} strideIPIV - `IPIV` stride length
* @param {Complex128Array} B - right-hand side matrix; overwritten by the solution X
* @param {PositiveInteger} LDB - leading dimension of `B`
* @param {(Complex128Array|null)} WORK - workspace (>= `N` complex elements); auto-allocated when `null`
* @param {integer} strideWork - `WORK` stride length
* @throws {TypeError} first argument must be a valid matrix triangle
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info status code
*/
function zhetrs2( uplo, N, nrhs, A, LDA, IPIV, strideIPIV, B, LDB, WORK, strideWork ) {
	const sa1 = 1;
	const sa2 = LDA;
	const sb1 = 1;
	const sb2 = LDB;

	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( nrhs < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', nrhs ) );
	}
	if ( LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be greater than or equal to max(1,N). Value: `%d`.', LDA ) );
	}
	if ( LDB < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Ninth argument must be greater than or equal to max(1,N). Value: `%d`.', LDB ) );
	}
	const oipiv = stride2offset( N, strideIPIV );
	if ( WORK === null || WORK === void 0 ) {
		WORK = new Complex128Array( max( 1, N ) );
		strideWork = 1;
	}
	const owork = stride2offset( N, strideWork );
	return base( uplo, N, nrhs, A, sa1, sa2, 0, IPIV, strideIPIV, oipiv, B, sb1, sb2, 0, WORK, strideWork, owork );
}


// EXPORTS //

export default zhetrs2;
