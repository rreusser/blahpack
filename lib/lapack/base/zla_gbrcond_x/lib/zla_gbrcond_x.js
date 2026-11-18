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
import base from './base.js';


// MAIN //

/**
* Estimates the infinity norm condition number for a complex general banded matrix with x scaling.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {string} trans - specifies the operation type
* @param {NonNegativeInteger} N - number of columns
* @param {integer} kl - kl
* @param {integer} ku - ku
* @param {Float64Array} AB - input matrix
* @param {PositiveInteger} LDAB - leading dimension of `AB`
* @param {Float64Array} AFB - input matrix
* @param {PositiveInteger} LDAFB - leading dimension of `AFB`
* @param {Int32Array} IPIV - input array
* @param {integer} strideIPIV - stride length for `IPIV`
* @param {Float64Array} x - input array
* @param {integer} strideX - stride length for `x`
* @param {Float64Array} WORK - input array
* @param {Float64Array} RWORK - output array
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} Second argument must be a valid transpose operation
* @throws {RangeError} third argument must be a nonnegative integer
* @throws {RangeError} seventh argument must be greater than or equal to max(1,N)
* @throws {RangeError} ninth argument must be greater than or equal to max(1,N)
* @returns {number} result
*/
function zla_gbrcond_x( order, trans, N, kl, ku, AB, LDAB, AFB, LDAFB, IPIV, strideIPIV, x, strideX, WORK, RWORK ) { // eslint-disable-line max-len, max-params
	let safb1, safb2, sab1, sab2;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	const offsetIPIV = stride2offset( N, strideIPIV );
	if ( !isTransposeOperation( trans ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid transpose operation. Value: `%s`.', trans ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( order === 'column-major' && ( LDAB < kl + ku + 1 ) ) {
		throw new RangeError( format( 'invalid argument. Seventh argument violates the reference leading-dimension rule (column-major: rejected when `LDAB.LT.KL+KU+1`). Value: `%d`.', LDAB ) );
	}
	if ( order === 'row-major' && ( LDAB < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Seventh argument violates the reference leading-dimension rule (row-major: must also cover the N columns). Value: `%d`.', LDAB ) );
	}
	if ( order === 'column-major' && ( LDAFB < 2 * kl + ku + 1 ) ) {
		throw new RangeError( format( 'invalid argument. Ninth argument violates the reference leading-dimension rule (column-major: rejected when `LDAFB.LT.2*KL+KU+1`). Value: `%d`.', LDAFB ) );
	}
	if ( order === 'row-major' && ( LDAFB < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Ninth argument violates the reference leading-dimension rule (row-major: must also cover the N columns). Value: `%d`.', LDAFB ) );
	}
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
	return base( trans, N, kl, ku, AB, sab1, sab2, 0, AFB, safb1, safb2, 0, IPIV, strideIPIV, offsetIPIV, x, strideX, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default zla_gbrcond_x;
