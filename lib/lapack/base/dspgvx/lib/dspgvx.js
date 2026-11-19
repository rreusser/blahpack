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
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import min from '@stdlib/math/base/special/fast/min/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes selected eigenvalues and, optionally, eigenvectors of a real generalized symmetric-definite eigenproblem in packed storage.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {integer} itype - problem type (1, 2, or 3)
* @param {string} jobz - `'no-vectors'` or `'compute-vectors'`
* @param {string} range - `'all'`, `'value'`, or `'index'`
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of matrices A and B
* @param {Float64Array} AP - packed symmetric matrix A (length N*(N+1)/2)
* @param {Float64Array} BP - packed symmetric positive definite matrix B (length N*(N+1)/2)
* @param {number} vl - lower bound of eigenvalue interval (range='value')
* @param {number} vu - upper bound of eigenvalue interval (range='value')
* @param {integer} il - index of smallest eigenvalue to compute (1-based, range='index')
* @param {integer} iu - index of largest eigenvalue to compute (1-based, range='index')
* @param {number} abstol - absolute tolerance for eigenvalues
* @param {Int32Array} m - output (length-1 array): the total number of eigenvalues found
* @param {Float64Array} w - output array for eigenvalues (length N)
* @param {integer} strideW - stride length for `w`
* @param {Float64Array} Z - output eigenvector matrix (N x M)
* @param {PositiveInteger} LDZ - leading dimension of Z
* @param {(Float64Array|null)} WORK - workspace array (length >= 8*N)
* @param {(Int32Array|null)} IWORK - integer workspace (length >= 5*N)
* @param {Int32Array} IFAIL - output: indices of non-converged eigenvectors (length N)
* @param {integer} strideIFAIL - stride length for `IFAIL`
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} second argument is invalid (rejected when `itype < 1 || itype > 3`)
* @throws {TypeError} third argument must be one of the following: "no-vectors", "compute-vectors"
* @throws {TypeError} fourth argument must be one of the following: "all", "index", "value"
* @throws {TypeError} fifth argument must be a valid matrix triangle
* @throws {RangeError} sixth argument must be a nonnegative integer
* @throws {RangeError} tenth argument is invalid (rejected when `range === "value" && ( N > 0 && vu <= vl )`)
* @throws {RangeError} eleventh argument is invalid (rejected when `range !== "value" && range === "index" && il < 1`)
* @throws {RangeError} twelfth argument is invalid (rejected when `range !== "value" && range === "index" && ( iu < min( N, il ) || iu > N )`)
* @throws {RangeError} eighteenth argument is invalid (column-major: rejected when `LDZ < 1 || ( jobz === "compute-vectors" && LDZ < N )`)
* @throws {RangeError} eighteenth argument is invalid (row-major: rejected when `LDZ < 1 || ( jobz === "compute-vectors" && LDZ < max( 1, range === "index" ? iu - il + 1 : N ) )`)
* @returns {integer} status code (0 = success)
*/
function dspgvx( order, itype, jobz, range, uplo, N, AP, BP, vl, vu, il, iu, abstol, m, w, strideW, Z, LDZ, WORK, IWORK, IFAIL, strideIFAIL ) {
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
	if ( range !== 'all' && range !== 'index' && range !== 'value' ) {
		throw new TypeError( format( 'invalid argument. Fourth argument must be one of the following: "all", "index", "value". Value: `%s`.', range ) );
	}
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Fifth argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( range === 'value' && ( N > 0 && vu <= vl ) ) {
		throw new RangeError( format( 'invalid argument. Tenth argument is invalid (rejected when `range === "value" && ( N > 0 && vu <= vl )`). Value: `%s`.', vu ) );
	}
	if ( range !== 'value' && range === 'index' && il < 1 ) {
		throw new RangeError( format( 'invalid argument. Eleventh argument is invalid (rejected when `range !== "value" && range === "index" && il < 1`). Value: `%d`.', il ) );
	}
	if ( range !== 'value' && range === 'index' && ( iu < min( N, il ) || iu > N ) ) {
		throw new RangeError( format( 'invalid argument. Twelfth argument is invalid (rejected when `range !== "value" && range === "index" && ( iu < min( N, il ) || iu > N )`). Value: `%d`.', iu ) );
	}
	if ( order === 'column-major' && ( LDZ < 1 || ( jobz === 'compute-vectors' && LDZ < N ) ) ) {
		throw new RangeError( format( 'invalid argument. Eighteenth argument is invalid (column-major: rejected when `LDZ < 1 || ( jobz === "compute-vectors" && LDZ < N )`). Value: `%d`.', LDZ ) );
	}
	if ( order === 'row-major' && ( LDZ < 1 || ( jobz === 'compute-vectors' && LDZ < max( 1, range === 'index' ? iu - il + 1 : N ) ) ) ) {
		throw new RangeError( format( 'invalid argument. Eighteenth argument is invalid (row-major: rejected when `LDZ < 1 || ( jobz === "compute-vectors" && LDZ < max( 1, range === "index" ? iu - il + 1 : N ) )`). Value: `%d`.', LDZ ) );
	}
	const ow = stride2offset( N, strideW );
	const oifail = stride2offset( N, strideIFAIL );
	if ( order === 'column-major' ) {
		sz1 = 1;
		sz2 = LDZ;
	} else {
		sz1 = LDZ;
		sz2 = 1;
	}
	if ( WORK === null || WORK === void 0 ) {
		const minWork = Math.max( 1, 8 * N );
		WORK = new Float64Array( minWork );
	}
	if ( IWORK === null || IWORK === void 0 ) {
		const minIwork = Math.max( 1, 5 * N );
		IWORK = new Int32Array( minIwork );
	}
	return base( itype, jobz, range, uplo, N, AP, 1, 0, BP, 1, 0, vl, vu, il, iu, abstol, m, w, strideW, ow, Z, sz1, sz2, 0, WORK, 1, 0, IWORK, 1, 0, IFAIL, strideIFAIL, oifail ); // eslint-disable-line max-len
}


// EXPORTS //

export default dspgvx;
