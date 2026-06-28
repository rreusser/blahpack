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

// MODULES //

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import cabs from '@stdlib/math/base/special/cabs/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';


// MAIN //

/**
* Takes the sum of the absolute values of a complex vector and returns a.
* double precision result.
*
* Based on DZASUM from Level 1 BLAS. The change is to use the 'genuine'
* absolute value (cabs) rather than dcabs1.
*
* @private
* @param {NonNegativeInteger} N - number of complex elements
* @param {Complex128Array} CX - complex input vector
* @param {integer} strideCX - stride for `CX` (in complex elements)
* @param {NonNegativeInteger} offsetCX - starting index for `CX` (in complex elements)
* @returns {number} sum of absolute values
*/
function dzsum1( N, CX, strideCX, offsetCX ) {
	var stemp;
	var xv;
	var sx;
	var ix;
	var i;

	stemp = 0.0;
	if ( N <= 0 ) {
		return 0.0;
	}

	xv = reinterpret( CX, 0 );
	ix = offsetCX * 2;
	sx = strideCX * 2;

	for ( i = 0; i < N; i++ ) {
		stemp += cabs( new Complex128( xv[ ix ], xv[ ix + 1 ] ) );
		ix += sx;
	}
	return stemp;
}


// EXPORTS //

export default dzsum1;
