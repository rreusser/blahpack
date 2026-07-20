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
* Estimates the reciprocal of the condition number of a complex Hermitian positive definite band matrix A.
*
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the matrix A
* @param {NonNegativeInteger} kd - number of super-/sub-diagonals of A
* @param {Complex128Array} AB - banded Cholesky factor (from `zpbtrf`)
* @param {PositiveInteger} LDAB - leading dimension of `AB` (>= `kd+1`)
* @param {number} anorm - the 1-norm of the original matrix
* @param {Float64Array} rcond - output array (single element) receiving the reciprocal condition number
* @param {(Complex128Array|null)} WORK - workspace (>= `2*N` complex elements); auto-allocated when `null`
* @param {integer} strideWork - `WORK` stride length
* @param {(Float64Array|null)} RWORK - workspace (>= `N` reals); auto-allocated when `null`
* @param {integer} strideRWork - `RWORK` stride length
* @throws {TypeError} first argument must be a valid matrix triangle
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info status code
*/
function zpbcon( uplo, N, kd, AB, LDAB, anorm, rcond, WORK, strideWork, RWORK, strideRWork ) {
	const sab1 = 1;
	const sab2 = LDAB;

	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( kd < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', kd ) );
	}
	if ( LDAB < ( kd + 1 ) ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be greater than or equal to kd+1. Value: `%d`.', LDAB ) );
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
	return base( uplo, N, kd, AB, sab1, sab2, 0, anorm, rcond, WORK, strideWork, owork, RWORK, strideRWork, orwork );
}


// EXPORTS //

export default zpbcon;
