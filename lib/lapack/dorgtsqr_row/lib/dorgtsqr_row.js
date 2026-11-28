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

import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import min from '@stdlib/math/base/special/fast/min/lib/index.js';
import strided from './strided.js';


// MAIN //

/**
* Generates an M-by-N real matrix Q with orthonormal columns from the output of DLATSQR using a row-block (GETT) sweep.
*
* @param {Layout} order - storage layout ('row-major' or 'column-major')
* @param {NonNegativeInteger} M - number of rows
* @param {NonNegativeInteger} N - number of columns
* @param {integer} mb - the row block size used by DLATSQR to return arrays A and T.
* @param {integer} nb - the column block size used by DLATSQR to return arrays A and T.
* @param {Float64Array} A - input matrix
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Float64Array} T - input matrix
* @param {PositiveInteger} LDT - leading dimension of `T`
* @param {(Float64Array|null)} WORK - output array
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} second argument must be a nonnegative integer
* @throws {RangeError} third argument is invalid (rejected when `N < 0 || M < N`)
* @throws {RangeError} fourth argument is invalid (rejected when `mb <= N`)
* @throws {RangeError} fifth argument is invalid (rejected when `nb < 1`)
* @throws {RangeError} seventh argument must be greater than or equal to `max( 1, M )` (column-major)
* @throws {RangeError} seventh argument must be greater than or equal to `max( 1, N )` (row-major)
* @throws {RangeError} ninth argument must be greater than or equal to `max( 1, min( nb, N ) )` (column-major)
* @throws {RangeError} `LDA` must be greater than or equal to `max(1,M)` for column-major (or `max(1,N)` for row-major)
* @returns {integer} status code (0 = success)
*/
function dorgtsqr_row( order, M, N, mb, nb, A, LDA, T, LDT, WORK ) { // eslint-disable-line max-len, max-params
	let sa1, sa2, st1, st2;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 || M < N ) {
		throw new RangeError( format( 'invalid argument. Third argument is invalid (rejected when `N < 0 || M < N`). Value: `%d`.', N ) );
	}
	if ( mb <= N ) {
		throw new RangeError( format( 'invalid argument. Fourth argument is invalid (rejected when `mb <= N`). Value: `%d`.', mb ) );
	}
	if ( nb < 1 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument is invalid (rejected when `nb < 1`). Value: `%d`.', nb ) );
	}
	if ( order === 'column-major' && ( LDA < max( 1, M ) ) ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be greater than or equal to max(1,%d). Value: `%d`.', M, LDA ) );
	}
	if ( order === 'row-major' && ( LDA < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDA ) );
	}
	if ( order === 'column-major' && ( LDT < max( 1, min( nb, N ) ) ) ) {
		throw new RangeError( format( 'invalid argument. Ninth argument must be greater than or equal to max(1,%d). Value: `%d`.', min( nb, N ), LDT ) );
	}
	if ( order === 'column-major' ) {
		sa1 = 1;
		sa2 = LDA;
		st1 = 1;
		st2 = LDT;
	} else {
		sa1 = LDA;
		sa2 = 1;
		st1 = LDT;
		st2 = 1;
	}
	if ( WORK === null || WORK === void 0 ) {
		const nblocal = ( nb < N ) ? nb : N;
		const minWork = Math.max( 1, nblocal * Math.max( nblocal, N - nblocal ) );
		WORK = new Float64Array( minWork );
	}
	return strided( M, N, mb, nb, A, sa1, sa2, 0, T, st1, st2, 0, WORK, 1, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default dorgtsqr_row;
