/**
* @license Apache-2.0
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
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
* Performs a series of row interchanges on a matrix `A` using pivot indices stored in `IPIV`.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {PositiveInteger} N - number of columns in `A`
* @param {Float64Array} A - input matrix
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {NonNegativeInteger} k1 - index of first row to interchange
* @param {NonNegativeInteger} k2 - index of last row to interchange
* @param {Int32Array} IPIV - vector of pivot indices
* @param {integer} incx - increment between successive values of `IPIV`
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} second argument must be a nonnegative integer
* @throws {RangeError} fourth argument must be greater than or equal to max(1,N)
* @returns {Float64Array} permuted matrix `A`
*/
function dlaswp( order, N, A, LDA, k1, k2, IPIV, incx ) {
	var tmp;
	var inc;
	var sa1;
	var sa2;
	var io;
	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( order === 'row-major' && LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDA ) );
	}
	if ( incx > 0 ) {
		inc = 1;
		io = k1;
	} else if ( incx < 0 ) {
		inc = -1;
		io = k1 + ( (k1-k2) * incx );
		tmp = k1;
		k1 = k2;
		k2 = tmp;
	} else {
		return A;
	}
	if ( order === 'column-major' ) {
		sa1 = 1;
		sa2 = LDA;
	} else { // order === 'row-major'
		sa1 = LDA;
		sa2 = 1;
	}
	return base( N, A, sa1, sa2, 0, k1, k2, inc, IPIV, incx, io );
}


// EXPORTS //

export default dlaswp;
