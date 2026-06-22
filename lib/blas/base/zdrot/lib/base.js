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

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';


// MAIN //

/**
* Applies a real plane rotation to a pair of complex double-precision vectors:.
*
* `zx(i) = c*zx(i) + s*zy(i)`
* `zy(i) = c*zy(i) - s*zx(i)`
*
* where c and s are real scalars (cosine and sine of a Givens rotation).
*
* @private
* @param {NonNegativeInteger} N - number of complex elements
* @param {Complex128Array} zx - first complex input/output vector
* @param {integer} strideX - stride for `zx` (in complex elements)
* @param {NonNegativeInteger} offsetX - starting index for `zx` (in complex elements)
* @param {Complex128Array} zy - second complex input/output vector
* @param {integer} strideY - stride for `zy` (in complex elements)
* @param {NonNegativeInteger} offsetY - starting index for `zy` (in complex elements)
* @param {number} c - cosine of rotation (real)
* @param {number} s - sine of rotation (real)
* @returns {Complex128Array} `zx`
*/
function zdrot( N, zx, strideX, offsetX, zy, strideY, offsetY, c, s ) {
	var tempr;
	var tempi;
	var xv;
	var yv;
	var sx;
	var sy;
	var ix;
	var iy;
	var i;

	if ( N <= 0 ) {
		return zx;
	}

	xv = reinterpret( zx, 0 );
	yv = reinterpret( zy, 0 );
	ix = offsetX * 2;
	iy = offsetY * 2;

	// Each complex element spans 2 doubles, so multiply stride by 2
	sx = strideX * 2;
	sy = strideY * 2;

	for ( i = 0; i < N; i++ ) {
		tempr = (c * xv[ ix ]) + (s * yv[ iy ]);
		tempi = (c * xv[ ix + 1 ]) + (s * yv[ iy + 1 ]);
		yv[ iy ] = (c * yv[ iy ]) - (s * xv[ ix ]);
		yv[ iy + 1 ] = (c * yv[ iy + 1 ]) - (s * xv[ ix + 1 ]);
		xv[ ix ] = tempr;
		xv[ ix + 1 ] = tempi;
		ix += sx;
		iy += sy;
	}
	return zx;
}


// EXPORTS //

export default zdrot;
