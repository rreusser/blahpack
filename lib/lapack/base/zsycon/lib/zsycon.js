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
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Estimates the reciprocal of the condition number (in the 1-norm) of a complex symmetric matrix A using the factorization A = U·D·Uᵀ or A = L·D·Lᵀ computed by ZSYTRF.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {string} uplo - specifies whether the details of the factorization are stored as an upper or lower triangular matrix. `'upper'`: Upper triangular, form is A = U*D*U**T; `'lower'`: Lower triangular, form is A = L*D*L**T.
* @param {NonNegativeInteger} N - the order of the matrix A.
* @param {Complex128Array} A - the block diagonal matrix D and the multipliers used to obtain the factor U or L as computed by ZSYTRF.
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Int32Array} IPIV - details of the interchanges and the block structure of D as determined by ZSYTRF (0-based).
* @param {integer} strideIPIV - stride length for `IPIV`
* @param {number} anorm - the 1-norm of the original matrix A.
* @param {Float64Array} rcond - the reciprocal of the condition number of the matrix A, computed as RCOND = 1/(ANORM * AINVNM), where AINVNM is an estimate of the 1-norm of inv(A) computed in this routine.
* @param {(Complex128Array|null)} WORK - caller-provided workspace of at least `2 * N` elements
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be a valid matrix triangle
* @throws {RangeError} third argument must be a nonnegative integer
* @throws {RangeError} fifth argument must be greater than or equal to `max( 1, N )`
* @throws {RangeError} eighth argument is invalid (rejected when `anorm < 0`)
* @throws {TypeError} if a string argument is not a valid option
* @returns {integer} info status code
*/
function zsycon( order, uplo, N, A, LDA, IPIV, strideIPIV, anorm, rcond, WORK ) { // eslint-disable-line max-len, max-params

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
		throw new RangeError( format( 'invalid argument. Eighth argument is invalid (rejected when `anorm < 0`). Value: `%s`.', anorm ) );
	}
	const sa1 = ( order === 'column-major' ) ? 1 : LDA;
	const sa2 = ( order === 'column-major' ) ? LDA : 1;
	const oipiv = stride2offset( N, strideIPIV );
	if ( WORK === null || WORK === void 0 ) {
		const minWork = Math.max( 1, 2 * N );
		WORK = new Complex128Array( minWork );
	}
	return base( uplo, N, A, sa1, sa2, 0, IPIV, strideIPIV, oipiv, anorm, rcond, WORK, 1, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default zsycon;
