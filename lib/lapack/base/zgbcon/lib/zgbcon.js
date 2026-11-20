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
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Estimates the reciprocal of the condition number of a complex general band matrix A.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
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
* @param {(Float64Array|null)} RWORK - workspace (>= `N` reals); auto-allocated when `null`
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be one of the following: "inf-norm", "one-norm", "one-norm"
* @throws {RangeError} third argument must be a nonnegative integer
* @throws {RangeError} fourth argument must be a nonnegative integer
* @throws {RangeError} fifth argument must be a nonnegative integer
* @throws {RangeError} seventh argument must be greater than or equal to `2 * kl + ku + 1` (column-major)
* @throws {RangeError} seventh argument must be greater than or equal to `max( 1, N )` (row-major)
* @throws {RangeError} tenth argument is invalid (rejected when `anorm < 0`)
* @returns {integer} info status code
*/
function zgbcon( order, norm, N, kl, ku, AB, LDAB, IPIV, strideIPIV, anorm, rcond, WORK, RWORK ) {
	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( norm !== 'inf-norm' && norm !== 'one-norm' && norm !== 'one-norm' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be one of the following: "inf-norm", "one-norm", "one-norm". Value: `%s`.', norm ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( kl < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', kl ) );
	}
	if ( ku < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', ku ) );
	}
	if ( order === 'column-major' && ( LDAB < 2 * kl + ku + 1 ) ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be greater than or equal to %d. Value: `%d`.', 2 * kl + ku + 1, LDAB ) );
	}
	if ( order === 'row-major' && ( LDAB < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDAB ) );
	}
	if ( anorm < 0 ) {
		throw new RangeError( format( 'invalid argument. Tenth argument is invalid (rejected when `anorm < 0`). Value: `%s`.', anorm ) );
	}
	const sab1 = ( order === 'column-major' ) ? 1 : LDAB;
	const sab2 = ( order === 'column-major' ) ? LDAB : 1;

	const oipiv = stride2offset( N, strideIPIV );
	if ( WORK === null || WORK === void 0 ) {
		WORK = new Complex128Array( max( 1, 2*N ) );
	}
	if ( RWORK === null || RWORK === void 0 ) {
		RWORK = new Float64Array( max( 1, N ) );
	}
	return base( norm, N, kl, ku, AB, sab1, sab2, 0, IPIV, strideIPIV, oipiv, anorm, rcond, WORK, 1, 0, RWORK, 1, 0 );
}


// EXPORTS //

export default zgbcon;
