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
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* @license Apache-2.0
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {string} compq - compq
* @param {NonNegativeInteger} N - N
* @param {Float64Array} T - T
* @param {PositiveInteger} LDT - leading dimension of `T`
* @param {Float64Array} Q - Q
* @param {PositiveInteger} LDQ - leading dimension of `Q`
* @param {Int32Array} ifst - input/output (length-1 array): ifst
* @param {Int32Array} ilst - input/output (length-1 array): ilst
* @param {(Float64Array|null)} WORK - WORK
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be one of the following: "none", "update"
* @throws {RangeError} third argument must be a nonnegative integer
* @throws {RangeError} fifth argument must be greater than or equal to `max( 1, N )`
* @throws {RangeError} seventh argument is invalid (rejected when `LDQ < 1 || ( compq === "update" && LDQ < max( 1, N ) )`)
* @throws {RangeError} eighth argument is invalid (rejected when `( ifst[ 0 ] < 1 || ifst[ 0 ] > N ) && N > 0`)
* @throws {RangeError} ninth argument is invalid (rejected when `( ilst[ 0 ] < 1 || ilst[ 0 ] > N ) && N > 0`)
* @throws {TypeError} if a string argument is not a valid option
* @returns {integer} status code (0 = success)
*/
function dtrexc( order, compq, N, T, LDT, Q, LDQ, ifst, ilst, WORK ) { // eslint-disable-line max-len, max-params

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( compq !== 'none' && compq !== 'update' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be one of the following: "none", "update". Value: `%s`.', compq ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( LDT < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDT ) );
	}
	if ( LDQ < 1 || ( compq === 'update' && LDQ < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Seventh argument is invalid (rejected when `LDQ < 1 || ( compq === "update" && LDQ < max( 1, N ) )`). Value: `%d`.', LDQ ) );
	}
	if ( ( ifst[ 0 ] < 1 || ifst[ 0 ] > N ) && N > 0 ) {
		throw new RangeError( format( 'invalid argument. Eighth argument is invalid (rejected when `( ifst[ 0 ] < 1 || ifst[ 0 ] > N ) && N > 0`). Value: `%d`.', ifst[ 0 ] ) );
	}
	if ( ( ilst[ 0 ] < 1 || ilst[ 0 ] > N ) && N > 0 ) {
		throw new RangeError( format( 'invalid argument. Ninth argument is invalid (rejected when `( ilst[ 0 ] < 1 || ilst[ 0 ] > N ) && N > 0`). Value: `%d`.', ilst[ 0 ] ) );
	}
	const st1 = ( order === 'column-major' ) ? 1 : LDT;
	const st2 = ( order === 'column-major' ) ? LDT : 1;
	const sq1 = ( order === 'column-major' ) ? 1 : LDQ;
	const sq2 = ( order === 'column-major' ) ? LDQ : 1;
	if ( WORK === null || WORK === void 0 ) {
		const minWork = Math.max( 1, N );
		WORK = new Float64Array( minWork );
	}
	// Assert a caller-provided workspace is large enough so an under-sized
	// buffer is a loud RangeError rather than a silent NaN. WORK needs N.
	if ( N > 0 && WORK.length < N ) {
		throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements. Provided length: %d.', N, WORK.length ) );
	}
	return base( compq, N, T, st1, st2, 0, Q, sq1, sq2, 0, ifst, ilst, WORK, 1, 0 );
}


// EXPORTS //

export default dtrexc;
