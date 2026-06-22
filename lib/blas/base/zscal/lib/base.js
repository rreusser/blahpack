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
import real from '@stdlib/complex/float64/real/lib/index.js';
import imag from '@stdlib/complex/float64/imag/lib/index.js';


// MAIN //

/**
* Scale a complex double-precision vector by a complex constant.
*
* @private
* @param {PositiveInteger} N - number of complex elements
* @param {Complex128} za - complex scalar
* @param {Complex128Array} zx - complex input vector
* @param {integer} strideX - stride for `zx` (in complex elements)
* @param {NonNegativeInteger} offsetX - starting index for `zx` (in complex elements)
* @returns {Complex128Array} `zx`
*/
function zscal( N, za, zx, strideX, offsetX ) {
	var zaR;
	var zaI;
	var xv;
	var sx;
	var ix;
	var tr;
	var i;

	if ( N <= 0 ) {
		return zx;
	}

	zaR = real( za );
	zaI = imag( za );

	// Early return if za === (1, 0)
	if ( zaR === 1.0 && zaI === 0.0 ) {
		return zx;
	}

	xv = reinterpret( zx, 0 );
	ix = offsetX * 2;

	// Each complex element spans 2 doubles, so multiply stride by 2
	sx = strideX * 2;

	for ( i = 0; i < N; i++ ) {
		tr = (zaR * xv[ ix ]) - (zaI * xv[ ix + 1 ]);
		xv[ ix + 1 ] = (zaR * xv[ ix + 1 ]) + (zaI * xv[ ix ]);
		xv[ ix ] = tr;
		ix += sx;
	}
	return zx;
}


// EXPORTS //

export default zscal;
