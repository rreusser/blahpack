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
* Computes the reciprocal of the condition number (in the 1-norm) of a complex Hermitian positive definite tridiagonal matrix using the factorization A = L·D·Lᴴ or A = Uᴴ·D·U computed by ZPTTRF.
*
* @param {NonNegativeInteger} N - the order of the matrix A.
* @param {Float64Array} d - the n diagonal elements of the diagonal matrix D from the factorization of A, as computed by ZPTTRF.
* @param {integer} strideD - stride length for `d`
* @param {Complex128Array} e - the (n-1) off-diagonal elements of the unit bidiagonal factor U or L from the factorization of A, as computed by ZPTTRF.
* @param {integer} strideE - stride length for `e`
* @param {number} anorm - the 1-norm of the original matrix A.
* @param {Float64Array} rcond - the reciprocal of the condition number of the matrix A, computed as RCOND = 1/(ANORM * AINVNM), where AINVNM is the 1-norm of inv(A) computed in this routine.
* @param {(Float64Array|null)} RWORK - caller-provided workspace of at least `N` elements
* @throws {RangeError} first argument must be a nonnegative integer
* @throws {RangeError} sixth argument is invalid (rejected when `anorm < 0`)
* @returns {integer} info status code
*/
function zptcon( N, d, strideD, e, strideE, anorm, rcond, RWORK ) { // eslint-disable-line max-len, max-params

	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( anorm < 0 ) {
		throw new RangeError( format( 'invalid argument. Sixth argument is invalid (rejected when `anorm < 0`). Value: `%s`.', anorm ) );
	}
	const od = stride2offset( N, strideD );
	const oe = stride2offset( N - 1, strideE );
	if ( RWORK === null || RWORK === void 0 ) {
		const minRwork = Math.max( 1, N );
		RWORK = new Float64Array( minRwork );
	}
	return base( N, d, strideD, od, e, strideE, oe, anorm, rcond, RWORK, 1, 0 );
}


// EXPORTS //

export default zptcon;
