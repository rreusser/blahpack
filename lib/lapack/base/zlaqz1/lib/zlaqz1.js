/**
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

/* eslint-disable max-len, max-params */

// MODULES //

import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Chases a 1-by-1 shift bulge in a complex matrix pencil `(A,B)` down a single position.
*
* @param {string} order - storage layout (`'row-major'` or `'column-major'`)
* @param {boolean} ilq - whether to update the matrix `Q`
* @param {boolean} ilz - whether to update the matrix `Z`
* @param {NonNegativeInteger} k - 0-based bulge position
* @param {NonNegativeInteger} istartm - 0-based start index for column updates
* @param {NonNegativeInteger} istopm - 0-based end index for column updates
* @param {NonNegativeInteger} ihi - 0-based upper index of the active submatrix
* @param {Complex128Array} A - input/output matrix `A`
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Complex128Array} B - input/output matrix `B`
* @param {PositiveInteger} LDB - leading dimension of `B`
* @param {NonNegativeInteger} nq - order of the matrix `Q`
* @param {NonNegativeInteger} qstart - 0-based start index of the matrix `Q`
* @param {Complex128Array} Q - input/output matrix `Q`
* @param {PositiveInteger} LDQ - leading dimension of `Q`
* @param {NonNegativeInteger} nz - order of the matrix `Z`
* @param {NonNegativeInteger} zstart - 0-based start index of the matrix `Z`
* @param {Complex128Array} Z - input/output matrix `Z`
* @param {PositiveInteger} LDZ - leading dimension of `Z`
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} `k` must be a nonnegative integer
*/
function zlaqz1( order, ilq, ilz, k, istartm, istopm, ihi, A, LDA, B, LDB, nq, qstart, Q, LDQ, nz, zstart, Z, LDZ ) {
	var sa1;
	var sa2;
	var sb1;
	var sb2;
	var sq1;
	var sq2;
	var sz1;
	var sz2;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( k < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', k ) );
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
	base( ilq, ilz, k, istartm, istopm, ihi, A, sa1, sa2, 0, B, sb1, sb2, 0, nq, qstart, Q, sq1, sq2, 0, nz, zstart, Z, sz1, sz2, 0 );
}


// EXPORTS //

export default zlaqz1;
