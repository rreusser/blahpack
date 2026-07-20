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
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Estimates the reciprocal of the condition number of a complex general band matrix A.
*
* @param {string} norm - `'one-norm'` or `'inf-norm'`
* @param {NonNegativeInteger} N - order of the matrix A
* @param {NonNegativeInteger} kl - number of sub-diagonals of A
* @param {NonNegativeInteger} ku - number of super-diagonals of A
* @param {Complex128Array} AB - banded LU factor (from `zgbtrf`)
* @param {PositiveInteger} LDAB - leading dimension of `AB` (>= `2*kl+ku+1`)
* @param {Int32Array} IPIV - pivot indices from `zgbtrf`
* @param {integer} strideIPIV - `IPIV` stride length
* @param {number} anorm - the 1-norm (or infinity-norm) of the original matrix
* @param {Float64Array} rcond - output array (single element) receiving the reciprocal condition number
* @param {(Complex128Array|null)} WORK - workspace (>= `2*N` complex elements); auto-allocated when `null`
* @param {integer} strideWork - `WORK` stride length
* @param {(Float64Array|null)} RWORK - workspace (>= `N` reals); auto-allocated when `null`
* @param {integer} strideRWork - `RWORK` stride length
* @throws {TypeError} first argument must be a valid norm
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info status code
*/
function zgbcon( norm, N, kl, ku, AB, LDAB, IPIV, strideIPIV, anorm, rcond, WORK, strideWork, RWORK, strideRWork ) {
	const sab1 = 1;
	const sab2 = LDAB;

	if ( norm !== 'one-norm' && norm !== 'inf-norm' ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid norm. Value: `%s`.', norm ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( kl < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', kl ) );
	}
	if ( ku < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', ku ) );
	}
	if ( LDAB < ( ( 2*kl ) + ku + 1 ) ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be greater than or equal to 2*kl+ku+1. Value: `%d`.', LDAB ) );
	}
	const oipiv = stride2offset( N, strideIPIV );
	if ( WORK === null || WORK === void 0 ) {
		WORK = new Complex128Array( max( 1, 2*N ) );
		strideWork = 1;
	}
	if ( RWORK === null || RWORK === void 0 ) {
		RWORK = new Float64Array( max( 1, N ) );
		strideRWork = 1;
	}
	const owork = stride2offset( 2*N, strideWork );
	const orwork = stride2offset( N, strideRWork );
	return base( norm, N, kl, ku, AB, sab1, sab2, 0, IPIV, strideIPIV, oipiv, anorm, rcond, WORK, strideWork, owork, RWORK, strideRWork, orwork );
}


// EXPORTS //

export default zgbcon;
