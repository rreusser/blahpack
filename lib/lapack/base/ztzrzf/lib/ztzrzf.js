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
* Reduces a complex M-by-N (M <= N) upper trapezoidal matrix `A` to upper triangular form via unitary RZ factorization (blocked driver).
*
* @param {string} order - storage layout (`'row-major'` or `'column-major'`)
* @param {NonNegativeInteger} M - number of rows of `A`
* @param {NonNegativeInteger} N - number of columns of `A`
* @param {Complex128Array} A - input/output matrix
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Complex128Array} TAU - output array of scalar factors of the elementary reflectors (length `M`)
* @param {integer} strideTAU - stride length for `TAU` (in complex elements)
* @param {Complex128Array} WORK - workspace array
* @param {integer} strideWORK - stride length for `WORK` (in complex elements)
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} `M` must be a nonnegative integer
* @throws {RangeError} `N` must be a nonnegative integer
* @throws {RangeError} `N` must be greater than or equal to `M`
* @throws {RangeError} `LDA` must satisfy the layout constraint
* @returns {integer} status code (0 = success)
*/
function ztzrzf( order, M, N, A, LDA, TAU, strideTAU, WORK, strideWORK ) {
	var sa1;
	var sa2;
	var ot;
	var ow;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( N < M ) {
		throw new RangeError( format( 'invalid argument. Third argument must be greater than or equal to the second argument. Value: `%d`.', N ) );
	}
	if ( order === 'row-major' && LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be greater than or equal to max(1,N). Value: `%d`.', LDA ) );
	}
	if ( order === 'column-major' && LDA < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be greater than or equal to max(1,M). Value: `%d`.', LDA ) );
	}
	if ( order === 'column-major' ) {
		sa1 = 1;
		sa2 = LDA;
	} else {
		sa1 = LDA;
		sa2 = 1;
	}
	ot = stride2offset( max( 1, M ), strideTAU );
	ow = stride2offset( max( 1, M ), strideWORK );
	return base( M, N, A, sa1, sa2, 0, TAU, strideTAU, ot, WORK, strideWORK, ow );
}


// EXPORTS //

export default ztzrzf;
