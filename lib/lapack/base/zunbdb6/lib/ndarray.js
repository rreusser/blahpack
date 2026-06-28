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

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Orthogonalizes the complex column vector `X = [X1; X2]` against the columns of `Q = [Q1; Q2]`.
*
* @param {NonNegativeInteger} m1 - dimension of `X1` and number of rows in `Q1`
* @param {NonNegativeInteger} m2 - dimension of `X2` and number of rows in `Q2`
* @param {NonNegativeInteger} N - number of columns in `Q1` and `Q2`
* @param {Complex128Array} X1 - top part of the vector
* @param {integer} strideX1 - `X1` stride length (in complex elements)
* @param {NonNegativeInteger} offsetX1 - starting index for `X1` (in complex elements)
* @param {Complex128Array} X2 - bottom part of the vector
* @param {integer} strideX2 - `X2` stride length (in complex elements)
* @param {NonNegativeInteger} offsetX2 - starting index for `X2` (in complex elements)
* @param {Complex128Array} Q1 - top part of the orthonormal basis matrix
* @param {integer} strideQ11 - stride of the first dimension of `Q1` (in complex elements)
* @param {integer} strideQ12 - stride of the second dimension of `Q1` (in complex elements)
* @param {NonNegativeInteger} offsetQ1 - starting index for `Q1` (in complex elements)
* @param {Complex128Array} Q2 - bottom part of the orthonormal basis matrix
* @param {integer} strideQ21 - stride of the first dimension of `Q2` (in complex elements)
* @param {integer} strideQ22 - stride of the second dimension of `Q2` (in complex elements)
* @param {NonNegativeInteger} offsetQ2 - starting index for `Q2` (in complex elements)
* @param {Complex128Array} WORK - workspace array (length at least `N`)
* @param {integer} strideWork - `WORK` stride length (in complex elements)
* @param {NonNegativeInteger} offsetWork - starting index for `WORK` (in complex elements)
* @throws {RangeError} `m1` must be a nonnegative integer
* @throws {RangeError} `m2` must be a nonnegative integer
* @throws {RangeError} `N` must be a nonnegative integer
* @throws {RangeError} `strideX1` must be nonzero
* @throws {RangeError} `strideX2` must be nonzero
* @returns {integer} `info` (0 = success)
*/
function zunbdb6( m1, m2, N, X1, strideX1, offsetX1, X2, strideX2, offsetX2, Q1, strideQ11, strideQ12, offsetQ1, Q2, strideQ21, strideQ22, offsetQ2, WORK, strideWork, offsetWork ) {
	if ( m1 < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', m1 ) );
	}
	if ( m2 < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', m2 ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( strideX1 === 0 ) {
		throw new RangeError( format( 'invalid argument. `X1` stride must be nonzero. Value: `%d`.', strideX1 ) );
	}
	if ( strideX2 === 0 ) {
		throw new RangeError( format( 'invalid argument. `X2` stride must be nonzero. Value: `%d`.', strideX2 ) );
	}
	return base( m1, m2, N, X1, strideX1, offsetX1, X2, strideX2, offsetX2, Q1, strideQ11, strideQ12, offsetQ1, Q2, strideQ21, strideQ22, offsetQ2, WORK, strideWork, offsetWork );
}


// EXPORTS //

export default zunbdb6;
