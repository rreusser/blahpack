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
import format from '@stdlib/string/format/lib/index.js';
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import isDiagonalType from '@stdlib/blas/base/assert/is-diagonal-type/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Estimates the reciprocal of the condition number of a triangular matrix A, in either the 1-norm or the infinity-norm.
*
* @param {Layout} order - storage layout ('row-major' or 'column-major')
* @param {('one-norm'|'inf-norm')} norm - specifies whether the 1-norm condition number or the infinity-norm condition number is required: `'one-norm'`: 1-norm; `'inf-norm'`: Infinity-norm.
* @param {MatrixTriangle} uplo - `'upper'`: A is upper triangular; `'lower'`: A is lower triangular.
* @param {DiagonalType} diag - `'non-unit'`: A is non-unit triangular; `'unit'`: A is unit triangular.
* @param {NonNegativeInteger} N - the order of the matrix A.
* @param {Float64Array} A - the triangular matrix A.
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Float64Array} RCOND - the reciprocal of the condition number of the matrix A, computed as RCOND = 1/(norm(A) * norm(inv(A))).
* @param {(Float64Array|null)} WORK - caller-provided workspace of at least `3 * N` elements
* @param {(Int32Array|null)} IWORK - caller-provided workspace of at least `N` elements
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be one of the following: "inf-norm", "one-norm", "one-norm"
* @throws {TypeError} third argument must be a valid matrix triangle
* @throws {TypeError} fourth argument must be a valid diagonal type
* @throws {RangeError} fifth argument must be a nonnegative integer
* @throws {RangeError} seventh argument must be greater than or equal to `max( 1, N )`
* @throws {TypeError} if a string argument is not a valid option
* @returns {integer} info status code
*/
function dtrcon( order, norm, uplo, diag, N, A, LDA, RCOND, WORK, IWORK ) { // eslint-disable-line max-len, max-params

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( norm !== 'inf-norm' && norm !== 'one-norm' && norm !== 'one-norm' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be one of the following: "inf-norm", "one-norm", "one-norm". Value: `%s`.', norm ) );
	}
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( !isDiagonalType( diag ) ) {
		throw new TypeError( format( 'invalid argument. Fourth argument must be a valid diagonal type. Value: `%s`.', diag ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDA ) );
	}
	const sa1 = ( order === 'column-major' ) ? 1 : LDA;
	const sa2 = ( order === 'column-major' ) ? LDA : 1;
	if ( WORK === null || WORK === void 0 ) {
		const minWork = Math.max( 1, 3 * N );
		WORK = new Float64Array( minWork );
	}
	if ( IWORK === null || IWORK === void 0 ) {
		const minIwork = Math.max( 1, N );
		IWORK = new Int32Array( minIwork );
	}
	return base( norm, uplo, diag, N, A, sa1, sa2, 0, RCOND, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default dtrcon;
