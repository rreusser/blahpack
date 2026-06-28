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

/* eslint-disable camelcase, max-len, max-params */

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Adds a vector `W` to a doubled-single precision accumulator `(X, Y)` in place.
*
* The accumulator's high-order part is stored in `X` and low-order part in `Y`
* so that `X[i] + Y[i]` approximates the running sum with extra precision.
*
* @param {NonNegativeInteger} N - number of elements in `X`, `Y`, and `W`
* @param {Float64Array} x - high-order part of the accumulator (modified in place)
* @param {integer} strideX - stride length for `x`
* @param {Float64Array} y - low-order part of the accumulator (modified in place)
* @param {integer} strideY - stride length for `y`
* @param {Float64Array} w - vector to be added
* @param {integer} strideW - stride length for `w`
* @throws {RangeError} first argument must be a nonnegative integer
* @returns {Float64Array} `x`
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
*
* var x = new Float64Array( [ 1.0, 2.0, 3.0 ] );
* var y = new Float64Array( [ 0.1, 0.2, 0.3 ] );
* var w = new Float64Array( [ 10.0, 20.0, 30.0 ] );
*
* dla_wwaddw( 3, x, 1, y, 1, w, 1 );
*/
function dla_wwaddw( N, x, strideX, y, strideY, w, strideW ) {
	var ox;
	var oy;
	var ow;
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	ox = stride2offset( N, strideX );
	oy = stride2offset( N, strideY );
	ow = stride2offset( N, strideW );
	base( N, x, strideX, ox, y, strideY, oy, w, strideW, ow );
	return x;
}


// EXPORTS //

export default dla_wwaddw;
