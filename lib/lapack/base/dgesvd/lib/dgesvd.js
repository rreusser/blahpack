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
import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import min from '@stdlib/math/base/special/fast/min/lib/index.js';
import base, { computeWorkSize } from './base.js';


// MAIN //

/**
* Computes the singular value decomposition (SVD) of a real M-by-N matrix.
*
* @param {Layout} order - storage layout (`'row-major'` or `'column-major'`)
* @param {('all-columns'|'economy'|'overwrite'|'none')} jobu - `'all-columns'`: all M columns of U returned, `'economy'`: first min(M,N) columns, `'overwrite'`: overwrite A, `'none'`: no U
* @param {('all-rows'|'economy'|'overwrite'|'none')} jobvt - `'all-rows'`: all N rows of V^T returned, `'economy'`: first min(M,N) rows, `'overwrite'`: overwrite A, `'none'`: no VT
* @param {NonNegativeInteger} M - number of rows of A
* @param {NonNegativeInteger} N - number of columns of A
* @param {Float64Array} A - input/output matrix
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Float64Array} s - output array of singular values (length min(M,N))
* @param {integer} strideS - stride length for `s`
* @param {Float64Array} U - output matrix for left singular vectors
* @param {PositiveInteger} LDU - leading dimension of `U`
* @param {Float64Array} VT - output matrix for right singular vectors (V^T)
* @param {PositiveInteger} LDVT - leading dimension of `VT`
* @param {(Float64Array|null)} work - workspace of at least the reference's MINWRK (at most `max( 1, 3*min(M,N) + max(M,N), 5*min(M,N) )`), or `null` to allocate the reference's MAXWRK, which enables the fast QR/LQ paths and the callees' blocked code
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be one of the following: "all-columns", "none", "overwrite", "economy"
* @throws {TypeError} third argument is invalid (rejected when `!( ( ( jobvt === "all-rows" || jobvt === "economy" ) || jobvt === "overwrite" ) || jobvt === "none" ) || ( jobvt === "overwrite" && jobu === "overwrite" )`)
* @throws {RangeError} fourth argument must be a nonnegative integer
* @throws {RangeError} fifth argument must be a nonnegative integer
* @throws {RangeError} seventh argument must be greater than or equal to `max( 1, M )` (column-major)
* @throws {RangeError} seventh argument must be greater than or equal to `max( 1, N )` (row-major)
* @throws {RangeError} eleventh argument is invalid (column-major: rejected when `LDU < 1 || ( ( jobu === "all-columns" || jobu === "economy" ) && LDU < M )`)
* @throws {RangeError} eleventh argument is invalid (row-major: rejected when `LDU < 1 || ( ( jobu === "all-columns" || jobu === "economy" ) && LDU < max( 1, jobu === "all-columns" ? M : min( M, N ) ) )`)
* @throws {RangeError} thirteenth argument is invalid (rejected when `( LDVT < 1 || ( jobvt === "all-rows" && LDVT < N ) ) || ( jobvt === "economy" && LDVT < min( M, N ) )`)
* @returns {integer} info status code (0 if successful, >0 if DBDSQR did not converge)
*/
function dgesvd( order, jobu, jobvt, M, N, A, LDA, s, strideS, U, LDU, VT, LDVT, work ) {
	let sa1, sa2, su1, su2, sv1, sv2;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( jobu !== 'all-columns' && jobu !== 'none' && jobu !== 'overwrite' && jobu !== 'economy' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be one of the following: "all-columns", "none", "overwrite", "economy". Value: `%s`.', jobu ) );
	}
	if ( !( ( ( jobvt === 'all-rows' || jobvt === 'economy' ) || jobvt === 'overwrite' ) || jobvt === 'none' ) || ( jobvt === 'overwrite' && jobu === 'overwrite' ) ) {
		throw new TypeError( format( 'invalid argument. Third argument is invalid (rejected when `!( ( ( jobvt === "all-rows" || jobvt === "economy" ) || jobvt === "overwrite" ) || jobvt === "none" ) || ( jobvt === "overwrite" && jobu === "overwrite" )`). Value: `%s`.', jobvt ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( order === 'column-major' && ( LDA < max( 1, M ) ) ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be greater than or equal to max(1,%d). Value: `%d`.', M, LDA ) );
	}
	if ( order === 'row-major' && ( LDA < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDA ) );
	}
	if ( order === 'column-major' && ( LDU < 1 || ( ( jobu === 'all-columns' || jobu === 'economy' ) && LDU < M ) ) ) {
		throw new RangeError( format( 'invalid argument. Eleventh argument is invalid (column-major: rejected when `LDU < 1 || ( ( jobu === "all-columns" || jobu === "economy" ) && LDU < M )`). Value: `%d`.', LDU ) );
	}
	if ( order === 'row-major' && ( LDU < 1 || ( ( jobu === 'all-columns' || jobu === 'economy' ) && LDU < max( 1, jobu === 'all-columns' ? M : min( M, N ) ) ) ) ) {
		throw new RangeError( format( 'invalid argument. Eleventh argument is invalid (row-major: rejected when `LDU < 1 || ( ( jobu === "all-columns" || jobu === "economy" ) && LDU < max( 1, jobu === "all-columns" ? M : min( M, N ) ) )`). Value: `%d`.', LDU ) );
	}
	if ( ( LDVT < 1 || ( jobvt === 'all-rows' && LDVT < N ) ) || ( jobvt === 'economy' && LDVT < min( M, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Thirteenth argument is invalid (rejected when `( LDVT < 1 || ( jobvt === "all-rows" && LDVT < N ) ) || ( jobvt === "economy" && LDVT < min( M, N ) )`). Value: `%d`.', LDVT ) );
	}
	if ( order === 'column-major' ) {
		sa1 = 1;
		sa2 = LDA;
		su1 = 1;
		su2 = LDU;
		sv1 = 1;
		sv2 = LDVT;
	} else {
		sa1 = LDA;
		sa2 = 1;
		su1 = LDU;
		su2 = 1;
		sv1 = LDVT;
		sv2 = 1;
	}
	if ( work === null || work === void 0 ) {
		// The reference's MAXWRK: the fast QR/LQ paths and the callees' blocked code
		work = new Float64Array( computeWorkSize( jobu, jobvt, M, N ) );
	}
	const os = stride2offset( min( M, N ), strideS );
	return base( jobu, jobvt, M, N, A, sa1, sa2, 0, s, strideS, os, U, su1, su2, 0, VT, sv1, sv2, 0, work, 1, 0 );
}


// EXPORTS //

export default dgesvd;
