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
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Reduces a pair of real matrices (A, B) to generalized upper Hessenberg.
* form using orthogonal transformations.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {string} compq - `'none'`, `'initialize'`, or `'update'`
* @param {string} compz - `'none'`, `'initialize'`, or `'update'`
* @param {NonNegativeInteger} N - order of the matrices A and B
* @param {integer} ilo - ilo (1-based)
* @param {integer} ihi - ihi (1-based)
* @param {Float64Array} A - input/output matrix A
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Float64Array} B - input/output matrix B
* @param {PositiveInteger} LDB - leading dimension of `B`
* @param {Float64Array} Q - input/output matrix Q
* @param {PositiveInteger} LDQ - leading dimension of `Q`
* @param {Float64Array} Z - input/output matrix Z
* @param {PositiveInteger} LDZ - leading dimension of `Z`
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} status code (0 = success)
*/
function dgghrd( order, compq, compz, N, ilo, ihi, A, LDA, B, LDB, Q, LDQ, Z, LDZ ) {
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
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be greater than or equal to max(1,N). Value: `%d`.', LDA ) );
	}
	if ( LDB < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Tenth argument must be greater than or equal to max(1,N). Value: `%d`.', LDB ) );
	}
	if ( LDQ < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Twelfth argument must be greater than or equal to max(1,N). Value: `%d`.', LDQ ) );
	}
	if ( LDZ < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Fourteenth argument must be greater than or equal to max(1,N). Value: `%d`.', LDZ ) );
	}
	if ( compq !== 'none' && compq !== 'update' && compq !== 'initialize' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid `compq` value. Value: `%s`.', compq ) );
	}
	if ( compz !== 'none' && compz !== 'update' && compz !== 'initialize' ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid `compz` value. Value: `%s`.', compz ) );
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
	return base( compq, compz, N, ilo, ihi, A, sa1, sa2, 0, B, sb1, sb2, 0, Q, sq1, sq2, 0, Z, sz1, sz2, 0 );
}


// EXPORTS //

export default dgghrd;
