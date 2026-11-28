/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable max-len, max-params, camelcase */

// MODULES //

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import isTransposeOperation from '@stdlib/blas/base/assert/is-transpose-operation/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import strided from './strided.js';


// MAIN //

/**
* Estimates the infinity norm condition number for a complex general banded matrix with inverse-c scaling.
*
* @param {Layout} order - storage layout (`'row-major'` or `'column-major'`)
* @param {TransposeOperation} trans - `'no-transpose'` or `'conjugate-transpose'`
* @param {NonNegativeInteger} N - order of the matrix
* @param {NonNegativeInteger} kl - number of subdiagonals
* @param {NonNegativeInteger} ku - number of superdiagonals
* @param {Complex128Array} AB - original banded matrix in band storage
* @param {PositiveInteger} LDAB - leading dimension of `AB`
* @param {Complex128Array} AFB - LU factored banded matrix from `zgbtrf`
* @param {PositiveInteger} LDAFB - leading dimension of `AFB`
* @param {Int32Array} IPIV - pivot indices from `zgbtrf`
* @param {integer} strideIPIV - stride length for `IPIV`
* @param {Float64Array} c - real scaling vector of length `N`
* @param {integer} strideC - stride length for `c`
* @param {boolean} capply - if `true`, scale by `inv(diag(C))`
* @param {(Complex128Array|null)} WORK - complex workspace of length at least `2*N`
* @param {(Float64Array|null)} RWORK - real workspace of length at least `N`
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be a valid transpose operation
* @throws {RangeError} third argument must be a nonnegative integer
* @throws {RangeError} fourth argument is invalid (rejected when `kl < 0 || kl > N - 1`)
* @throws {RangeError} fifth argument is invalid (rejected when `ku < 0 || ku > N - 1`)
* @throws {RangeError} seventh argument must be greater than or equal to `kl + ku + 1` (column-major)
* @throws {RangeError} seventh argument must be greater than or equal to `max( 1, N )` (row-major)
* @throws {RangeError} ninth argument must be greater than or equal to `2 * kl + ku + 1` (column-major)
* @throws {RangeError} ninth argument must be greater than or equal to `max( 1, N )` (row-major)
* @returns {number} estimated reciprocal infinity-norm condition number
*/
function zla_gbrcond_c( order, trans, N, kl, ku, AB, LDAB, AFB, LDAFB, IPIV, strideIPIV, c, strideC, capply, WORK, RWORK ) { // eslint-disable-line max-len, max-params
	let safb1, safb2, sab1, sab2;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( !isTransposeOperation( trans ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid transpose operation. Value: `%s`.', trans ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( kl < 0 || kl > N - 1 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument is invalid (rejected when `kl < 0 || kl > N - 1`). Value: `%d`.', kl ) );
	}
	if ( ku < 0 || ku > N - 1 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument is invalid (rejected when `ku < 0 || ku > N - 1`). Value: `%d`.', ku ) );
	}
	if ( order === 'column-major' && ( LDAB < kl + ku + 1 ) ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be greater than or equal to %d. Value: `%d`.', kl + ku + 1, LDAB ) );
	}
	if ( order === 'row-major' && ( LDAB < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDAB ) );
	}
	if ( order === 'column-major' && ( LDAFB < 2 * kl + ku + 1 ) ) {
		throw new RangeError( format( 'invalid argument. Ninth argument must be greater than or equal to %d. Value: `%d`.', 2 * kl + ku + 1, LDAFB ) );
	}
	if ( order === 'row-major' && ( LDAFB < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Ninth argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDAFB ) );
	}
	const offsetIPIV = stride2offset( N, strideIPIV );
	if ( order === 'column-major' ) {
		sab1 = 1;
		sab2 = LDAB;
		safb1 = 1;
		safb2 = LDAFB;
	} else {
		sab1 = LDAB;
		sab2 = 1;
		safb1 = LDAFB;
		safb2 = 1;
	}
	if ( WORK === null || WORK === void 0 ) {
		const minWork = Math.max( 1, 2 * N );
		WORK = new Complex128Array( minWork );
	}
	if ( RWORK === null || RWORK === void 0 ) {
		const minRwork = Math.max( 1, N );
		RWORK = new Float64Array( minRwork );
	}
	return strided( trans, N, kl, ku, AB, sab1, sab2, 0, AFB, safb1, safb2, 0, IPIV, strideIPIV, offsetIPIV, c, strideC, 0, capply, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default zla_gbrcond_c;
