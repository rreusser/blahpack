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
* @param {boolean} wantq - wantq
* @param {NonNegativeInteger} N - N
* @param {Float64Array} T - T
* @param {PositiveInteger} LDT - leading dimension of `T`
* @param {Float64Array} Q - Q
* @param {PositiveInteger} LDQ - leading dimension of `Q`
* @param {integer} j1 - j1
* @param {integer} n1 - n1
* @param {integer} n2 - n2
* @param {Float64Array} WORK - WORK
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info status code
*/
function dlaexc( order, wantq, N, T, LDT, Q, LDQ, j1, n1, n2, WORK ) { // eslint-disable-line max-len, max-params

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
	return base( wantq, N, T, st1, st2, 0, Q, sq1, sq2, 0, j1, n1, n2, WORK, 1, 0 );
}


// EXPORTS //

export default dlaexc;
