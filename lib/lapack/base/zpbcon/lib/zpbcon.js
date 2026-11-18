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
import format from '@stdlib/string/format/lib/index.js';
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Estimates the reciprocal of the condition number of a complex Hermitian positive definite band matrix A.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the matrix A
* @param {NonNegativeInteger} kd - number of super-/sub-diagonals of A
* @param {Complex128Array} AB - banded Cholesky factor (from `zpbtrf`)
* @param {PositiveInteger} LDAB - leading dimension of `AB` (>= `kd+1`)
* @param {number} anorm - the 1-norm of the original matrix
* @param {Float64Array} rcond - output array (single element) receiving the reciprocal condition number
* @param {(Complex128Array|null)} WORK - workspace (>= `2*N` complex elements); auto-allocated when `null`
* @param {(Float64Array|null)} RWORK - workspace (>= `N` reals); auto-allocated when `null`
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be a valid matrix triangle
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info status code
*/
function zpbcon( order, uplo, N, kd, AB, LDAB, anorm, rcond, WORK, RWORK ) {
	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	const sab1 = ( order === 'column-major' ) ? 1 : LDAB;
	const sab2 = ( order === 'column-major' ) ? LDAB : 1;

	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( kd < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', kd ) );
	}
	if ( order === 'column-major' && ( LDAB < kd + 1 ) ) {
		throw new RangeError( format( 'invalid argument. Sixth argument violates the reference leading-dimension rule (column-major: rejected when `LDAB.LT.KD+1`). Value: `%d`.', LDAB ) );
	}
	if ( order === 'row-major' && ( LDAB < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Sixth argument violates the reference leading-dimension rule (row-major: must also cover the N columns). Value: `%d`.', LDAB ) );
	}
	if ( WORK === null || WORK === void 0 ) {
		WORK = new Complex128Array( max( 1, 2*N ) );
	}
	if ( RWORK === null || RWORK === void 0 ) {
		RWORK = new Float64Array( max( 1, N ) );
	}
	return base( uplo, N, kd, AB, sab1, sab2, 0, anorm, rcond, WORK, 1, 0, RWORK, 1, 0 );
}


// EXPORTS //

export default zpbcon;
