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
import strided from './strided.js';


// MAIN //

/**
* Estimates the reciprocal of the condition number of a real general band matrix A, in either the 1-norm or the infinity-norm, using the LU factorization computed by DGBTRF.
*
* @param {Layout} order - storage layout ('row-major' or 'column-major')
* @param {('one-norm'|'inf-norm')} norm - specifies whether the 1-norm condition number or the infinity-norm condition number is required: `'one-norm'`: 1-norm; `'inf-norm'`: Infinity-norm.
* @param {NonNegativeInteger} N - the order of the matrix A.
* @param {NonNegativeInteger} kl - the number of subdiagonals within the band of A.
* @param {NonNegativeInteger} ku - the number of superdiagonals within the band of A.
* @param {Float64Array} AB - details of the LU factorization of the band matrix A, as computed by DGBTRF.
* @param {PositiveInteger} LDAB - leading dimension of `AB`
* @param {Int32Array} IPIV - the pivot indices; for 1 <= i <= N, row i of the matrix was interchanged with row IPIV(i) (0-based).
* @param {integer} strideIPIV - stride length for `IPIV`
* @param {number} anorm - if `norm === 'one-norm'`, the 1-norm of the original matrix A.
* @param {Float64Array} rcond - the reciprocal of the condition number of the matrix A, computed as RCOND = 1/(norm(A) * norm(inv(A))).
* @param {(Float64Array|null)} WORK - caller-provided workspace of at least `3 * N` elements
* @param {(Int32Array|null)} IWORK - caller-provided workspace of at least `N` elements
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be one of the following: "inf-norm", "one-norm"
* @throws {RangeError} third argument must be a nonnegative integer
* @throws {RangeError} fourth argument must be a nonnegative integer
* @throws {RangeError} fifth argument must be a nonnegative integer
* @throws {RangeError} seventh argument must be greater than or equal to `2 * kl + ku + 1` (column-major)
* @throws {RangeError} seventh argument must be greater than or equal to `max( 1, N )` (row-major)
* @throws {RangeError} tenth argument is invalid (rejected when `anorm < 0`)
* @throws {TypeError} if a string argument is not a valid option
* @returns {integer} info status code
*/
function dgbcon( order, norm, N, kl, ku, AB, LDAB, IPIV, strideIPIV, anorm, rcond, WORK, IWORK ) { // eslint-disable-line max-len, max-params

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( norm !== 'inf-norm' && norm !== 'one-norm' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be one of the following: "inf-norm", "one-norm". Value: `%s`.', norm ) );
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
		const minWork = Math.max( 1, 3*N );
		WORK = new Float64Array( minWork );
	}
	if ( IWORK === null || IWORK === void 0 ) {
		const minIwork = Math.max( 1, N );
		IWORK = new Int32Array( minIwork );
	}
	return strided( norm, N, kl, ku, AB, sab1, sab2, 0, IPIV, strideIPIV, oipiv, anorm, rcond, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default dgbcon;
