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
import dladiv from '../../dladiv/lib/base.js';


// VARIABLES //

var SCRATCH = new Float64Array( 2 );


// MAIN //

/**
* Performs complex division: out = X / Y, where X and Y are complex.
*
* The computation will not overflow on an intermediary step unless
* the result overflows.
*
* @private
* @param {Complex128Array} x - numerator complex number
* @param {integer} offsetX - offset (in complex elements) into x
* @param {Complex128Array} y - denominator complex number
* @param {integer} offsetY - offset (in complex elements) into y
* @param {Complex128Array} out - output complex number
* @param {integer} offsetOut - offset (in complex elements) into out
* @returns {Complex128Array} out
*/
function zladiv( x, offsetX, y, offsetY, out, offsetOut ) {
	var xv = reinterpret( x, 0 );
	var yv = reinterpret( y, 0 );
	var ov = reinterpret( out, 0 );
	var ox = offsetX * 2;
	var oy = offsetY * 2;
	var oo = offsetOut * 2;
	dladiv( xv[ ox ], xv[ ox + 1 ], yv[ oy ], yv[ oy + 1 ], SCRATCH );
	ov[ oo ] = SCRATCH[ 0 ];
	ov[ oo + 1 ] = SCRATCH[ 1 ];
	return out;
}


// EXPORTS //

export default zladiv;
