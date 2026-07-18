/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

// MODULES //

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import dladiv from '../../dladiv/lib/base.js';


// VARIABLES //

const SCRATCH = new Float64Array( 2 );


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
	const xv = reinterpret( x, 0 );
	const yv = reinterpret( y, 0 );
	const ov = reinterpret( out, 0 );
	const ox = offsetX * 2;
	const oy = offsetY * 2;
	const oo = offsetOut * 2;
	dladiv( xv[ ox ], xv[ ox + 1 ], yv[ oy ], yv[ oy + 1 ], SCRATCH );
	ov[ oo ] = SCRATCH[ 0 ];
	ov[ oo + 1 ] = SCRATCH[ 1 ];
	return out;
}


// EXPORTS //

export default zladiv;
