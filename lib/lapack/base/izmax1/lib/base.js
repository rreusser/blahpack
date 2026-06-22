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
import cabs from '@stdlib/math/base/special/cabs/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';


// MAIN //

/**
* Finds the index of the first vector element of maximum absolute value.
*
* Based on IZAMAX from Level 1 BLAS. The change is to use the 'genuine'
* absolute value (cabs) rather than dcabs1.
*
* Returns a 0-based index (Fortran returns 1-based).
*
* @private
* @param {NonNegativeInteger} N - number of complex elements
* @param {Complex128Array} ZX - complex input vector
* @param {integer} strideZX - stride for `ZX` (in complex elements)
* @param {NonNegativeInteger} offsetZX - starting index for `ZX` (in complex elements)
* @returns {integer} 0-based index of the element with maximum absolute value
*/
function izmax1( N, ZX, strideZX, offsetZX ) {
	var result;
	var dmax;
	var val;
	var xv;
	var sx;
	var ix;
	var i;

	if ( N < 1 ) {
		return -1;
	}
	result = 0;
	if ( N === 1 ) {
		return 0;
	}

	xv = reinterpret( ZX, 0 );
	ix = offsetZX * 2;
	sx = strideZX * 2;

	dmax = cabs( new Complex128( xv[ ix ], xv[ ix + 1 ] ) );
	ix += sx;

	for ( i = 1; i < N; i++ ) {
		val = cabs( new Complex128( xv[ ix ], xv[ ix + 1 ] ) );
		if ( val > dmax ) {
			result = i;
			dmax = val;
		}
		ix += sx;
	}
	return result;
}


// EXPORTS //

export default izmax1;
