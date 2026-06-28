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

import dgemv from '../../../../blas/base/dgemv/lib/base.js';
import dger from '../../../../blas/base/dger/lib/base.js';
import iladlr from '../../iladlr/lib/base.js';
import iladlc from '../../iladlc/lib/base.js';


// MAIN //

/**
* Applies a real elementary reflector H to a real M-by-N matrix C.
* from either the left or the right.
*
* `H = I - tau*v*v**T`
*
* @private
* @param {string} side - `'left'` or `'right'`
* @param {NonNegativeInteger} M - number of rows of C
* @param {NonNegativeInteger} N - number of columns of C
* @param {Float64Array} v - reflector vector
* @param {integer} strideV - stride for v
* @param {NonNegativeInteger} offsetV - starting index for v
* @param {number} tau - scalar factor
* @param {Float64Array} C - matrix, modified in-place
* @param {integer} strideC1 - stride of first dimension of C
* @param {integer} strideC2 - stride of second dimension of C
* @param {NonNegativeInteger} offsetC - starting index for C
* @param {Float64Array} WORK - workspace array
* @param {integer} strideWork - stride for WORK
* @param {NonNegativeInteger} offsetWork - starting index for WORK
*/
function dlarf( side, M, N, v, strideV, offsetV, tau, C, strideC1, strideC2, offsetC, WORK, strideWork, offsetWork ) {
	var applyLeft;
	var lastv;
	var lastc;
	var ix;

	applyLeft = ( side === 'left' );
	lastv = 0;
	lastc = 0;

	if ( tau !== 0.0 ) {
		if ( applyLeft ) {
			lastv = M;
		} else {
			lastv = N;
		}
		if ( strideV > 0 ) {
			ix = offsetV + (( lastv - 1 ) * strideV);
		} else {
			ix = offsetV;
		}

		// Look for the last non-zero element in V
		while ( lastv > 0 && v[ ix ] === 0.0 ) {
			lastv -= 1;
			ix -= strideV;
		}

		if ( applyLeft ) {
			lastc = iladlc( lastv, N, C, strideC1, strideC2, offsetC ) + 1;
		} else {
			lastc = iladlr( M, lastv, C, strideC1, strideC2, offsetC ) + 1;
		}
	}

	if ( applyLeft ) {
		// Form H * C
		if ( lastv > 0 ) {
			// w(1:lastc) := C(1:lastv, 1:lastc)**T * v(1:lastv)
			dgemv( 'transpose', lastv, lastc, 1.0, C, strideC1, strideC2, offsetC, v, strideV, offsetV, 0.0, WORK, strideWork, offsetWork );

			// C(1:lastv, 1:lastc) := C(...) - tau * v(1:lastv) * w(1:lastc)**T
			dger( lastv, lastc, -tau, v, strideV, offsetV, WORK, strideWork, offsetWork, C, strideC1, strideC2, offsetC );
		}
	} else if ( lastv > 0 ) {
		// Form C * H

		// w(1:lastc) := C(1:lastc, 1:lastv) * v(1:lastv)
		dgemv( 'no-transpose', lastc, lastv, 1.0, C, strideC1, strideC2, offsetC, v, strideV, offsetV, 0.0, WORK, strideWork, offsetWork );

		// C(1:lastc, 1:lastv) := C(...) - tau * w(1:lastc) * v(1:lastv)**T
		dger( lastc, lastv, -tau, WORK, strideWork, offsetWork, v, strideV, offsetV, C, strideC1, strideC2, offsetC );
	}
}


// EXPORTS //

export default dlarf;
