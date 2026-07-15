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
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Improves the computed solution to a complex Hermitian system of linear.
* equations A * X = B where A is stored in packed format, and provides
* error bounds and backward error estimates.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {string} uplo - specifies the triangle ('upper' or 'lower')
* @param {NonNegativeInteger} N - order of the matrix
* @param {NonNegativeInteger} nrhs - number of right-hand sides
* @param {Complex128Array} AP - original Hermitian packed matrix
* @param {Complex128Array} AFP - factored packed matrix from zhptrf
* @param {Int32Array} IPIV - pivot indices from zhptrf
* @param {Complex128Array} B - right-hand side matrix
* @param {PositiveInteger} LDB - leading dimension of B
* @param {Complex128Array} X - solution matrix (improved on exit)
* @param {PositiveInteger} LDX - leading dimension of X
* @param {Float64Array} FERR - output forward error bounds
* @param {Float64Array} BERR - output backward error bounds
* @param {(Complex128Array|null)} WORK - caller-owned complex workspace of at
* least `2*N` elements, or `null` to auto-allocate at the minimum required size
* @param {(Float64Array|null)} RWORK - caller-owned real workspace of at least
* `N` elements, or `null` to auto-allocate at the minimum required size
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be a valid matrix triangle
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} status code (0 = success)
*/
function zhprfs( order, uplo, N, nrhs, AP, AFP, IPIV, B, LDB, X, LDX, FERR, BERR, WORK, RWORK ) { // eslint-disable-line max-len, max-params
	var sb1;
	var sb2;
	var sx1;
	var sx2;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( nrhs < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', nrhs ) );
	}
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( LDB < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Ninth argument must be greater than or equal to max(1,N). Value: `%d`.', LDB ) );
	}
	if ( LDX < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Eleventh argument must be greater than or equal to max(1,N). Value: `%d`.', LDX ) );
	}
	if ( order === 'column-major' ) {
		sb1 = 1;
		sb2 = LDB;
		sx1 = 1;
		sx2 = LDX;
	} else {
		sb1 = LDB;
		sb2 = 1;
		sx1 = LDX;
		sx2 = 1;
	}
	// The wrapper is the single sanctioned allocation site (base/ndarray never
	// allocate): allocate a complex WORK (2*N) and a real RWORK (N) when the
	// caller passes `null`.
	if ( WORK === null || WORK === void 0 ) {
		WORK = new Complex128Array( max( 1, 2 * N ) );
	}
	if ( RWORK === null || RWORK === void 0 ) {
		RWORK = new Float64Array( max( 1, N ) );
	}
	return base( uplo, N, nrhs, AP, 1, 0, AFP, 1, 0, IPIV, 1, 0, B, sb1, sb2, 0, X, sx1, sx2, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default zhprfs;
