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

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes the eigenvalues of a symmetric tridiagonal matrix T.
*
* @param {('all'|'value'|'index')} range - `'all'`: ("All") all eigenvalues will be found. `'value'`: ("Value") all eigenvalues in the half-open interval (VL, VU] will be found. `'index'`: ("Index") the IL-th through IU-th eigenvalues (of the entire matrix) will be found.
* @param {('block'|'entire')} order - storage layout (`'row-major'` or `'column-major'`)
* @param {NonNegativeInteger} N - the order of the tridiagonal matrix T.
* @param {number} vl - if `range === 'value'`, the lower bound of the interval to be searched for eigenvalues.
* @param {number} vu - if `range === 'value'`, the upper bound of the interval to be searched for eigenvalues.
* @param {integer} il - if `range === 'index'`, the index of the smallest eigenvalue to be returned. 1 <= IL <= IU <= N, if N > 0.
* @param {integer} iu - if `range === 'index'`, the index of the largest eigenvalue to be returned. 1 <= IL <= IU <= N, if N > 0.
* @param {number} abstol - the absolute tolerance for the eigenvalues.
* @param {Float64Array} d - the n diagonal elements of the tridiagonal matrix T.
* @param {integer} strideD - stride length for `d`
* @param {Float64Array} e - the (n-1) off-diagonal elements of the tridiagonal matrix T.
* @param {integer} strideE - stride length for `e`
* @param {Int32Array} M - the actual number of eigenvalues found. 0 <= M <= N.
* @param {Int32Array} nsplit - the number of diagonal blocks in the matrix T. 1 <= NSPLIT <= N.
* @param {Float64Array} w - on exit, the first M elements of W will contain the eigenvalues.
* @param {integer} strideW - stride length for `w`
* @param {Int32Array} IBLOCK - at each row/column j where E(j) is zero or small, the matrix T is considered to split into a block diagonal matrix (0-based).
* @param {integer} strideIBLOCK - stride length for `IBLOCK`
* @param {Int32Array} ISPLIT - the splitting points, at which T breaks up into submatrices (0-based).
* @param {integer} strideISPLIT - stride length for `ISPLIT`
* @param {(Float64Array|null)} WORK - caller-provided workspace of at least `4 * N` elements
* @param {(Int32Array|null)} IWORK - caller-provided workspace of at least `3 * N` elements
* @throws {TypeError} second argument must be one of the following: "block", "entire"
* @throws {RangeError} third argument must be a nonnegative integer
* @throws {TypeError} if a string argument is not a valid option
* @returns {integer} info status code
*/
function dstebz( range, order, N, vl, vu, il, iu, abstol, d, strideD, e, strideE, M, nsplit, w, strideW, IBLOCK, strideIBLOCK, ISPLIT, strideISPLIT, WORK, IWORK ) { // eslint-disable-line max-len, max-params

	if ( order !== 'block' && order !== 'entire' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be one of the following: "block", "entire". Value: `%s`.', order ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	const od = stride2offset( N, strideD );
	const oe = stride2offset( N - 1, strideE );
	const ow = stride2offset( N, strideW );
	const oiblock = stride2offset( N, strideIBLOCK );
	const oisplit = stride2offset( N, strideISPLIT );
	if ( WORK === null || WORK === void 0 ) {
		const minWork = Math.max( 1, 4 * N );
		WORK = new Float64Array( minWork );
	}
	if ( IWORK === null || IWORK === void 0 ) {
		const minIwork = Math.max( 1, 3 * N );
		IWORK = new Int32Array( minIwork );
	}
	if ( range !== 'all' && range !== 'value' && range !== 'index' ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid `range` value. Value: `%s`.', range ) );
	}
	return base( range, order, N, vl, vu, il, iu, abstol, d, strideD, od, e, strideE, oe, M, nsplit, w, strideW, ow, IBLOCK, strideIBLOCK, oiblock, ISPLIT, strideISPLIT, oisplit, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default dstebz;
