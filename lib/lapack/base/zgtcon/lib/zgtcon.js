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
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Estimates the reciprocal of the condition number of a complex tridiagonal matrix A using the LU factorization as computed by ZGTTRF.
*
* @param {string} norm - specifies whether the 1-norm condition number or the infinity-norm condition number is required: `'one-norm'`: 1-norm; `'inf-norm'`: Infinity-norm.
* @param {NonNegativeInteger} N - the order of the matrix A.
* @param {Complex128Array} DL - the (n-1) multipliers that define the matrix L from the LU factorization of A as computed by ZGTTRF.
* @param {integer} strideDL - stride length for `DL`
* @param {Complex128Array} d - the n diagonal elements of the upper triangular matrix U from the LU factorization of A.
* @param {integer} strideD - stride length for `d`
* @param {Complex128Array} DU - the (n-1) elements of the first superdiagonal of U.
* @param {integer} strideDU - stride length for `DU`
* @param {Complex128Array} DU2 - the (n-2) elements of the second superdiagonal of U.
* @param {integer} strideDU2 - stride length for `DU2`
* @param {Int32Array} IPIV - the pivot indices; for 1 <= i <= n, row i of the matrix was interchanged with row IPIV(i) (0-based).
* @param {integer} strideIPIV - stride length for `IPIV`
* @param {number} anorm - if `norm === 'one-norm'`, the 1-norm of the original matrix A.
* @param {Float64Array} rcond - the reciprocal of the condition number of the matrix A, computed as RCOND = 1/(ANORM * AINVNM), where AINVNM is an estimate of the 1-norm of inv(A) computed in this routine.
* @param {(Complex128Array|null)} WORK - caller-provided workspace of at least `2 * N` elements
* @throws {TypeError} first argument must be one of the following: "inf-norm", "one-norm", "one-norm"
* @throws {RangeError} second argument must be a nonnegative integer
* @throws {RangeError} thirteenth argument is invalid (rejected when `anorm < 0`)
* @throws {TypeError} if a string argument is not a valid option
* @returns {integer} info status code
*/
function zgtcon( norm, N, DL, strideDL, d, strideD, DU, strideDU, DU2, strideDU2, IPIV, strideIPIV, anorm, rcond, WORK ) { // eslint-disable-line max-len, max-params

	if ( norm !== 'inf-norm' && norm !== 'one-norm' && norm !== 'one-norm' ) {
		throw new TypeError( format( 'invalid argument. First argument must be one of the following: "inf-norm", "one-norm", "one-norm". Value: `%s`.', norm ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( anorm < 0 ) {
		throw new RangeError( format( 'invalid argument. Thirteenth argument is invalid (rejected when `anorm < 0`). Value: `%s`.', anorm ) );
	}
	const odl = stride2offset( N - 1, strideDL );
	const od = stride2offset( N, strideD );
	const odu = stride2offset( N - 1, strideDU );
	const odu2 = stride2offset( N - 2, strideDU2 );
	const oipiv = stride2offset( N, strideIPIV );
	if ( WORK === null || WORK === void 0 ) {
		const minWork = Math.max( 1, 2 * N );
		WORK = new Complex128Array( minWork );
	}
	return base( norm, N, DL, strideDL, odl, d, strideD, od, DU, strideDU, odu, DU2, strideDU2, odu2, IPIV, strideIPIV, oipiv, anorm, rcond, WORK, 1, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default zgtcon;
