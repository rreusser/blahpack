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

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes the reciprocal pivot growth factor `norm(A)/norm(U)`.
*
* @param {NonNegativeInteger} N - number of rows
* @param {NonNegativeInteger} ncols - number of columns to process
* @param {Float64Array} A - input matrix A (column-major, dimension N x ncols)
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Float64Array} AF - factored matrix AF (column-major, dimension N x ncols)
* @param {PositiveInteger} LDAF - leading dimension of `AF`
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {number} reciprocal pivot growth factor
*/
function dla_gerpvgrw( N, ncols, A, LDA, AF, LDAF ) {
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be greater than or equal to max(1,N). Value: `%d`.', LDA ) );
	}
	if ( LDAF < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be greater than or equal to max(1,N). Value: `%d`.', LDAF ) );
	}
	return base( N, ncols, A, 1, LDA, 0, AF, 1, LDAF, 0 );
}


// EXPORTS //

export default dla_gerpvgrw;
