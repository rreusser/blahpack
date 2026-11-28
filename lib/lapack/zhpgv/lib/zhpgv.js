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
import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import strided from './strided.js';


// MAIN //

/**
* Computes all eigenvalues and, optionally, eigenvectors of a complex generalized Hermitian-definite eigenproblem in packed storage.
*
* @param {Layout} order - storage layout ('row-major' or 'column-major')
* @param {integer} itype - problem type (1, 2, or 3)
* @param {('no-vectors'|'compute-vectors')} jobz - `'no-vectors'` or `'compute-vectors'`
* @param {MatrixTriangle} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of matrices A and B
* @param {Complex128Array} AP - packed Hermitian matrix A (length N*(N+1)/2)
* @param {Complex128Array} BP - packed Hermitian positive definite matrix B (length N*(N+1)/2)
* @param {Float64Array} w - output array for eigenvalues (length N)
* @param {integer} strideW - stride length for `w`
* @param {Complex128Array} Z - output eigenvector matrix (N x N)
* @param {PositiveInteger} LDZ - leading dimension of Z
* @param {(Complex128Array|null)} WORK - complex workspace array (length >= max(1, 2*N-1))
* @param {(Float64Array|null)} RWORK - real workspace array (length >= max(1, 3*N-2))
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} second argument is invalid (rejected when `itype < 1 || itype > 3`)
* @throws {TypeError} third argument must be one of the following: "no-vectors", "compute-vectors"
* @throws {TypeError} fourth argument must be a valid matrix triangle
* @throws {RangeError} fifth argument must be a nonnegative integer
* @throws {RangeError} eleventh argument is invalid (rejected when `LDZ < 1 || ( jobz === "compute-vectors" && LDZ < N )`)
* @returns {integer} info - 0 if successful
*/
function zhpgv( order, itype, jobz, uplo, N, AP, BP, w, strideW, Z, LDZ, WORK, RWORK ) {
	let sz1, sz2;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( itype < 1 || itype > 3 ) {
		throw new RangeError( format( 'invalid argument. Second argument is invalid (rejected when `itype < 1 || itype > 3`). Value: `%d`.', itype ) );
	}
	if ( jobz !== 'no-vectors' && jobz !== 'compute-vectors' ) {
		throw new TypeError( format( 'invalid argument. Third argument must be one of the following: "no-vectors", "compute-vectors". Value: `%s`.', jobz ) );
	}
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Fourth argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( LDZ < 1 || ( jobz === 'compute-vectors' && LDZ < N ) ) {
		throw new RangeError( format( 'invalid argument. Eleventh argument is invalid (rejected when `LDZ < 1 || ( jobz === "compute-vectors" && LDZ < N )`). Value: `%d`.', LDZ ) );
	}
	const ow = stride2offset( N, strideW );
	if ( order === 'column-major' ) {
		sz1 = 1;
		sz2 = LDZ;
	} else {
		sz1 = LDZ;
		sz2 = 1;
	}
	if ( WORK === null || WORK === void 0 ) {
		const minWork = Math.max( 1, Math.max( 1, 2 * N - 1) );
		WORK = new Complex128Array( minWork );
	}
	if ( RWORK === null || RWORK === void 0 ) {
		const minRwork = Math.max( 1, Math.max( 1, 3 * N - 2) );
		RWORK = new Float64Array( minRwork );
	}
	return strided( itype, jobz, uplo, N, AP, 1, 0, BP, 1, 0, w, strideW, ow, Z, sz1, sz2, 0, WORK, 1, 0, RWORK, 1, 0 );
}


// EXPORTS //

export default zhpgv;
