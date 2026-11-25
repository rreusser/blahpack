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
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Swaps adjacent diagonal 1-by-1 or 2-by-2 blocks in an upper (quasi) triangular matrix pair.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {boolean} wantq - `true` : update the left transformation matrix Q; `false`: do not update Q.
* @param {boolean} wantz - `true` : update the right transformation matrix Z; `false`: do not update Z.
* @param {NonNegativeInteger} N - number of columns
* @param {Float64Array} A - input matrix
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Float64Array} B - input matrix
* @param {PositiveInteger} LDB - leading dimension of `B`
* @param {Float64Array} Q - input matrix
* @param {PositiveInteger} LDQ - leading dimension of `Q`
* @param {Float64Array} Z - input matrix
* @param {PositiveInteger} LDZ - leading dimension of `Z`
* @param {integer} j1 - the index to the first block (A11, B11). 1 <= J1 <= N.
* @param {NonNegativeInteger} n1 - the order of the first block (A11, B11).
* @param {NonNegativeInteger} n2 - the order of the second block (A22, B22).
* @param {(Float64Array|null)} WORK - output array
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} fourth argument must be a nonnegative integer
* @returns {integer} status code (0 = success)
*/
function dtgex2( order, wantq, wantz, N, A, LDA, B, LDB, Q, LDQ, Z, LDZ, j1, n1, n2, WORK ) { // eslint-disable-line max-len, max-params
	let sa1, sa2, sb1, sb2, sq1, sq2, sz1, sz2;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( order === 'column-major' ) {
		sa1 = 1;
		sa2 = LDA;
		sb1 = 1;
		sb2 = LDB;
		sq1 = 1;
		sq2 = LDQ;
		sz1 = 1;
		sz2 = LDZ;
	} else {
		sa1 = LDA;
		sa2 = 1;
		sb1 = LDB;
		sb2 = 1;
		sq1 = LDQ;
		sq2 = 1;
		sz1 = LDZ;
		sz2 = 1;
	}
	if ( WORK === null || WORK === void 0 ) {
		const minWork = Math.max( 1, N * (n2 + n1), (n2 + n1) * (n2 + n1) * 2 );
		WORK = new Float64Array( minWork );
	}
	return base( wantq, wantz, N, A, sa1, sa2, 0, B, sb1, sb2, 0, Q, sq1, sq2, 0, Z, sz1, sz2, 0, j1, n1, n2, WORK, 1, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default dtgex2;
