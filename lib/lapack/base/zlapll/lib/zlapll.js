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

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Measures the linear dependence of two vectors X and Y by computing the.
* QR factorization of the N-by-2 matrix `(X Y)` and returning the smallest
* singular value of the resulting 2-by-2 upper triangular R factor.
*
* @param {NonNegativeInteger} N - length of the vectors
* @param {Complex128Array} x - first complex vector (overwritten)
* @param {integer} strideX - stride for x (in complex elements)
* @param {Complex128Array} y - second complex vector (overwritten)
* @param {integer} strideY - stride for y (in complex elements)
* @param {Float64Array} ssmin - output: `ssmin[0]` receives the smallest singular value
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {void}
*/
function zlapll( N, x, strideX, y, strideY, ssmin ) {
	var ox;
	var oy;

	ox = stride2offset( N, strideX );
	oy = stride2offset( N, strideY );
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( N, x, strideX, ox, y, strideY, oy, ssmin );
}


// EXPORTS //

export default zlapll;
