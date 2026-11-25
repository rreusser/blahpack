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
* Computes the reciprocal of the condition number (in the 1-norm) of a real symmetric positive definite tridiagonal matrix using the factorization A = L·D·Lᵀ or A = Uᵀ·D·U computed by DPTTRF.
*
* @param {NonNegativeInteger} N - the order of the matrix A.
* @param {Float64Array} d - the n diagonal elements of the diagonal matrix D from the factorization of A, as computed by DPTTRF.
* @param {integer} strideD - stride length for `d`
* @param {Float64Array} e - the (n-1) off-diagonal elements of the unit bidiagonal factor U or L from the factorization of A, as computed by DPTTRF.
* @param {integer} strideE - stride length for `e`
* @param {number} anorm - the 1-norm of the original matrix A.
* @param {Float64Array} rcond - the reciprocal of the condition number of the matrix A, computed as RCOND = 1/(ANORM * AINVNM), where AINVNM is the 1-norm of inv(A) computed in this routine.
* @param {(Float64Array|null)} WORK - caller-provided workspace of at least `N` elements
* @throws {RangeError} first argument must be a nonnegative integer
* @throws {RangeError} sixth argument is invalid (rejected when `anorm < 0`)
* @returns {integer} info status code
*/
function dptcon( N, d, strideD, e, strideE, anorm, rcond, WORK ) { // eslint-disable-line max-len, max-params

	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( anorm < 0 ) {
		throw new RangeError( format( 'invalid argument. Sixth argument is invalid (rejected when `anorm < 0`). Value: `%s`.', anorm ) );
	}
	const od = stride2offset( N, strideD );
	const oe = stride2offset( N - 1, strideE );
	if ( WORK === null || WORK === void 0 ) {
		const minWork = Math.max( 1, N );
		WORK = new Float64Array( minWork );
	}
	return base( N, d, strideD, od, e, strideE, oe, anorm, rcond, WORK, 1, 0 );
}


// EXPORTS //

export default dptcon;
