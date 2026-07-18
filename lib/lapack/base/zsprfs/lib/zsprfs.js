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
import Float64Array from '@stdlib/array/float64/lib/index.js';
import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Improves the computed solution to a complex symmetric system `A * X = B` with.
* packed storage and provides error bounds and backward error estimates.
*
* Uses the factorization `A = U*D*U**T` or `A = L*D*L**T` computed by zsptrf.
*
* NOTE: SYMMETRIC (not Hermitian). No conjugation.
*
* IPIV must contain 0-based pivot indices (as produced by zsptrf).
*
* @param {string} uplo - `'upper'` or `'lower'`, must match the factorization
* @param {NonNegativeInteger} N - order of matrix A
* @param {NonNegativeInteger} nrhs - number of right-hand side columns
* @param {Complex128Array} AP - original symmetric matrix in packed storage (length `N*(N+1)/2`)
* @param {Complex128Array} AFP - factored matrix from `zsptrf` in packed storage (length `N*(N+1)/2`)
* @param {Int32Array} IPIV - pivot indices from `zsptrf` (0-based)
* @param {integer} strideIPIV - stride for `IPIV`
* @param {Complex128Array} B - right-hand side matrix (column-major)
* @param {PositiveInteger} LDB - leading dimension of `B`
* @param {Complex128Array} X - solution matrix (column-major; improved on exit)
* @param {PositiveInteger} LDX - leading dimension of `X`
* @param {Float64Array} FERR - output forward error bounds (length `nrhs`)
* @param {integer} strideFERR - stride for `FERR`
* @param {Float64Array} BERR - output backward error bounds (length `nrhs`)
* @param {integer} strideBERR - stride for `BERR`
* @param {(Complex128Array|null)} WORK - caller-owned complex workspace of at
* least `2*N` elements, or `null` to auto-allocate at the required size
* @param {integer} strideWork - stride for `WORK` (in complex elements)
* @param {(Float64Array|null)} RWORK - caller-owned real workspace of at least
* `N` elements, or `null` to auto-allocate at the required size
* @param {integer} strideRWork - stride for `RWORK`
* @throws {TypeError} first argument must be a valid matrix triangle
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} status code (0 = success)
*/
function zsprfs( uplo, N, nrhs, AP, AFP, IPIV, strideIPIV, B, LDB, X, LDX, FERR, strideFERR, BERR, strideBERR, WORK, strideWork, RWORK, strideRWork ) {
	let orwork, owork;

	const sb1 = 1;
	const sb2 = LDB;
	const sx1 = 1;
	const sx2 = LDX;
	const oipiv = stride2offset( N, strideIPIV );
	const oferr = stride2offset( nrhs, strideFERR );
	const oberr = stride2offset( nrhs, strideBERR );

	// The wrapper is the single sanctioned allocation site (base/ndarray never
	// allocate): allocate a complex WORK (2*N) and a real RWORK (N) when the
	// caller passes `null`.
	if ( WORK === null || WORK === void 0 ) {
		WORK = new Complex128Array( max( 1, 2 * N ) );
		strideWork = 1;
		owork = 0;
	} else {
		owork = stride2offset( 2 * N, strideWork );
	}
	if ( RWORK === null || RWORK === void 0 ) {
		RWORK = new Float64Array( max( 1, N ) );
		strideRWork = 1;
		orwork = 0;
	} else {
		orwork = stride2offset( N, strideRWork );
	}
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( nrhs < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', nrhs ) );
	}
	if ( LDB < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Ninth argument must be greater than or equal to max(1,N). Value: `%d`.', LDB ) );
	}
	if ( LDX < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Eleventh argument must be greater than or equal to max(1,N). Value: `%d`.', LDX ) );
	}
	return base( uplo, N, nrhs, AP, 1, 0, AFP, 1, 0, IPIV, strideIPIV, oipiv, B, sb1, sb2, 0, X, sx1, sx2, 0, FERR, strideFERR, oferr, BERR, strideBERR, oberr, WORK, strideWork, owork, RWORK, strideRWork, orwork );
}


// EXPORTS //

export default zsprfs;
