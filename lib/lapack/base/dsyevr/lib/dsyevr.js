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
import min from '@stdlib/math/base/special/fast/min/lib/index.js';
import base, { computeOptimalWorkSize } from './base.js';


// MAIN //

/**
* Computes the eigenvalues and, optionally, the left and/or right eigenvectors for symmetric matrices.
*
* @param {Layout} order - storage layout ('row-major' or 'column-major')
* @param {('no-vectors'|'compute-vectors')} jobz - `'no-vectors'`: Compute eigenvalues only; `'compute-vectors'`: Compute eigenvalues and eigenvectors.
* @param {('all'|'value'|'index')} range - `'all'`: all eigenvalues will be found. `'value'`: all eigenvalues in the half-open interval (VL,VU] will be found. `'index'`: the IL-th through IU-th eigenvalues will be found. For `range === 'value'` or `range === 'index'` and IU - IL < N - 1, DSTEBZ and DSTEIN are called.
* @param {MatrixTriangle} uplo - `'upper'`: Upper triangle of A is stored; `'lower'`: Lower triangle of A is stored.
* @param {NonNegativeInteger} N - the order of the matrix A.
* @param {Float64Array} A - on entry, the symmetric matrix A. On exit, the lower triangle (if `uplo === 'lower'`) or the upper triangle (if `uplo === 'upper'`) of A, including the diagonal, is destroyed.
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {number} vl - if `range === 'value'`, the lower bound of the interval to be searched for eigenvalues.
* @param {number} vu - if `range === 'value'`, the upper bound of the interval to be searched for eigenvalues.
* @param {integer} il - if `range === 'index'`, the index of the smallest eigenvalue to be returned. 1 <= IL <= IU <= N, if N > 0.
* @param {integer} iu - if `range === 'index'`, the index of the largest eigenvalue to be returned. 1 <= IL <= IU <= N, if N > 0.
* @param {number} abstol - the absolute error tolerance for the eigenvalues.
* @param {Int32Array} m - output (length-1 array): the total number of eigenvalues found
* @param {Float64Array} w - the first M elements contain the selected eigenvalues in ascending order.
* @param {integer} strideW - stride length for `w`
* @param {Float64Array} Z - if `jobz === 'compute-vectors'`, then if INFO = 0, the first M columns of Z contain the orthonormal eigenvectors of the matrix A corresponding to the selected eigenvalues, with the i-th column of Z holding the eigenvector associated with W(i).
* @param {PositiveInteger} LDZ - leading dimension of `Z`
* @param {Int32Array} ISUPPZ - the support of the eigenvectors in Z, i.e., the indices indicating the nonzero elements in Z (0-based).
* @param {integer} strideISUPPZ - stride length for `ISUPPZ`
* @param {(Float64Array|null)} WORK - caller-provided workspace of at least `max( 1, 26 * N )` elements; if `null`, a workspace of the reference's optimal size (LWKOPT, with the DSYTRD block size from `ilaenv`) is allocated
* @param {(Int32Array|null)} IWORK - caller-provided workspace of at least `max( 1, 10 * N )` elements
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be one of the following: "no-vectors", "compute-vectors"
* @throws {TypeError} third argument must be one of the following: "all", "index", "value"
* @throws {TypeError} fourth argument must be a valid matrix triangle
* @throws {RangeError} fifth argument must be a nonnegative integer
* @throws {RangeError} seventh argument must be greater than or equal to `max( 1, N )`
* @throws {RangeError} ninth argument is invalid (rejected when `range === "value" && ( N > 0 && vu <= vl )`)
* @throws {RangeError} tenth argument is invalid (rejected when `range !== "value" && range === "index" && ( il < 1 || il > max( 1, N ) )`)
* @throws {RangeError} eleventh argument is invalid (rejected when `range !== "value" && range === "index" && ( iu < min( N, il ) || iu > N )`)
* @throws {RangeError} seventeenth argument is invalid (column-major: rejected when `LDZ < 1 || ( jobz === "compute-vectors" && LDZ < N )`)
* @throws {RangeError} seventeenth argument is invalid (row-major: rejected when `LDZ < 1 || ( jobz === "compute-vectors" && LDZ < max( 1, range === "index" ? iu - il + 1 : N ) )`)
* @throws {TypeError} if a string argument is not a valid option
* @returns {integer} status code (0 = success)
*/
function dsyevr( order, jobz, range, uplo, N, A, LDA, vl, vu, il, iu, abstol, m, w, strideW, Z, LDZ, ISUPPZ, strideISUPPZ, WORK, IWORK ) { // eslint-disable-line max-len, max-params

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( jobz !== 'no-vectors' && jobz !== 'compute-vectors' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be one of the following: "no-vectors", "compute-vectors". Value: `%s`.', jobz ) );
	}
	if ( range !== 'all' && range !== 'index' && range !== 'value' ) {
		throw new TypeError( format( 'invalid argument. Third argument must be one of the following: "all", "index", "value". Value: `%s`.', range ) );
	}
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Fourth argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDA ) );
	}
	if ( range === 'value' && ( N > 0 && vu <= vl ) ) {
		throw new RangeError( format( 'invalid argument. Ninth argument is invalid (rejected when `range === "value" && ( N > 0 && vu <= vl )`). Value: `%s`.', vu ) );
	}
	if ( range !== 'value' && range === 'index' && ( il < 1 || il > max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Tenth argument is invalid (rejected when `range !== "value" && range === "index" && ( il < 1 || il > max( 1, N ) )`). Value: `%d`.', il ) );
	}
	if ( range !== 'value' && range === 'index' && ( iu < min( N, il ) || iu > N ) ) {
		throw new RangeError( format( 'invalid argument. Eleventh argument is invalid (rejected when `range !== "value" && range === "index" && ( iu < min( N, il ) || iu > N )`). Value: `%d`.', iu ) );
	}
	if ( order === 'column-major' && ( LDZ < 1 || ( jobz === 'compute-vectors' && LDZ < N ) ) ) {
		throw new RangeError( format( 'invalid argument. Seventeenth argument is invalid (column-major: rejected when `LDZ < 1 || ( jobz === "compute-vectors" && LDZ < N )`). Value: `%d`.', LDZ ) );
	}
	if ( order === 'row-major' && ( LDZ < 1 || ( jobz === 'compute-vectors' && LDZ < max( 1, range === 'index' ? iu - il + 1 : N ) ) ) ) {
		throw new RangeError( format( 'invalid argument. Seventeenth argument is invalid (row-major: rejected when `LDZ < 1 || ( jobz === "compute-vectors" && LDZ < max( 1, range === "index" ? iu - il + 1 : N ) )`). Value: `%d`.', LDZ ) );
	}
	const sa1 = ( order === 'column-major' ) ? 1 : LDA;
	const sa2 = ( order === 'column-major' ) ? LDA : 1;
	const sz1 = ( order === 'column-major' ) ? 1 : LDZ;
	const sz2 = ( order === 'column-major' ) ? LDZ : 1;
	const ow = stride2offset( N, strideW );
	const oisuppz = stride2offset( N, strideISUPPZ );
	if ( WORK === null || WORK === void 0 ) {
		WORK = new Float64Array( computeOptimalWorkSize( uplo, N ) );
	}
	if ( IWORK === null || IWORK === void 0 ) {
		const minIwork = Math.max( 1, 10 * N);
		IWORK = new Int32Array( minIwork );
	}
	return base( jobz, range, uplo, N, A, sa1, sa2, 0, vl, vu, il, iu, abstol, m, w, strideW, ow, Z, sz1, sz2, 0, ISUPPZ, strideISUPPZ, oisuppz, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default dsyevr;
