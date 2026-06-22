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
* Chases a 2-by-2 shift bulge in a matrix pencil `(A,B)` down a single position.
*
* @param {string} order - storage layout (`'row-major'` or `'column-major'`)
* @param {boolean} ilq - determines whether or not to update the matrix `Q`
* @param {boolean} ilz - determines whether or not to update the matrix `Z`
* @param {NonNegativeInteger} k - (0-based) position of the bulge
* @param {NonNegativeInteger} istartm - (0-based) starting column/row of the active window
* @param {NonNegativeInteger} istopm - (0-based) last column of the active window
* @param {NonNegativeInteger} ihi - (0-based) index of the last row of the active Hessenberg region
* @param {Float64Array} A - matrix `A`
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Float64Array} B - matrix `B`
* @param {PositiveInteger} LDB - leading dimension of `B`
* @param {NonNegativeInteger} nq - order of the matrix `Q`
* @param {NonNegativeInteger} qstart - (0-based) start column index of `Q`
* @param {Float64Array} Q - matrix `Q`
* @param {PositiveInteger} LDQ - leading dimension of `Q`
* @param {NonNegativeInteger} nz - order of the matrix `Z`
* @param {NonNegativeInteger} zstart - (0-based) start column index of `Z`
* @param {Float64Array} Z - matrix `Z`
* @param {PositiveInteger} LDZ - leading dimension of `Z`
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} `LDA` must be a positive integer
* @throws {RangeError} `LDB` must be a positive integer
* @throws {RangeError} `LDQ` must be a positive integer
* @throws {RangeError} `LDZ` must be a positive integer
* @returns {Float64Array} `A`
*/
function dlaqz2( order, ilq, ilz, k, istartm, istopm, ihi, A, LDA, B, LDB, nq, qstart, Q, LDQ, nz, zstart, Z, LDZ ) {
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
	if ( LDA < 1 ) {
		throw new RangeError( format( 'invalid argument. Ninth argument must be a positive integer. Value: `%d`.', LDA ) );
	}
	if ( LDB < 1 ) {
		throw new RangeError( format( 'invalid argument. Eleventh argument must be a positive integer. Value: `%d`.', LDB ) );
	}
	if ( LDQ < 1 ) {
		throw new RangeError( format( 'invalid argument. Fifteenth argument must be a positive integer. Value: `%d`.', LDQ ) );
	}
	if ( LDZ < 1 ) {
		throw new RangeError( format( 'invalid argument. Nineteenth argument must be a positive integer. Value: `%d`.', LDZ ) );
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
	return A;
}


// EXPORTS //

export default dlaqz2;
