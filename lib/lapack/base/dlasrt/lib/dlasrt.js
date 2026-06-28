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

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Sort an array of doubles in increasing or decreasing order using quicksort.
*
* @param {string} id - sort direction: 'increasing' or 'decreasing'
* @param {NonNegativeInteger} N - number of elements to sort
* @param {Float64Array} d - input array
* @param {integer} stride - `d` stride length
* @throws {TypeError} if a string argument is not a valid option
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info status code
*/
function dlasrt( id, N, d, stride ) {
	var od = stride2offset( N, stride );
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( id !== 'decreasing' && id !== 'increasing' ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid `id` value. Value: `%s`.', id ) );
	}
	return base( id, N, d, stride, od );
}


// EXPORTS //

export default dlasrt;
