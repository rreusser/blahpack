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
import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes all eigenvalues and, optionally, eigenvectors of a real symmetric.
* positive definite tridiagonal matrix.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {string} compz - specifies whether eigenvectors are computed
* @param {NonNegativeInteger} N - order of the matrix
* @param {Float64Array} d - diagonal elements (length N)
* @param {integer} strideD - `d` stride length
* @param {Float64Array} e - subdiagonal elements (length N-1)
* @param {integer} strideE - `e` stride length
* @param {Float64Array} Z - eigenvector matrix (N-by-N)
* @param {PositiveInteger} LDZ - leading dimension of `Z`
* @param {Float64Array} WORK - workspace (length >= 4*N)
* @param {integer} strideWORK - `WORK` stride length
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} status code (0 = success)
*/
function dpteqr( order, compz, N, d, strideD, e, strideE, Z, LDZ, WORK, strideWORK ) {
	var sz1;
	var sz2;
	var od;
	var oe;
	var ow;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( LDZ < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Ninth argument must be greater than or equal to max(1,N). Value: `%d`.', LDZ ) );
	}
	if ( compz !== 'none' && compz !== 'update' && compz !== 'initialize' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid `compz` value. Value: `%s`.', compz ) );
	}
	if ( order === 'column-major' ) {
		sz1 = 1;
		sz2 = LDZ;
	} else {
		sz1 = LDZ;
		sz2 = 1;
	}
	od = stride2offset( N, strideD );
	oe = stride2offset( N, strideE );
	if ( WORK === null || WORK === void 0 ) {
		var minWork = Math.max( 1, 4 * N );
		WORK = new Float64Array( minWork );
		strideWORK = 1;
	}
	ow = stride2offset( N, strideWORK );
	return base( compz, N, d, strideD, od, e, strideE, oe, Z, sz1, sz2, 0, WORK, strideWORK, ow );
}


// EXPORTS //

export default dpteqr;
