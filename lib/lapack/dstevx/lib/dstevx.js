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
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import min from '@stdlib/math/base/special/fast/min/lib/index.js';
import ndarray from './ndarray.js';


// MAIN //

/**
* Computes the eigenvalues and, optionally, the left and/or right eigenvectors.
*
* @param {Layout} order - storage layout ('row-major' or 'column-major')
* @param {('no-vectors'|'compute-vectors')} jobz - `'no-vectors'`: Compute eigenvalues only; `'compute-vectors'`: Compute eigenvalues and eigenvectors.
* @param {('all'|'value'|'index')} range - `'all'`: all eigenvalues will be found. `'value'`: all eigenvalues in the half-open interval (VL,VU] will be found. `'index'`: the IL-th through IU-th eigenvalues will be found.
* @param {NonNegativeInteger} N - the order of the matrix.
* @param {Float64Array} d - on entry, the n diagonal elements of the tridiagonal matrix A. On exit, D may be multiplied by a constant factor chosen to avoid over/underflow in computing the eigenvalues.
* @param {integer} strideD - stride length for `d`
* @param {Float64Array} e - on entry, the (n-1) subdiagonal elements of the tridiagonal matrix A in elements 1 to N-1 of E. On exit, E may be multiplied by a constant factor chosen to avoid over/underflow in computing the eigenvalues.
* @param {integer} strideE - stride length for `e`
* @param {number} vl - if `range === 'value'`, the lower bound of the interval to be searched for eigenvalues.
* @param {number} vu - if `range === 'value'`, the upper bound of the interval to be searched for eigenvalues.
* @param {integer} il - if `range === 'index'`, the index of the smallest eigenvalue to be returned. 1 <= IL <= IU <= N, if N > 0.
* @param {integer} iu - if `range === 'index'`, the index of the largest eigenvalue to be returned. 1 <= IL <= IU <= N, if N > 0.
* @param {number} abstol - the absolute error tolerance for the eigenvalues.
* @param {Int32Array} M - the total number of eigenvalues found. 0 <= M <= N.
* @param {Float64Array} w - the first M elements contain the selected eigenvalues in ascending order.
* @param {integer} strideW - stride length for `w`
* @param {Float64Array} Z - if `jobz === 'compute-vectors'`, then if INFO = 0, the first M columns of Z contain the orthonormal eigenvectors of the matrix A corresponding to the selected eigenvalues, with the i-th column of Z holding the eigenvector associated with W(i).
* @param {PositiveInteger} LDZ - leading dimension of `Z`
* @param {(Float64Array|null)} WORK - caller-provided workspace of at least `5 * N` elements
* @param {(Int32Array|null)} IWORK - caller-provided workspace of at least `5 * N` elements
* @param {Int32Array} IFAIL - if `jobz === 'compute-vectors'`, then if INFO = 0, the first M elements of IFAIL are zero (0-based).
* @param {integer} strideIFAIL - stride length for `IFAIL`
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be one of the following: "no-vectors", "compute-vectors"
* @throws {TypeError} third argument must be one of the following: "all", "index", "value"
* @throws {RangeError} fourth argument must be a nonnegative integer
* @throws {RangeError} tenth argument is invalid (rejected when `range === "value" && ( N > 0 && vu <= vl )`)
* @throws {RangeError} eleventh argument is invalid (rejected when `range !== "value" && range === "index" && ( il < 1 || il > max( 1, N ) )`)
* @throws {RangeError} twelfth argument is invalid (rejected when `range !== "value" && range === "index" && ( iu < min( N, il ) || iu > N )`)
* @throws {RangeError} eighteenth argument is invalid (column-major: rejected when `LDZ < 1 || ( jobz === "compute-vectors" && LDZ < N )`)
* @throws {RangeError} eighteenth argument is invalid (row-major: rejected when `LDZ < 1 || ( jobz === "compute-vectors" && LDZ < max( 1, range === "index" ? iu - il + 1 : N ) )`)
* @throws {TypeError} if a string argument is not a valid option
* @returns {integer} info status code
*/
function dstevx( order, jobz, range, N, d, strideD, e, strideE, vl, vu, il, iu, abstol, M, w, strideW, Z, LDZ, WORK, IWORK, IFAIL, strideIFAIL ) { // eslint-disable-line max-len, max-params

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( jobz !== 'no-vectors' && jobz !== 'compute-vectors' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be one of the following: "no-vectors", "compute-vectors". Value: `%s`.', jobz ) );
	}
	if ( range !== 'all' && range !== 'index' && range !== 'value' ) {
		throw new TypeError( format( 'invalid argument. Third argument must be one of the following: "all", "index", "value". Value: `%s`.', range ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( range === 'value' && ( N > 0 && vu <= vl ) ) {
		throw new RangeError( format( 'invalid argument. Tenth argument is invalid (rejected when `range === "value" && ( N > 0 && vu <= vl )`). Value: `%s`.', vu ) );
	}
	if ( range !== 'value' && range === 'index' && ( il < 1 || il > max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Eleventh argument is invalid (rejected when `range !== "value" && range === "index" && ( il < 1 || il > max( 1, N ) )`). Value: `%d`.', il ) );
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
	const sz1 = ( order === 'column-major' ) ? 1 : LDZ;
	const sz2 = ( order === 'column-major' ) ? LDZ : 1;
	const od = stride2offset( N, strideD );
	const oe = stride2offset( max( 1, N - 1 ), strideE );
	const ow = stride2offset( N, strideW );
	if ( WORK === null || WORK === void 0 ) {
		const minWork = Math.max( 1, 5 * N );
		WORK = new Float64Array( minWork );
	}
	if ( IWORK === null || IWORK === void 0 ) {
		const minIwork = Math.max( 1, 5 * N );
		IWORK = new Int32Array( minIwork );
	}
	const oifail = stride2offset( N, strideIFAIL );
	return ndarray( jobz, range, N, d, strideD, od, e, strideE, oe, vl, vu, il, iu, abstol, M, w, strideW, ow, Z, sz1, sz2, 0, WORK, 1, 0, IWORK, 1, 0, IFAIL, strideIFAIL, oifail ); // eslint-disable-line max-len
}


// EXPORTS //

export default dstevx;
