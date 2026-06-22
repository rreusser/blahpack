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
* Conjugate a complex vector in-place.
*
* @private
* @param {NonNegativeInteger} N - number of complex elements
* @param {Complex128Array} x - complex input vector
* @param {integer} stride - stride for `x` (in complex elements)
* @param {NonNegativeInteger} offset - starting index for `x` (in complex elements)
* @returns {Complex128Array} `x`
*/
function zlacgv( N, x, stride, offset ) {
	var xv;
	var sx;
	var ix;
	var i;

	if ( N <= 0 ) {
		return x;
	}

	xv = reinterpret( x, 0 );
	ix = offset * 2;

	sx = stride * 2;
	for ( i = 0; i < N; i++ ) {
		xv[ ix + 1 ] = -xv[ ix + 1 ];
		ix += sx;
	}
	return x;
}


// EXPORTS //

export default zlacgv;
