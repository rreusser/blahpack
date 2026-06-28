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

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes all eigenvalues of a real symmetric tridiagonal matrix using the.
*
* @param {NonNegativeInteger} N - order of the matrix
* @param {Float64Array} d - input array
* @param {integer} strideD - `d` stride length
* @param {Float64Array} e - input array
* @param {integer} strideE - `e` stride length
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info status code
*/
function dsterf( N, d, strideD, e, strideE ) {
	var od = stride2offset( N, strideD );
	var oe = stride2offset( N, strideE );
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( N, d, strideD, od, e, strideE, oe );
}


// EXPORTS //

export default dsterf;
