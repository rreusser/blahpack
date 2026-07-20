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
import isDiagonalType from '@stdlib/blas/base/assert/is-diagonal-type/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Estimates the reciprocal of the condition number of a complex triangular matrix A.
*
* @param {string} norm - `'one-norm'` or `'inf-norm'`
* @param {string} uplo - `'upper'` or `'lower'`
* @param {string} diag - `'unit'` or `'non-unit'`
* @param {NonNegativeInteger} N - order of the matrix A
* @param {Complex128Array} A - input matrix
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Float64Array} RCOND - output array (single element) receiving the reciprocal condition number
* @param {(Complex128Array|null)} WORK - workspace (>= `2*N` complex elements); auto-allocated when `null`
* @param {integer} strideWork - `WORK` stride length
* @param {(Float64Array|null)} RWORK - workspace (>= `N` reals); auto-allocated when `null`
* @param {integer} strideRWork - `RWORK` stride length
* @throws {TypeError} first argument must be a valid norm
* @throws {TypeError} second argument must be a valid matrix triangle
* @throws {TypeError} third argument must be a valid diagonal type
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info status code
*/
function ztrcon( norm, uplo, diag, N, A, LDA, RCOND, WORK, strideWork, RWORK, strideRWork ) {
	const sa1 = 1;
	const sa2 = LDA;

	if ( norm !== 'one-norm' && norm !== 'inf-norm' ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid norm. Value: `%s`.', norm ) );
	}
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( !isDiagonalType( diag ) ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid diagonal type. Value: `%s`.', diag ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be greater than or equal to max(1,N). Value: `%d`.', LDA ) );
	}
	if ( WORK === null || WORK === void 0 ) {
		WORK = new Complex128Array( max( 1, 2*N ) );
		strideWork = 1;
	}
	if ( RWORK === null || RWORK === void 0 ) {
		RWORK = new Float64Array( max( 1, N ) );
		strideRWork = 1;
	}
	const owork = stride2offset( 2*N, strideWork );
	const orwork = stride2offset( N, strideRWork );
	return base( norm, uplo, diag, N, A, sa1, sa2, 0, RCOND, WORK, strideWork, owork, RWORK, strideRWork, orwork );
}


// EXPORTS //

export default ztrcon;
