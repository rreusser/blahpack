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
import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Performs a series of row interchanges on a complex double-precision matrix `A`.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {PositiveInteger} N - number of columns in `A`
* @param {Complex128Array} A - input matrix
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {NonNegativeInteger} k1 - index of first row to interchange (0-based)
* @param {NonNegativeInteger} k2 - index of last row to interchange (0-based)
* @param {Int32Array} IPIV - input array
* @param {integer} strideIPIV - `IPIV` stride length
* @param {integer} incx - direction in which to apply pivots (-1 to apply in reverse order; otherwise, apply in provided order)
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {Complex128Array} output array
*/
function zlaswp( order, N, A, LDA, k1, k2, IPIV, strideIPIV, incx ) {
	var sa1;
	var sa2;
	var oi;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be greater than or equal to max(1,N). Value: `%d`.', LDA ) );
	}
	if ( order === 'column-major' ) {
		sa1 = 1;
		sa2 = LDA;
	} else {
		sa1 = LDA;
		sa2 = 1;
	}
	oi = stride2offset( N, strideIPIV );
	return base( N, A, sa1, sa2, 0, k1, k2, IPIV, strideIPIV, oi, incx );
}


// EXPORTS //

export default zlaswp;
