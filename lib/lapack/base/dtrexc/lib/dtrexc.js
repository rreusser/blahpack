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
* @param {integer} ifst - ifst
* @param {integer} ilst - ilst
* @param {Float64Array} WORK - WORK
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} if a string argument is not a valid option
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {Object} { info, ifst, ilst }
*/
function dtrexc( order, compq, N, T, LDT, Q, LDQ, ifst, ilst, WORK ) { // eslint-disable-line max-len, max-params

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	const st1 = ( order === 'column-major' ) ? 1 : LDT;
	const st2 = ( order === 'column-major' ) ? LDT : 1;
	const sq1 = ( order === 'column-major' ) ? 1 : LDQ;
	const sq2 = ( order === 'column-major' ) ? LDQ : 1;
	if ( WORK === null || WORK === void 0 ) {
		const minWork = Math.max( 1, N );
		WORK = new Float64Array( minWork );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( order === 'row-major' && LDT < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be greater than or equal to max(1,N). Value: `%d`.', LDT ) );
	}
	if ( order === 'column-major' && LDT < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be greater than or equal to max(1,N). Value: `%d`.', LDT ) );
	}
	if ( order === 'row-major' && LDQ < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be greater than or equal to max(1,N). Value: `%d`.', LDQ ) );
	}
	if ( order === 'column-major' && LDQ < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be greater than or equal to max(1,N). Value: `%d`.', LDQ ) );
	}
	if ( compq !== 'update' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid `compq` value. Value: `%s`.', compq ) );
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
