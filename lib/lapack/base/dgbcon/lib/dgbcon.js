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
import base from './base.js';


// MAIN //

/**
* @license Apache-2.0
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {string} norm - norm
* @param {NonNegativeInteger} N - N
* @param {NonNegativeInteger} kl - kl
* @param {NonNegativeInteger} ku - ku
* @param {Float64Array} AB - AB
* @param {PositiveInteger} LDAB - leading dimension of `AB`
* @param {Int32Array} IPIV - IPIV
* @param {integer} strideIPIV - strideIPIV
* @param {number} anorm - anorm
* @param {Float64Array} rcond - rcond
* @param {Float64Array} WORK - WORK
* @param {Int32Array} IWORK - IWORK
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} if a string argument is not a valid option
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info status code
*/
function dgbcon( order, norm, N, kl, ku, AB, LDAB, IPIV, strideIPIV, anorm, rcond, WORK, IWORK ) { // eslint-disable-line max-len, max-params

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
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
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( order === 'row-major' && LDAB < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be greater than or equal to max(1,N). Value: `%d`.', LDAB ) );
	}
	if ( order === 'column-major' && LDAB < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be greater than or equal to max(1,N). Value: `%d`.', LDAB ) );
	}
	if ( norm !== 'one-norm' && norm !== 'inf-norm' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid norm. Value: `%s`.', norm ) );
	}
	return base( norm, N, kl, ku, AB, sab1, sab2, 0, IPIV, strideIPIV, oipiv, anorm, rcond, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default dgbcon;
