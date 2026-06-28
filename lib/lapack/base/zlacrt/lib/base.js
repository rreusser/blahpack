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

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import real from '@stdlib/complex/float64/real/lib/index.js';
import imag from '@stdlib/complex/float64/imag/lib/index.js';


// MAIN //

/**
* Applies a plane rotation to two complex vectors, where both the cosine and sine of the rotation are complex.
*
* The operation is:
*
* ```text
* cx(i) = c * cx(i) + s * cy(i)
* cy(i) = c * cy(i) - s * cx(i)
* ```
*
* where `c` and `s` are complex scalars.
*
* @private
* @param {NonNegativeInteger} N - number of complex elements
* @param {Complex128Array} cx - first complex input/output vector
* @param {integer} strideX - stride for `cx` (in complex elements)
* @param {NonNegativeInteger} offsetX - starting index for `cx` (in complex elements)
* @param {Complex128Array} cy - second complex input/output vector
* @param {integer} strideY - stride for `cy` (in complex elements)
* @param {NonNegativeInteger} offsetY - starting index for `cy` (in complex elements)
* @param {Complex128} c - complex cosine of the rotation
* @param {Complex128} s - complex sine of the rotation
* @returns {Complex128Array} `cx`
*/
function zlacrt( N, cx, strideX, offsetX, cy, strideY, offsetY, c, s ) {
	var tempr;
	var tempi;
	var cxir;
	var cxii;
	var cyir;
	var cyii;
	var xv;
	var yv;
	var cr;
	var ci;
	var sr;
	var si;
	var sx;
	var sy;
	var ix;
	var iy;
	var i;

	if ( N <= 0 ) {
		return cx;
	}

	cr = real( c );
	ci = imag( c );
	sr = real( s );
	si = imag( s );

	xv = reinterpret( cx, 0 );
	yv = reinterpret( cy, 0 );
	ix = offsetX * 2;
	iy = offsetY * 2;

	// Each complex element spans 2 doubles, so multiply stride by 2
	sx = strideX * 2;
	sy = strideY * 2;

	for ( i = 0; i < N; i += 1 ) {
		cxir = xv[ ix ];
		cxii = xv[ ix + 1 ];
		cyir = yv[ iy ];
		cyii = yv[ iy + 1 ];

		// CTEMP = c * cx(i) + s * cy(i)
		tempr = ((cr * cxir) - (ci * cxii)) + ((sr * cyir) - (si * cyii));
		tempi = ((cr * cxii) + (ci * cxir)) + ((sr * cyii) + (si * cyir));

		// CY(i) = c * cy(i) - s * cx(i)
		yv[ iy ] = ((cr * cyir) - (ci * cyii)) - ((sr * cxir) - (si * cxii));
		yv[ iy + 1 ] = ((cr * cyii) + (ci * cyir)) - ((sr * cxii) + (si * cxir));

		// CX(i) = temp
		xv[ ix ] = tempr;
		xv[ ix + 1 ] = tempi;

		ix += sx;
		iy += sy;
	}
	return cx;
}


// EXPORTS //

export default zlacrt;
