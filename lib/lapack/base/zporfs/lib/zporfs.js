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

import format from '@stdlib/string/format/lib/index.js';
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Improves the computed solution to a complex Hermitian positive definite system and provides error bounds and backward error estimates.
*
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the matrix A
* @param {NonNegativeInteger} nrhs - number of right-hand side columns
* @param {Complex128Array} A - original Hermitian matrix
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Complex128Array} AF - Cholesky factorization of `A` (from `zpotrf`)
* @param {PositiveInteger} LDAF - leading dimension of `AF`
* @param {Complex128Array} B - right-hand side matrix
* @param {PositiveInteger} LDB - leading dimension of `B`
* @param {Complex128Array} X - solution matrix; refined in place
* @param {PositiveInteger} LDX - leading dimension of `X`
* @param {Float64Array} FERR - output forward error bounds (length `nrhs`)
* @param {Float64Array} BERR - output backward error estimates (length `nrhs`)
* @param {(Complex128Array|null)} WORK - workspace (>= `2*N` complex elements); auto-allocated when `null`
* @param {(Float64Array|null)} RWORK - workspace (>= `N` reals); auto-allocated when `null`
* @throws {TypeError} first argument must be a valid matrix triangle
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info status code
*/
function zporfs( uplo, N, nrhs, A, LDA, AF, LDAF, B, LDB, X, LDX, FERR, BERR, WORK, RWORK ) {
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
	if ( LDAF < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be greater than or equal to max(1,N). Value: `%d`.', LDAF ) );
	}
	if ( LDB < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Ninth argument must be greater than or equal to max(1,N). Value: `%d`.', LDB ) );
	}
	if ( LDX < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Eleventh argument must be greater than or equal to max(1,N). Value: `%d`.', LDX ) );
	}
	if ( WORK === null || WORK === void 0 ) {
		WORK = new Complex128Array( max( 1, 2*N ) );
	}
	if ( RWORK === null || RWORK === void 0 ) {
		RWORK = new Float64Array( max( 1, N ) );
	}
	return base( uplo, N, nrhs, A, 1, LDA, 0, AF, 1, LDAF, 0, B, 1, LDB, 0, X, 1, LDX, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 );
}


// EXPORTS //

export default zporfs;
