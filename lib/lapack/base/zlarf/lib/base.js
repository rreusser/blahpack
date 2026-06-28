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

/* eslint-disable max-len, max-params */

// MODULES //

import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zgemv from '../../../../blas/base/zgemv/lib/base.js';
import zgerc from '../../../../blas/base/zgerc/lib/base.js';
import ilazlr from '../../ilazlr/lib/base.js';
import ilazlc from '../../ilazlc/lib/base.js';


// VARIABLES //

var ONE = new Complex128( 1.0, 0.0 );
var ZERO = new Complex128( 0.0, 0.0 );


// MAIN //

/**
* Apply a complex elementary reflector H to a complex M-by-N matrix C.
* from either the left or the right.
*
* `H = I - tau*v*v^H`
*
* If tau = 0, then H is taken to be the unit matrix.
*
* @private
* @param {string} side - `'left'` or `'right'`
* @param {NonNegativeInteger} M - number of rows of C
* @param {NonNegativeInteger} N - number of columns of C
* @param {Complex128Array} v - reflector vector
* @param {integer} strideV - stride for v (in complex elements)
* @param {NonNegativeInteger} offsetV - starting index for v (in complex elements)
* @param {Complex128Array} tau - complex scalar
* @param {NonNegativeInteger} offsetTau - starting index for tau (in complex elements)
* @param {Complex128Array} C - matrix, modified in-place
* @param {integer} strideC1 - stride of the first dimension of C (complex elements)
* @param {integer} strideC2 - stride of the second dimension of C (complex elements)
* @param {NonNegativeInteger} offsetC - starting index for C (in complex elements)
* @param {Complex128Array} WORK - workspace
* @param {integer} strideWork - stride for WORK (in complex elements)
* @param {NonNegativeInteger} offsetWork - starting index for WORK (in complex elements)
*/
function zlarf( side, M, N, v, strideV, offsetV, tau, offsetTau, C, strideC1, strideC2, offsetC, WORK, strideWork, offsetWork ) {
	var applyLeft;
	var negTau;
	var lastv;
	var lastc;
	var tauR;
	var tauI;
	var tauv;
	var vv;
	var sv;
	var ix;
	var oT;

	tauv = reinterpret( tau, 0 );
	oT = offsetTau * 2;
	tauR = tauv[ oT ];
	tauI = tauv[ oT + 1 ];

	applyLeft = ( side === 'left' );
	lastv = 0;
	lastc = 0;

	if ( tauR !== 0.0 || tauI !== 0.0 ) {
		// Set up variables for scanning V
		if ( applyLeft ) {
			lastv = M;
		} else {
			lastv = N;
		}

		vv = reinterpret( v, 0 );
		sv = strideV * 2;

		if ( strideV > 0 ) {
			ix = (offsetV * 2) + (( lastv - 1 ) * sv);
		} else {
			ix = offsetV * 2;
		}

		// Look for the last non-zero element in V (working backward from lastv)
		while ( lastv > 0 && vv[ ix ] === 0.0 && vv[ ix + 1 ] === 0.0 ) {
			lastv -= 1;
			ix -= sv;
		}

		if ( applyLeft ) {
			// Scan for the last non-zero column in C(0:lastv-1, :)
			lastc = ilazlc( lastv, N, C, strideC1, strideC2, offsetC ) + 1;
		} else {
			// Scan for the last non-zero row in C(:, 0:lastv-1)
			lastc = ilazlr( M, lastv, C, strideC1, strideC2, offsetC ) + 1;
		}
	}

	negTau = new Complex128( -tauR, -tauI );

	if ( applyLeft ) {
		// Form H * C
		if ( lastv > 0 ) {
			// w(1:lastc) := C(1:lastv, 1:lastc)^H * v(1:lastv)
			zgemv( 'conjugate-transpose', lastv, lastc, ONE, C, strideC1, strideC2, offsetC,
				v, strideV, offsetV, ZERO, WORK, strideWork, offsetWork );

			// C(1:lastv, 1:lastc) := C(...) - tau * v(1:lastv) * w(1:lastc)^H
			zgerc( lastv, lastc, negTau, v, strideV, offsetV,
				WORK, strideWork, offsetWork, C, strideC1, strideC2, offsetC );
		}
	} else if ( lastv > 0 ) {
		// Form C * H

		// w(1:lastc) := C(1:lastc, 1:lastv) * v(1:lastv)
		zgemv( 'no-transpose', lastc, lastv, ONE, C, strideC1, strideC2, offsetC,
			v, strideV, offsetV, ZERO, WORK, strideWork, offsetWork );

		// C(1:lastc, 1:lastv) := C(...) - tau * w(1:lastc) * v(1:lastv)^H
		zgerc( lastc, lastv, negTau, WORK, strideWork, offsetWork,
			v, strideV, offsetV, C, strideC1, strideC2, offsetC );
	}
}


// EXPORTS //

export default zlarf;
