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
* Copy a complex double-precision vector.
*
* @private
* @param {PositiveInteger} N - number of complex elements
* @param {Complex128Array} zx - source complex vector
* @param {integer} strideX - stride for `zx` (in complex elements)
* @param {NonNegativeInteger} offsetX - starting index for `zx` (in complex elements)
* @param {Complex128Array} zy - destination complex vector
* @param {integer} strideY - stride for `zy` (in complex elements)
* @param {NonNegativeInteger} offsetY - starting index for `zy` (in complex elements)
* @returns {Complex128Array} `zy`
*/
function zcopy( N, zx, strideX, offsetX, zy, strideY, offsetY ) {
	var xv;
	var yv;
	var sx;
	var sy;
	var ix;
	var iy;
	var i;

	if ( N <= 0 ) {
		return zy;
	}

	xv = reinterpret( zx, 0 );
	yv = reinterpret( zy, 0 );
	ix = offsetX * 2;
	iy = offsetY * 2;

	// Each complex element spans 2 doubles, so multiply stride by 2
	sx = strideX * 2;
	sy = strideY * 2;

	for ( i = 0; i < N; i++ ) {
		yv[ iy ] = xv[ ix ];
		yv[ iy + 1 ] = xv[ ix + 1 ];
		ix += sx;
		iy += sy;
	}
	return zy;
}


// EXPORTS //

export default zcopy;
